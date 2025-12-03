package handlers

import (
    "encoding/json"
    "mediawork/internal/models"
    "mediawork/internal/services"
    "net/http"
)

type LiveHandler struct {
    svc *services.LiveStreamService
}

func NewLiveHandler(s *services.LiveStreamService) *LiveHandler {
    return &LiveHandler{svc: s}
}

func (h *LiveHandler) Heartbeat(w http.ResponseWriter, r *http.Request) {
    var hb models.Heartbeat
    json.NewDecoder(r.Body).Decode(&hb)

    _ = h.svc.Heartbeat(r.Context(), &hb)
    w.WriteHeader(200)
}

func (h *LiveHandler) PlayEvent(w http.ResponseWriter, r *http.Request) {
    var ev models.PlayEvent
    json.NewDecoder(r.Body).Decode(&ev)

    _ = h.svc.PlayEvent(r.Context(), &ev)
    w.WriteHeader(200)
}
