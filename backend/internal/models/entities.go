package models

type Operator struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Format struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type Screen struct {
	ID          int     `json:"id"`
	FormatID    int     `json:"format_id"`
	OperatorID  int     `json:"operator_id"`
	Width       int     `json:"width"`
	Height      int     `json:"height"`
	DurationSec int     `json:"duration"`
	FontSizePx  *int    `json:"font_size,omitempty"`
	Comment     *string `json:"comment,omitempty"`
	TechFileURL *string `json:"tt_link,omitempty"`
}

type Facade struct {
	ID                int     `json:"id"`
	Name              string  `json:"name"`
	Description       *string `json:"description,omitempty"`
	CurrentContentURL *string `json:"current_content_url,omitempty"`
}
