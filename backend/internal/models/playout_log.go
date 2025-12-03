package models

import "time"

type PlayoutLog struct {
    ID         int64     `json:"id"`
    FacadeID   int64     `json:"facade_id"`
    CampaignID int64     `json:"campaign_id"`
    CreativeID int64     `json:"creative_id"`
    PlayedAt   time.Time `json:"played_at"`
    Duration   int       `json:"duration"`
}
