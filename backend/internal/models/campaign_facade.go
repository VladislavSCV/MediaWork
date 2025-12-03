package models

type CampaignFacade struct {
    ID              int64 `json:"id"`
    CampaignID      int64 `json:"campaign_id"`
    FacadeID        int64 `json:"facade_id"`
    SlotDurationSec int   `json:"slot_duration_sec"`
}
