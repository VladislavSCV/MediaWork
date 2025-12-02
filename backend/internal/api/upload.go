package api

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type uploadResponse struct {
	URL string `json:"url"`
}

func PortalUpload(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	// Отладка: текущая директория
	cwd, _ := os.Getwd()
	log.Printf("Current working directory: %s", cwd)
	log.Printf("Trying to create/uploads directory...")

	// читаем файл
	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file read error", 400)
		return
	}
	defer file.Close()

	// Изменяем путь на корректный
	uploadsDir := "./uploads"
	log.Printf("Creating directory: %s", uploadsDir)

	// создаём папку
	if err := os.MkdirAll(uploadsDir, 0777); err != nil {
		log.Printf("Error creating directory: %v", err)
		http.Error(w, "failed to create upload directory", 500)
		return
	}

	// финальное имя файла: advid_timestamp_original.ext
	filename := fmt.Sprintf("adv%d_%d_%s", advID, time.Now().Unix(), header.Filename)
	filepath := filepath.Join(uploadsDir, filename) // Используем Join для кроссплатформенности
	log.Printf("Saving file to: %s", filepath)

	// сохраняем файл
	out, err := os.Create(filepath)
	if err != nil {
		log.Printf("Error creating file: %v", err)
		http.Error(w, "failed to create file", 500)
		return
	}
	defer out.Close()

	_, err = io.Copy(out, file)
	if err != nil {
		log.Printf("Error copying file: %v", err)
		http.Error(w, "failed to save file", 500)
		return
	}

	// простейший анализ медиа
	duration := 10

	preview := "/api/portal/uploads/" + filename
	url := preview

	log.Printf("File saved successfully. Preview URL: %s", preview)

	writeJSON(w, 200, map[string]any{
		"status":   "ok",
		"url":      url,
		"preview":  preview,
		"duration": duration,
	})
}
