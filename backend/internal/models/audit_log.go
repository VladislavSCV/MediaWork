package models

import "time"

type AuditLog struct {
    ID        int64     `json:"id"`
    UserID    int64     `json:"user_id"`
    Action    string    `json:"action"`
    Entity    string    `json:"entity"`  // "campaign", "facade", "invoice"...
    EntityID  int64     `json:"entity_id"`
    CreatedAt time.Time `json:"created_at"`
}
