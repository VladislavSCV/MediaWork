package models

type UserCompanyRole struct {
    UserID    int64  `json:"user_id"`
    CompanyID int64  `json:"company_id"`
    Role      string `json:"role"` // admin, editor, viewer
}
