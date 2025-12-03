package models

import "time"

type Invoice struct {
    ID        int64     `json:"id"`
    CompanyID int64     `json:"company_id"`
    Amount    float64   `json:"amount"`
    Period    string    `json:"period"`   // "Oct 2025"
    Status    string    `json:"status"`   // pending | paid | overdue
    CreatedAt time.Time `json:"created_at"`
    PaidAt    *time.Time `json:"paid_at"` // null если не оплачен
}
