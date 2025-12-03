package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
)

type AdminHandler struct {
    svc *services.AdminService
}

func NewAdminHandler(s *services.AdminService) *AdminHandler {
    return &AdminHandler{svc: s}
}

func (h *AdminHandler) Users(w http.ResponseWriter, r *http.Request) {
    list, _ := h.svc.ListUsers(r.Context(), 0, 50)
    json.NewEncoder(w).Encode(list)
}

func (h *AdminHandler) Companies(w http.ResponseWriter, r *http.Request) {
    list, _ := h.svc.ListCompanies(r.Context(), 0, 50)
    json.NewEncoder(w).Encode(list)
}
