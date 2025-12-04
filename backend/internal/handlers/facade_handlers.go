package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

type FacadeHandler struct {
    svc *services.FacadeService
}

func NewFacadeHandler(s *services.FacadeService) *FacadeHandler {
    return &FacadeHandler{svc: s}
}

func (h *FacadeHandler) Status(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    data, err := h.svc.GetStatus(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(data)
}


func (h *FacadeHandler) List(w http.ResponseWriter, r *http.Request) {
    data, err := h.svc.List(r.Context())
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(data)
}
