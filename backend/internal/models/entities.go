package models

import (
	"time"
)

type Operator struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Format struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Screen struct {
	ID          int     `json:"id"`
	FormatID    int     `json:"format_id"`
	OperatorID  int     `json:"operator_id"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	DurationSec int     `json:"duration"`
	FontSizePx  *int    `json:"font_size,omitempty"`
	Comment     *string `json:"comment,omitempty"`
	TechFileURL *string `json:"tt_link,omitempty"`
}

type Facade struct {
	ID                int     `json:"id"`
	Name              string  `json:"name"`
	Description       *string `json:"description,omitempty"`
	CurrentContentURL *string `json:"current_content_url,omitempty"`
}


type Advertiser struct {
	ID            int       `json:"id"`
	Name          string    `json:"name"`
	ContactPerson string    `json:"contact_person,omitempty"`
	Email         string    `json:"email,omitempty"`
	Phone         string    `json:"phone,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type Tariff struct {
	ID              int     `json:"id"`
	Name            string  `json:"name"`
	Description     string  `json:"description,omitempty"`
	PricePerSecond  float64 `json:"price_per_second"`
	Currency        string  `json:"currency"`
	IsActive        bool    `json:"is_active"`
}

type CampaignStatus string

const (
	CampaignStatusDraft    CampaignStatus = "draft"
	CampaignStatusActive   CampaignStatus = "active"
	CampaignStatusStopped  CampaignStatus = "stopped"
	CampaignStatusFinished CampaignStatus = "finished"
)

type Campaign struct {
	ID           int            `json:"id"`
	AdvertiserID int            `json:"advertiser_id"`
	Name         string         `json:"name"`
	MediaURL     string         `json:"media_url"`
	DurationSec  int            `json:"duration_sec"`
	StartAt      time.Time      `json:"start_at"`
	EndAt        time.Time      `json:"end_at"`
	CreatedAt    time.Time      `json:"created_at"`
	Status       CampaignStatus `json:"status"`
	TariffID     *int           `json:"tariff_id,omitempty"`
	TotalPrice   *float64       `json:"total_price,omitempty"`
	Billed       bool           `json:"billed"`
}

type CampaignScreen struct {
	ID         int `json:"id"`
	CampaignID int `json:"campaign_id"`
	ScreenID   int `json:"screen_id"`
	Weight     int `json:"weight"`
}

type InvoiceStatus string

const (
	InvoiceStatusPending  InvoiceStatus = "pending"
	InvoiceStatusPaid     InvoiceStatus = "paid"
	InvoiceStatusCanceled InvoiceStatus = "cancelled"
)

type Invoice struct {
	ID        int           `json:"id"`
	CampaignID int          `json:"campaign_id"`
	Amount    float64       `json:"amount"`
	Currency  string        `json:"currency"`
	Status    InvoiceStatus `json:"status"`
	IssuedAt  time.Time     `json:"issued_at"`
	DueAt     *time.Time    `json:"due_at,omitempty"`
	PaidAt    *time.Time    `json:"paid_at,omitempty"`
}

type Payment struct {
	ID           int       `json:"id"`
	InvoiceID    int       `json:"invoice_id"`
	Amount       float64   `json:"amount"`
	Method       string    `json:"method,omitempty"`
	ExternalTxID string    `json:"external_tx_id,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
}

type PlaybackEvent struct {
	ID          int64     `json:"id"`
	CampaignID  int       `json:"campaign_id"`
	ScreenID    int       `json:"screen_id"`
	PlayedAt    time.Time `json:"played_at"`
	DurationSec int       `json:"duration_sec"`
}