package models

import "time"

type FacadeStatusLog struct {
    ID        int64     `json:"id"`
    FacadeID  int64     `json:"facade_id"`
    Status    string    `json:"status"`
    LatencyMs int       `json:"latency_ms"`
    CreatedAt time.Time `json:"created_at"`
}
