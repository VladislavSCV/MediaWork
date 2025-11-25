package api

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

// POST /api/portal/upload
func PortalUpload(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	err = r.ParseMultipartForm(100 << 20) // 100MB limit
	if err != nil {
		http.Error(w, "bad multipart", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file missing", http.StatusBadRequest)
		return
	}
	defer file.Close()

	ext := filepath.Ext(header.Filename)
	if ext == "" {
		http.Error(w, "invalid file", http.StatusBadRequest)
		return
	}

	// путь вида: uploads/adv_2/video_17323293.mp4
	ts := strconv.FormatInt(time.Now().UnixNano(), 10)
	filename := fmt.Sprintf("adv_%d_%s%s", advID, ts, ext)
	savePath := filepath.Join("mediafacade-frontend", "public", "uploads", filename)

	// создаём папку uploads, если нет
	os.MkdirAll("uploads", os.ModePerm)

	out, err := os.Create(savePath)
	if err != nil {
		http.Error(w, "save failed", http.StatusInternalServerError)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		http.Error(w, "write failed", http.StatusInternalServerError)
		return
	}

	// Формируем URL (Next.js статика)
	url := "/uploads/" + filename

	json := fmt.Sprintf(`{"url":"%s"}`, url)
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(json))

	fmt.Println("Uploaded:", filename, "by advertiser", advID)

	// Записывать в campaigns не будем — для этого будет отдельный endpoint
}
