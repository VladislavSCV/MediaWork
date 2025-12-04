package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

type InvoiceHandler struct {
    svc *services.BillingService
}

func NewInvoiceHandler(s *services.BillingService) *InvoiceHandler {
    return &InvoiceHandler{svc: s}
}

func (h *InvoiceHandler) GetPDF(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    data, err := h.svc.PreparePDF(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(data)
}

func (h *InvoiceHandler) List(w http.ResponseWriter, r *http.Request) {
    data, err := h.svc.List(r.Context())
    if err != nil {
        http.Error(w, err.Error(), 500)
        return
    }

    json.NewEncoder(w).Encode(data)
}
