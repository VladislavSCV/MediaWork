package models

import "time"

type CampaignParticipation struct {
    ID         int64     `json:"id"`
    CampaignID int64     `json:"campaign_id"`
    FacadeID   int64     `json:"facade_id"`
    CreatedAt  time.Time `json:"created_at"`
}
