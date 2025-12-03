package models

type CampaignSchedule struct {
    ID         int64  `json:"id"`
    CampaignID int64  `json:"campaign_id"`
    DayOfWeek  int    `json:"day_of_week"` // 1..7
    StartTime  string `json:"start_time"`  // "06:00"
    EndTime    string `json:"end_time"`    // "09:00"
}
