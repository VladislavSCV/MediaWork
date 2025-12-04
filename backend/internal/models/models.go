package models

import "time"

//
// ─── USERS / AUTH ──────────────────────────────────────────────────────────────
//

type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	Name         string    `json:"name"` // алиас, можно использовать на фронте
	Role         string    `json:"role"`
	PasswordHash string    `json:"-"` // не отдаём наружу
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type UserClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
}

//
// ─── COMPANIES / MEMBERS ──────────────────────────────────────────────────────
//

type Company struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	OwnerID   int64     `json:"owner_id"`
	Industry  string    `json:"industry"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
}

type CompanyMember struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
	Name   string `json:"name"`
	Role   string `json:"role"`
}

//
// ─── FACADES ──────────────────────────────────────────────────────────────────
//

type Facade struct {
    ID          int64      `json:"id"`
    Code        string     `json:"code"`
    Name        string     `json:"name"`
    Address     string     `json:"address"`
    Latitude    float64    `json:"latitude"`
    Longitude   float64    `json:"longitude"`

    WidthPx     int        `json:"width_px"`
    HeightPx    int        `json:"height_px"`
    Rows        int        `json:"rows"`      // virtual_rows
    Cols        int        `json:"cols"`      // virtual_cols

    Status      string     `json:"status"`
    LastSeen    *time.Time `json:"last_seen"`
    LatencyMS   *int       `json:"latency_ms"`
    
    CreatedAt   time.Time  `json:"created_at"`
    UpdatedAt   time.Time  `json:"updated_at"`
}



type FacadeStatus struct {
	FacadeID     int64     `json:"facade_id"`
	IsOnline     bool      `json:"is_online"`
	LastSeen     time.Time `json:"last_seen"`
	LatencyMS    *int      `json:"latency_ms,omitempty"`
	AvgLatencyMS float64   `json:"avg_latency_ms"`
}

type FacadeFullStatus struct {
	Facade      *Facade       `json:"facade"`
	Status      *FacadeStatus `json:"status"`
	LastPlayed  *PlayEvent    `json:"last_played"`
	RecentPlays []PlayEvent   `json:"recent_plays"`
}

type FacadeLiveView struct {
	Status *FacadeStatus `json:"status"`
	Last   *PlayEvent    `json:"last"`
	Recent []PlayEvent   `json:"recent"`
}

//
// ─── CAMPAIGNS ────────────────────────────────────────────────────────────────
//

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

type CampaignFull struct {
	ID          int64     `json:"id"`
	CompanyID   int64     `json:"company_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Status      string    `json:"status"`
	Priority    int       `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`

	Facades   []Facade   `json:"facades"`
	Creatives []Creative `json:"creatives"`
}

type CampaignDetailed struct {
	Campaign *CampaignFull  `json:"campaign"`
	Slots    []CampaignSlot `json:"slots"`
}

type CampaignParticipation struct {
	ID         int64     `json:"id"`
	CampaignID int64     `json:"campaign_id"`
	FacadeID   int64     `json:"facade_id"`
	CreatedAt  time.Time `json:"created_at"`
}

type CampaignSlot struct {
	ID          int64     `json:"id"`
	CampaignID  int64     `json:"campaign_id"`
	FacadeID    int64     `json:"facade_id"`
	DayOfWeek   int       `json:"day_of_week"`
	StartTime   string    `json:"start_time"`
	EndTime     string    `json:"end_time"`
	DurationSec int       `json:"duration_sec"`
	Priority    int       `json:"priority"`
	CreatedAt   time.Time `json:"created_at"`
}

type ActiveSlot struct {
	SlotID       int64  `json:"slot_id"`
	CampaignID   int64  `json:"campaign_id"`
	CampaignName string `json:"campaign_name"`
	StartTime    string `json:"start_time"`
	EndTime      string `json:"end_time"`
	Priority     int    `json:"priority"`
	MediaURL     string `json:"media_url"`
}

//
// ─── CREATIVES ────────────────────────────────────────────────────────────────
//

type Creative struct {
	ID         int64     `json:"id"`
	CompanyID  int64     `json:"company_id"`
	CampaignID *int64    `json:"campaign_id,omitempty"`
	FileName   string    `json:"filename"`
	FileType   string    `json:"file_type"`
	Duration   int       `json:"duration"`
	Resolution string    `json:"resolution"`
	UploadedAt time.Time `json:"uploaded_at"`
}

//
// ─── INVOICES / BILLING ───────────────────────────────────────────────────────
//

type Invoice struct {
	ID        int64      `json:"id"`
	CompanyID int64      `json:"company_id"`
	Amount    float64    `json:"amount"`
	Period    string     `json:"period"`
	Status    string     `json:"status"`
	CreatedAt time.Time  `json:"created_at"`
	PaidAt    *time.Time `json:"paid_at,omitempty"`
}

type InvoicePDF struct {
	Invoice     Invoice       `json:"invoice"`
	Company     Company       `json:"company,omitempty"`
	PlayHistory []PlayHistory `json:"play_history"`
}

//
// ─── PLAY HISTORY / LIVE STREAM ───────────────────────────────────────────────
//

type PlayHistory struct {
	ID          int64     `json:"id"`
	FacadeID    int64     `json:"facade_id"`
	CampaignID  int64     `json:"campaign_id"`
	MediaURL    string    `json:"media_url"`
	DurationSec int       `json:"duration_sec"`
	PlayedAt    time.Time `json:"played_at"`
}

type PlayEvent struct {
	ID            int64     `json:"id"`
	FacadeID      int64     `json:"facade_id"`
	CampaignID    int64     `json:"campaign_id"`
	SlotID        int64     `json:"slot_id"`
	MediaURL      string    `json:"media_url"`
	PlayedAt      time.Time `json:"played_at"`
	DurationSec   int       `json:"duration_sec"`
	ResolutionW   int       `json:"resolution_w"`
	ResolutionH   int       `json:"resolution_h"`
	BitrateKbps   int       `json:"bitrate_kbps"`
	SyncLatencyMS int       `json:"sync_latency_ms"`
}

type Heartbeat struct {
	FacadeID  int64  `json:"facade_id"`
	LatencyMS int    `json:"latency_ms"`
	SourceIP  string `json:"source_ip"`
}
