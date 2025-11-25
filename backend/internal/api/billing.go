package api

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/models"
	"github/VladislavSCV/MediaWork/internal/services"
)

type BillingHandler struct {
	Service *services.BillingService
}

func NewBillingHandler() *BillingHandler {
	return &BillingHandler{
		Service: services.NewBillingService(db.DB),
	}
}

//
// ─── РЕКЛАМОДАТЕЛИ ────────────────────────────────────────────────────────────
//

func (h *BillingHandler) CreateAdvertiser(w http.ResponseWriter, r *http.Request) {
	var req models.Advertiser
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateAdvertiser(r.Context(), &req); err != nil {
		http.Error(w, "failed to create advertiser", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(req)
}

func (h *BillingHandler) GetAdvertisers(w http.ResponseWriter, r *http.Request) {
	items, err := h.Service.ListAdvertisers(r.Context())
	if err != nil {
		http.Error(w, "failed to fetch advertisers", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(items)
}

//
// ─── ТАРИФЫ ───────────────────────────────────────────────────────────────────
//

func (h *BillingHandler) CreateTariff(w http.ResponseWriter, r *http.Request) {
	var req models.Tariff
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "name required", http.StatusBadRequest)
		return
	}
	if req.PricePerSecond <= 0 {
		http.Error(w, "price_per_second must be > 0", http.StatusBadRequest)
		return
	}

	if err := h.Service.CreateTariff(r.Context(), &req); err != nil {
		http.Error(w, "failed to create tariff", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(req)
}

//
// ─── КАМПАНИИ ─────────────────────────────────────────────────────────────────
//

type createCampaignDTO struct {
	AdvertiserID int     `json:"advertiser_id"`
	Name         string  `json:"name"`
	MediaURL     string  `json:"media_url"`
	DurationSec  int     `json:"duration_sec"`
	StartAt      string  `json:"start_at"`
	EndAt        string  `json:"end_at"`
	TariffID     *int    `json:"tariff_id"`
	TotalPrice   *float64 `json:"total_price"`
	ScreenIDs    []int   `json:"screen_ids"`
}

func (h *BillingHandler) CreateCampaign(w http.ResponseWriter, r *http.Request) {
	var req createCampaignDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	if req.AdvertiserID <= 0 || req.Name == "" || req.MediaURL == "" {
		http.Error(w, "missing required fields", http.StatusBadRequest)
		return
	}

	start, err1 := time.Parse(time.RFC3339, req.StartAt)
	end, err2 := time.Parse(time.RFC3339, req.EndAt)
	if err1 != nil || err2 != nil {
		http.Error(w, "invalid start/end datetime", http.StatusBadRequest)
		return
	}

	c := models.Campaign{
		AdvertiserID: req.AdvertiserID,
		Name:         req.Name,
		MediaURL:     req.MediaURL,
		DurationSec:  req.DurationSec,
		StartAt:      start,
		EndAt:        end,
		Status:       models.CampaignStatusDraft,
		TariffID:     req.TariffID,
		TotalPrice:   req.TotalPrice,
	}

	if err := h.Service.CreateCampaign(r.Context(), &c, req.ScreenIDs); err != nil {
		http.Error(w, "failed to create campaign", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(c)
}

//
// ─── ВЫСТАВИТЬ СЧЁТ ───────────────────────────────────────────────────────────
//

type issueInvoiceDTO struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
	DueAt    string  `json:"due_at"`
}

func (h *BillingHandler) IssueInvoice(w http.ResponseWriter, r *http.Request) {
	campaignID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid campaign id", http.StatusBadRequest)
		return
	}

	var req issueInvoiceDTO
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	var due *time.Time
	if req.DueAt != "" {
		t, err := time.Parse(time.RFC3339, req.DueAt)
		if err != nil {
			http.Error(w, "invalid due_at", http.StatusBadRequest)
			return
		}
		due = &t
	}

	inv, err := h.Service.IssueInvoice(
		r.Context(),
		campaignID,
		req.Amount,
		req.Currency,
		due,
	)

	if err != nil {
		http.Error(w, "failed to issue invoice", http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(inv)
}
