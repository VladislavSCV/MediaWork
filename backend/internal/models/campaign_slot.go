package models

import "time"

type CampaignSlot struct {
    ID          int64     `json:"id"`
    CampaignID  int64     `json:"campaign_id"`
    DayOfWeek   int       `json:"day_of_week"` // 1–7
    StartTime   string    `json:"start_time"`  // HH:MM
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
