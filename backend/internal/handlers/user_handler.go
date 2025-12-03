package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
)

type UserHandler struct {
    users *services.UserService
}

func NewUserHandler(s *services.UserService) *UserHandler {
    return &UserHandler{users: s}
}

func (h *UserHandler) Profile(w http.ResponseWriter, r *http.Request) {
    claims := GetUserClaims(r)
    user, err := h.users.Profile(r.Context(), claims.UserID)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }
    json.NewEncoder(w).Encode(user)
}
