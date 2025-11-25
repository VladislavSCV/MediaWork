package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/models"
)

type portalCreateCampaignDTO struct {
	Name        string `json:"name"`
	MediaURL    string `json:"media_url"`
	DurationSec int    `json:"duration_sec"`
	StartAt     string `json:"start_at"`
	EndAt       string `json:"end_at"`
	TariffID    int    `json:"tariff_id"`
	ScreenIDs   []int  `json:"screen_ids"`
}

func PortalCreateCampaign(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var req portalCreateCampaignDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	start, err1 := time.Parse(time.RFC3339, req.StartAt)
	end, err2 := time.Parse(time.RFC3339, req.EndAt)
	if err1 != nil || err2 != nil {
		http.Error(w, "bad datetime", http.StatusBadRequest)
		return
	}

	// получаем тариф
	var price float64
	err = db.DB.QueryRow(
		`SELECT price_per_second FROM tariffs WHERE id = $1`,
		req.TariffID,
	).Scan(&price)
	if err != nil {
		http.Error(w, "invalid tariff", http.StatusBadRequest)
		return
	}

	// считаем цену кампании
	totalPrice := float64(req.DurationSec) * price

	// создаем кампанию
	var campaignID int
	err = db.DB.QueryRow(`
        INSERT INTO campaigns 
        (advertiser_id, name, media_url, duration_sec, start_at, end_at, status, tariff_id, total_price, billed)
        VALUES ($1,$2,$3,$4,$5,$6,'draft',$7,$8,false)
        RETURNING id
    `, advID, req.Name, req.MediaURL, req.DurationSec, start, end, req.TariffID, totalPrice).Scan(&campaignID)

	if err != nil {
		http.Error(w, "create campaign failed", http.StatusInternalServerError)
		return
	}

	// привязка к экранам
	for _, sid := range req.ScreenIDs {
		_, _ = db.DB.Exec(`
            INSERT INTO campaign_screens (campaign_id, screen_id, weight)
            VALUES ($1,$2,1)
        `, campaignID, sid)
	}

	// автосоздание счёта
	_, err = db.DB.Exec(`
        INSERT INTO invoices (campaign_id, amount, currency, status)
        VALUES ($1,$2,'RUB','pending')
    `, campaignID, totalPrice)

	if err != nil {
		http.Error(w, "invoice create failed", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status":"ok","campaign_id":` + strconv.Itoa(campaignID) + `}`))
}
