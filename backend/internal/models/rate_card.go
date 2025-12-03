package models

import "time"

type RateCard struct {
    ID       int64     `json:"id"`
    FacadeID int64     `json:"facade_id"`
    PriceCPM int       `json:"price_cpm"`
    CreatedAt time.Time `json:"created_at"`
}
