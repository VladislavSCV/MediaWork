package handlers

import (
    "encoding/json"
    "mediawork/internal/models"
    "mediawork/internal/services"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

type CampaignHandler struct {
    svc *services.CampaignService
}

func NewCampaignHandler(s *services.CampaignService) *CampaignHandler {
    return &CampaignHandler{svc: s}
}

type campaignCreateRequest struct {
    Campaign models.Campaign       `json:"campaign"`
    Slots    []models.CampaignSlot `json:"slots"`
}

func (h *CampaignHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req campaignCreateRequest
    json.NewDecoder(r.Body).Decode(&req)

    id, err := h.svc.Create(r.Context(), &req.Campaign, req.Slots)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(map[string]any{"id": id})
}

func (h *CampaignHandler) Get(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    data, err := h.svc.GetDetailed(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(data)
}
