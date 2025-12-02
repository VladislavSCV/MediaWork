// internal/api/facades.go
package api

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/models"
	"github/VladislavSCV/MediaWork/internal/ws"
)

type FacadeHandler struct {
	Hub *ws.Hub
}

func CreateFacade(w http.ResponseWriter, r *http.Request) {
	var f models.Facade
	if err := json.NewDecoder(r.Body).Decode(&f); err != nil {
		writeErr(w, err, 400)
		return
	}

	_, err := db.DB.ExecContext(r.Context(),
		`INSERT INTO facades (name, description) VALUES ($1, $2)`,
		f.Name, f.Description)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	writeJSON(w, 201, map[string]string{"status": "created"})
}

func DeleteFacade(w http.ResponseWriter, r *http.Request) {
	idStr := chi.URLParam(r, "id")
	id, _ := strconv.Atoi(idStr)

	_, err := db.DB.ExecContext(r.Context(), `DELETE FROM facades WHERE id=$1`, id)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	writeJSON(w, 200, map[string]string{"deleted": idStr})
}

// TEMP: без БД, просто WS + лог
func (h *FacadeHandler) UpdateFacadeContent(w http.ResponseWriter, r *http.Request) {
    idStr := chi.URLParam(r, "id")
    id, err := strconv.Atoi(idStr)
    if err != nil {
        writeErr(w, err, 400)
        return
    }

    var body struct {
        Src string `json:"src"`
    }
    if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
        writeErr(w, err, 400)
        return
    }

    fmt.Println("📨 HTTP content update for facade", id, "src=", body.Src)

    payload, _ := json.Marshal(map[string]any{
        "type":    "content_update",
        "src":     body.Src,
        "startAt": time.Now().UnixMilli(),
    })

    // 🔥 новое имя метода!
    h.Hub.BroadcastToFacade(id, payload)

    writeJSON(w, 200, map[string]string{"status": "broadcasted"})
}

// Получение списка фасадов
func GetFacades(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	rows, err := db.DB.QueryContext(ctx,
		`SELECT id, name, description, current_content_url FROM facades ORDER BY id`)
	if err != nil {
		writeErr(w, err, 500)
		return
	}
	defer rows.Close()

	var facades []models.Facade
	for rows.Next() {
		var f models.Facade
		if err := rows.Scan(&f.ID, &f.Name, &f.Description, &f.CurrentContentURL); err != nil {
			writeErr(w, err, 500)
			return
		}
		facades = append(facades, f)
	}

	writeJSON(w, 200, facades)
}
