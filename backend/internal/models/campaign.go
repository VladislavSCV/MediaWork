package models

import "time"

type Campaign struct {
    ID          int64     `json:"id"`
    CompanyID   int64     `json:"company_id"`
    Name        string    `json:"name"`
    Description string    `json:"description"`
    StartTime   time.Time `json:"start_time"`
    EndTime     time.Time `json:"end_time"`
    Status      string    `json:"status"`
    Priority    int       `json:"priority"`
    CreatedAt   time.Time `json:"created_at"`
}
