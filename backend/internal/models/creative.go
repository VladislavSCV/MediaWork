package models

import "time"

type Creative struct {
    ID         int64     `json:"id"`
    CompanyID  int64     `json:"company_id"`
    CampaignID int64     `json:"campaign_id"`
    FileName   string    `json:"filename"`
    FileType   string    `json:"file_type"`
    Duration   int       `json:"duration"`   // seconds
    Resolution string    `json:"resolution"` // "1920x1080"
    UploadedAt time.Time `json:"uploaded_at"`
}
