package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/ws"
)

type PlaybackEvent struct {
	ScreenID   int    `json:"screen_id"`
	CampaignID int    `json:"campaign_id"`
	PlayedAt   string `json:"played_at"`
	Duration   int    `json:"duration"`
}

func NewPlaybackHandler(hub *ws.Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var p PlaybackEvent
		json.NewDecoder(r.Body).Decode(&p)

		now := time.Now().Format(time.RFC3339)
		p.PlayedAt = now

		// пишем в БД
		_, _ = db.DB.Exec(`
            INSERT INTO playback_events (screen_id, campaign_id, played_at, duration)
            VALUES ($1,$2,$3,$4)
        `, p.ScreenID, p.CampaignID, now, p.Duration)

		// вещаем через монитор
		raw, _ := json.Marshal(p)
		hub.BroadcastMonitor(raw)

		w.Write([]byte(`{"status":"ok"}`))
	}
}
