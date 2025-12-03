package models

import "time"

type MediaFile struct {
    ID        int64     `json:"id"`
    CompanyID int64     `json:"company_id"`
    URL       string    `json:"url"`
    Duration  int       `json:"duration"` // seconds
    CreatedAt time.Time `json:"created_at"`
}
