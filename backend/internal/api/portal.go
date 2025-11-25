package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"

	"github/VladislavSCV/MediaWork/internal/db"
	"github/VladislavSCV/MediaWork/internal/models"
)

// ─── ВСПОМОГАТЕЛЬНОЕ ───────────────────────────────────────────────────────────

func getAdvertiserIDFromHeader(r *http.Request) (int, error) {
	// Временно: в Authorization лежит просто id рекламодателя
	raw := r.Header.Get("Authorization")
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return 0, sql.ErrNoRows
	}
	id, err := strconv.Atoi(raw)
	if err != nil {
		return 0, err
	}
	return id, nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────────

type portalLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type portalLoginResponse struct {
	Token string `json:"token"`
}

func PortalLogin(w http.ResponseWriter, r *http.Request) {
	var req portalLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if req.Email == "" || req.Password == "" {
		http.Error(w, "email and password required", http.StatusBadRequest)
		return
	}

	var (
		id           int
		storedPass   sql.NullString
		name         sql.NullString
		contact      sql.NullString
		email        sql.NullString
	)
	err := db.DB.QueryRow(
		`SELECT id, password_hash, name, contact_person, email 
		 FROM advertisers 
		 WHERE email = $1`,
		req.Email,
	).Scan(&id, &storedPass, &name, &contact, &email)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}
		http.Error(w, "login failed", http.StatusInternalServerError)
		return
	}

	// Временная логика: пароль в открытом виде
	if !storedPass.Valid || storedPass.String != req.Password {
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	resp := portalLoginResponse{
		// Временно: токен = id рекламодателя
		Token: strconv.Itoa(id),
	}
	writeJSON(w, http.StatusOK, resp)
}

// ─── ME ────────────────────────────────────────────────────────────────────────

func PortalMe(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var a models.Advertiser
	err = db.DB.QueryRow(
		`SELECT id, name, contact_person, email, phone, created_at
		 FROM advertisers
		 WHERE id = $1`,
		advID,
	).Scan(
		&a.ID,
		&a.Name,
		&a.ContactPerson,
		&a.Email,
		&a.Phone,
		&a.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "failed to load profile", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, a)
}

// ─── CAMPAIGNS LIST ───────────────────────────────────────────────────────────

