package handlers

import (
    "encoding/json"
    "mediawork/internal/models"
    "mediawork/internal/services"
    "net/http"
    "strconv"

    "github.com/go-chi/chi/v5"
)

type CompanyHandler struct {
    svc *services.CompanyService
}

func NewCompanyHandler(s *services.CompanyService) *CompanyHandler {
    return &CompanyHandler{svc: s}
}

func (h *CompanyHandler) Create(w http.ResponseWriter, r *http.Request) {
    var body models.Company
    json.NewDecoder(r.Body).Decode(&body)

    id, err := h.svc.CreateCompany(r.Context(), &body)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(map[string]any{"id": id})
}

func (h *CompanyHandler) List(w http.ResponseWriter, r *http.Request) {
    list, _ := h.svc.ListCompanies(r.Context(), 0, 50)
    json.NewEncoder(w).Encode(list)
}

func (h *CompanyHandler) GetDetailed(w http.ResponseWriter, r *http.Request) {
    id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)

    company, members, err := h.svc.GetDetailed(r.Context(), id)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(map[string]any{
        "company":  company,
        "members":  members,
    })
}

