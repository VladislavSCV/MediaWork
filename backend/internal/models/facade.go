package models

import "time"

type Facade struct {
    ID          int64     `json:"id"`
    Name        string    `json:"name"`
    City        string    `json:"city"`
    Address     string    `json:"address"`
    WidthCells  int       `json:"width_cells"`
    HeightCells int       `json:"height_cells"`
    Latitude    float64   `json:"latitude"`
    Longitude   float64   `json:"longitude"`
    IsActive    bool      `json:"is_active"`
    CreatedAt   time.Time `json:"created_at"`
}
