package models

type FacadeStatus struct {
    FacadeID     int64 `json:"facade_id"`
    IsOnline     bool  `json:"is_online"`
    AvgLatencyMS int   `json:"avg_latency_ms"`
}
