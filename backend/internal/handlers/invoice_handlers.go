package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"

	"mediawork/internal/models"
	"mediawork/internal/services"
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

func (h *InvoiceHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    inv, err := h.svc.GetByID(r.Context(), id)
    if err != nil {
        http.Error(w, "invoice not found", 404)
        return
    }

    json.NewEncoder(w).Encode(inv)
}

func (h *InvoiceHandler) Create(w http.ResponseWriter, r *http.Request) {
    var inv models.Invoice

    // Парсим тело запроса
    err := json.NewDecoder(r.Body).Decode(&inv)
    if err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // Создаем инвойс с помощью сервиса
    err = h.svc.Create(r.Context(), &inv)
    if err != nil {
        http.Error(w, "Failed to create invoice", http.StatusInternalServerError)
        return
    }

    // Отправляем успешный ответ
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(inv)
}