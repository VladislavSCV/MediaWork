package models

import "time"

type Company struct {
    ID        int64     `json:"id"`
    Name      string    `json:"name"`
    OwnerID   int64     `json:"owner_id"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
}
