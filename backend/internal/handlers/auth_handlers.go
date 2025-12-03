package handlers

import (
    "encoding/json"
    "mediawork/internal/services"
    "net/http"
)

type AuthHandler struct {
    auth *services.AuthService
}

func NewAuthHandler(auth *services.AuthService) *AuthHandler {
    return &AuthHandler{auth: auth}
}

type loginRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req loginRequest
    json.NewDecoder(r.Body).Decode(&req)

    token, user, err := h.auth.Login(r.Context(), req.Email, req.Password)
    if err != nil {
        http.Error(w, "invalid credentials", 401)
        return
    }

    json.NewEncoder(w).Encode(map[string]interface{}{
        "token": token,
        "user":  user,
    })
}

type registerRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
    Name     string `json:"name"`
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
    var req registerRequest
    json.NewDecoder(r.Body).Decode(&req)

    user, err := h.auth.Register(r.Context(), req.Email, req.Password, req.Name)
    if err != nil {
        http.Error(w, err.Error(), 400)
        return
    }

    json.NewEncoder(w).Encode(user)
}
