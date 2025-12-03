package models

import "time"

type PlayEvent struct {
    ID            int64     `json:"id"`
    FacadeID      int64     `json:"facade_id"`
    CampaignID    int64     `json:"campaign_id"`
    SlotID        *int64    `json:"slot_id"`
    MediaURL      string    `json:"media_url"`
    PlayedAt      time.Time `json:"played_at"`
    DurationSec   int       `json:"duration_sec"`
    ResolutionW   int       `json:"resolution_w"`
    ResolutionH   int       `json:"resolution_h"`
    BitrateKbps   int       `json:"bitrate_kbps"`
    SyncLatencyMS int       `json:"sync_latency_ms"`
}
