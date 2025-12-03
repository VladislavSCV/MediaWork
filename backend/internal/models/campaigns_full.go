package models

type CampaignFull struct {
    Campaign

    Facades   []Facade  `json:"facades"`
    Creatives []Creative `json:"creatives"`
}
