package api

import (
	"context"
	"net/http"
	"time"

	"github/VladislavSCV/MediaWork/internal/db"
)

// Получение форматов экранов
func GetFormats(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, `SELECT id, name FROM formats ORDER BY id`)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	defer rows.Close()

	var res []map[string]any
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			writeErr(w, err, 500)
			return
		}
		res = append(res, map[string]any{"id": id, "name": name})
	}

	writeJSON(w, 200, res)
}

// Получение операторов экранов
func GetOperators(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx, `SELECT id, name FROM operators ORDER BY id`)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	defer rows.Close()

	var res []map[string]any
	for rows.Next() {
		var id int
		var name string
		if err := rows.Scan(&id, &name); err != nil {
			writeErr(w, err, 500)
			return
		}
		res = append(res, map[string]any{"id": id, "name": name})
	}

	writeJSON(w, 200, res)
}
