package models

import "time"

type User struct {
    ID        int64     `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    Password  string    `json:"-"` // не возвращаем в JSON
    Role      string    `json:"role"` // global role: superadmin, support, viewer
    CreatedAt time.Time `json:"created_at"`
}
