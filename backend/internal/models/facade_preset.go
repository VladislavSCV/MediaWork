package models

import "time"

type FacadePreset struct {
    ID               int64     `json:"id"`
    FacadeID         int64     `json:"facade_id"`
    Name             string    `json:"name"`
    Brightness       int       `json:"brightness"`
    ColorTemperature int       `json:"color_temperature"`
    CreatedAt        time.Time `json:"created_at"`
}
