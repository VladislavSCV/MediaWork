package models

import "time"

type Payment struct {
    ID        int64     `json:"id"`
    InvoiceID int64     `json:"invoice_id"`
    Amount    int64     `json:"amount"`
    PaidAt    time.Time `json:"paid_at"`
}
