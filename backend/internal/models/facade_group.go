package models

import "time"

type FacadeGroup struct {
    ID        int64     `json:"id"`
    Name      string    `json:"name"`
    City      string    `json:"city"`
    CreatedAt time.Time `json:"created_at"`
}