func PortalCampaigns(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.DB.Query(
		`SELECT 
			id, advertiser_id, name, media_url, duration_sec, 
			start_at, end_at, created_at, status, tariff_id, total_price, billed
		 FROM campaigns
		 WHERE advertiser_id = $1
		 ORDER BY created_at DESC`,
		advID,
	)
	if err != nil {
		http.Error(w, "failed to fetch campaigns", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var res []models.Campaign
	for rows.Next() {
		var c models.Campaign
		if err := rows.Scan(
			&c.ID,
			&c.AdvertiserID,
			&c.Name,
			&c.MediaURL,
			&c.DurationSec,
			&c.StartAt,
			&c.EndAt,
			&c.CreatedAt,
			&c.Status,
			&c.TariffID,
			&c.TotalPrice,
			&c.Billed,
		); err != nil {
			http.Error(w, "scan error", http.StatusInternalServerError)
			return
		}
		res = append(res, c)
	}

	writeJSON(w, http.StatusOK, res)
}

// ─── CAMPAIGN BY ID ──────────────────────────────────────────────────────────

func PortalCampaignByID(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	cID, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		http.Error(w, "invalid campaign id", http.StatusBadRequest)
		return
	}

	var c models.Campaign
	err = db.DB.QueryRow(
		`SELECT 
			id, advertiser_id, name, media_url, duration_sec, 
			start_at, end_at, created_at, status, tariff_id, total_price, billed
		 FROM campaigns
		 WHERE id = $1 AND advertiser_id = $2`,
		cID, advID,
	).Scan(
		&c.ID,
		&c.AdvertiserID,
		&c.Name,
		&c.MediaURL,
		&c.DurationSec,
		&c.StartAt,
		&c.EndAt,
		&c.CreatedAt,
		&c.Status,
		&c.TariffID,
		&c.TotalPrice,
		&c.Billed,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
		http.Error(w, "failed to fetch campaign", http.StatusInternalServerError)
		return
	}

	writeJSON(w, http.StatusOK, c)
}

// ─── INVOICES ────────────────────────────────────────────────────────────────

type portalInvoice struct {
	ID       int     `json:"id"`
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
	Status   string  `json:"status"`
	IssuedAt string  `json:"issued_at"`
}

func PortalInvoices(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.DB.Query(
		`SELECT i.id, i.amount, i.currency, i.status, i.issued_at
		 FROM invoices i
		 JOIN campaigns c ON c.id = i.campaign_id
		 WHERE c.advertiser_id = $1
		 ORDER BY i.issued_at DESC`,
		advID,
	)
	if err != nil {
		http.Error(w, "failed to fetch invoices", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var res []portalInvoice
	for rows.Next() {
		var inv portalInvoice
		var issuedAt sql.NullTime

		if err := rows.Scan(&inv.ID, &inv.Amount, &inv.Currency, &inv.Status, &issuedAt); err != nil {
			http.Error(w, "scan error", http.StatusInternalServerError)
			return
		}
		if issuedAt.Valid {
			inv.IssuedAt = issuedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}
		res = append(res, inv)
	}

	writeJSON(w, http.StatusOK, res)
}

// ─── STATS ───────────────────────────────────────────────────────────────────

type portalStats struct {
	ActiveCampaigns int     `json:"active_campaigns"`
	PendingInvoices int     `json:"pending_invoices"`
	TotalSpent      float64 `json:"total_spent"`
}

func PortalStats(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	var stats portalStats

	// Активные кампании
	_ = db.DB.QueryRow(
		`SELECT COUNT(*) FROM campaigns 
		 WHERE advertiser_id = $1 AND status = 'active'`,
		advID,
	).Scan(&stats.ActiveCampaigns)

	// Непогашенные счета
	_ = db.DB.QueryRow(
		`SELECT COUNT(*) 
		 FROM invoices i 
		 JOIN campaigns c ON c.id = i.campaign_id
		 WHERE c.advertiser_id = $1 AND i.status = 'pending'`,
		advID,
	).Scan(&stats.PendingInvoices)

	// Потрачено (оплаченные счета)
	_ = db.DB.QueryRow(
		`SELECT COALESCE(SUM(i.amount), 0)
		 FROM invoices i
		 JOIN campaigns c ON c.id = i.campaign_id
		 WHERE c.advertiser_id = $1 AND i.status = 'paid'`,
		advID,
	).Scan(&stats.TotalSpent)

	writeJSON(w, http.StatusOK, stats)
}


// ─── STATS CHART DATA ─────────────────────────────────────────────────────────

type portalChartPoint struct {
	Day    string  `json:"day"`
	Events int     `json:"events"`
	Spent  float64 `json:"spent"`
}

func PortalStatsChart(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.DB.Query(`
        SELECT 
            to_char(pe.played_at, 'YYYY-MM-DD') AS day,
            COUNT(*) AS events,
            COALESCE(SUM(i.amount), 0) AS spent
        FROM playback_events pe
        JOIN campaigns c ON c.id = pe.campaign_id
        LEFT JOIN invoices i ON i.campaign_id = c.id AND i.status = 'paid'
        WHERE c.advertiser_id = $1
          AND pe.played_at >= now() - interval '7 days'
        GROUP BY day
        ORDER BY day ASC
    `, advID)
	if err != nil {
		http.Error(w, "chart fetch failed", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var res []portalChartPoint
	for rows.Next() {
		var p portalChartPoint
		if err := rows.Scan(&p.Day, &p.Events, &p.Spent); err != nil {
			http.Error(w, "chart scan failed", http.StatusInternalServerError)
			return
		}
		res = append(res, p)
	}

	writeJSON(w, http.StatusOK, res)
}


func PortalPayInvoice(w http.ResponseWriter, r *http.Request) {
	advID, err := getAdvertiserIDFromHeader(r)
	if err != nil {
		http.Error(w, "unauthorized", http.StatusUnauthorized)
		return
	}

	idStr := chi.URLParam(r, "id")
	invoiceID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "invalid invoice id", http.StatusBadRequest)
		return
	}

	// проверяем, что счёт принадлежит рекламодателю
	var exists bool
	err = db.DB.QueryRow(`
        SELECT true
        FROM invoices i
        JOIN campaigns c ON c.id = i.campaign_id
        WHERE i.id = $1 AND c.advertiser_id = $2`,
		invoiceID, advID,
	).Scan(&exists)
	if err != nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}

	// просто помечаем как оплаченный
	_, err = db.DB.Exec(`
        UPDATE invoices
        SET status = 'paid', paid_at = now()
        WHERE id = $1`,
		invoiceID,
	)
	if err != nil {
		http.Error(w, "payment failed", http.StatusInternalServerError)
		return
	}

	w.Write([]byte(`{"status":"ok"}`))
}
