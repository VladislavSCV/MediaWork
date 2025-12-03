package models

type UserPreferences struct {
    UserID      int64  `json:"user_id"`
    Language    string `json:"language"`
    Theme       string `json:"theme"`
    QuietMode   bool   `json:"quiet_mode"`
}
