package api

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/models"
)

// =======================
// 🔹 Получение экранов
// =======================
func GetScreens(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, `
		SELECT s.id, f.name AS format_name, o.name AS operator_name,
		       s.width, s.height, s.duration_sec
		  FROM screens s
		  LEFT JOIN formats f ON s.format_id = f.id
		  LEFT JOIN operators o ON s.operator_id = o.id`)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	defer rows.Close()

	var res []map[string]any
	for rows.Next() {
		var (
			id, width, height, dur int
			format, operator       sql.NullString
		)
		if err := rows.Scan(&id, &format, &operator, &width, &height, &dur); err != nil {
			writeErr(w, err, 500)
			return
		}
		res = append(res, map[string]any{
			"id":            id,
			"format_name":   format.String,
			"operator_name": operator.String,
			"width":         width,
			"height":        height,
			"duration":      dur,
		})
	}
	writeJSON(w, 200, res)
}

// =======================
// 🔹 Создание экрана
// =======================
func CreateScreen(w http.ResponseWriter, r *http.Request) {
	var s models.Screen
	if err := json.NewDecoder(r.Body).Decode(&s); err != nil {
		writeErr(w, err, 400)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err := db.DB.ExecContext(ctx, `
		INSERT INTO screens (
			format_id, operator_id, width, height,
			duration_sec, font_size_px, comment, tech_file_url
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
	`,
		s.FormatID, s.OperatorID, s.Width, s.Height,
		s.DurationSec, s.FontSizePx, s.Comment, s.TechFileURL)
	if err != nil {
		writeErr(w, err, 500)
		return
	}

	writeJSON(w, 201, map[string]string{"status": "ok"})
}

// =======================
// 🔹 Удаление экрана
// =======================
func DeleteScreen(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeErr(w, err, 400)
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	_, err = db.DB.ExecContext(ctx, `DELETE FROM screens WHERE id=$1`, id)
	if err != nil {
		writeErr(w, err, 500)
		return
	}

	writeJSON(w, 200, map[string]string{"deleted": idStr})
}
