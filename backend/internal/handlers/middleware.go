package handlers

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/services"
    "net/http"
    "strings"
)

type contextKey string
var userKey contextKey = "user"

func AuthMiddleware(auth *services.AuthService) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

            authHeader := r.Header.Get("Authorization")
            if authHeader == "" {
                http.Error(w, "unauthorized", 401)
                return
            }

            token := strings.TrimPrefix(authHeader, "Bearer ")

            claims, err := auth.ParseToken(token)
            if err != nil {
                http.Error(w, "invalid token", 401)
                return
            }

            ctx := context.WithValue(r.Context(), userKey, claims)
            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}

func GetUserClaims(r *http.Request) *models.UserClaims {
    val := r.Context().Value(userKey)
    if val == nil { return nil }
    return val.(*models.UserClaims)
}

func RoleGuard(role string) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            claims := GetUserClaims(r)
            if claims == nil || claims.Role != role {
                http.Error(w, "forbidden", 403)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}
