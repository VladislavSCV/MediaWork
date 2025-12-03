package models

type CampaignCreative struct {
    ID         int64 `json:"id"`
    CampaignID int64 `json:"campaign_id"`
    MediaID    int64 `json:"media_id"`
    OrderIndex int   `json:"order_index"`
}
