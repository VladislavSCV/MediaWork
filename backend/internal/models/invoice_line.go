package models

type InvoiceLine struct {
    ID         int64  `json:"id"`
    InvoiceID  int64  `json:"invoice_id"`
    CampaignID int64  `json:"campaign_id"`
    FacadeID   int64  `json:"facade_id"`
    Spots      int    `json:"spots"`
    Amount     int64  `json:"amount"`
}
