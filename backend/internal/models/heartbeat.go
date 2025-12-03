package models

type Heartbeat struct {
    FacadeID   int64  `json:"facade_id"`
    LatencyMS  int    `json:"latency_ms"`
    SourceIP   string `json:"source_ip"`
}
