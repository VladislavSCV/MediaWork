package models

import "time"

type UserAPIToken struct {
    ID        int64     `json:"id"`
    UserID    int64     `json:"user_id"`
    Token     string    `json:"token"`
    CreatedAt time.Time `json:"created_at"`
}
