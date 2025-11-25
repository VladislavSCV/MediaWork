package services

import (
	"context"
	"database/sql"
	"time"

	"github/VladislavSCV/MediaWork/internal/models"
)

type BillingService struct {
	db *sql.DB
}

func NewBillingService(db *sql.DB) *BillingService {
	return &BillingService{db: db}
}

// Создать рекламодателя
func (s *BillingService) CreateAdvertiser(ctx context.Context, a *models.Advertiser) error {
	query := `
		INSERT INTO advertisers (name, contact_person, email, phone)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`
	return s.db.QueryRowContext(ctx, query,
		a.Name,
		a.ContactPerson,
		a.Email,
		a.Phone,
	).Scan(&a.ID, &a.CreatedAt)
}

// Получить список рекламодателей (без фильтров, упрощённо)
func (s *BillingService) ListAdvertisers(ctx context.Context) ([]models.Advertiser, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, name, contact_person, email, phone, created_at FROM advertisers ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []models.Advertiser
	for rows.Next() {
		var a models.Advertiser
		if err := rows.Scan(
			&a.ID,
			&a.Name,
			&a.ContactPerson,
			&a.Email,
			&a.Phone,
			&a.CreatedAt,
		); err != nil {
			return nil, err
		}
		res = append(res, a)
	}
	return res, rows.Err()
}

// Создать тариф
func (s *BillingService) CreateTariff(ctx context.Context, t *models.Tariff) error {
	query := `
		INSERT INTO tariffs (name, description, price_per_second, currency, is_active)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`
	return s.db.QueryRowContext(ctx, query,
		t.Name,
		t.Description,
		t.PricePerSecond,
		t.Currency,
		t.IsActive,
	).Scan(&t.ID)
}

// Создать кампанию + привязки к экранам
func (s *BillingService) CreateCampaign(
	ctx context.Context,
	c *models.Campaign,
	screenIDs []int,
) error {
	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	qCampaign := `
		INSERT INTO campaigns (
			advertiser_id, name, media_url, duration_sec,
			start_at, end_at, status, tariff_id, total_price, billed
		)
		VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7, $8, FALSE)
		RETURNING id, created_at
	`

	if err := tx.QueryRowContext(ctx, qCampaign,
		c.AdvertiserID,
		c.Name,
		c.MediaURL,
		c.DurationSec,
		c.StartAt,
		c.EndAt,
		c.TariffID,
		c.TotalPrice,
	).Scan(&c.ID, &c.CreatedAt); err != nil {
		return err
	}

	qScreen := `
		INSERT INTO campaign_screens (campaign_id, screen_id, weight)
		VALUES ($1, $2, 1)
	`
	for _, sID := range screenIDs {
		if _, err := tx.ExecContext(ctx, qScreen, c.ID, sID); err != nil {
			return err
		}
	}

	return tx.Commit()
}

// Выписать счёт по кампании
func (s *BillingService) IssueInvoice(
	ctx context.Context,
	campaignID int,
	amount float64,
	currency string,
	dueAt *time.Time,
) (*models.Invoice, error) {
	inv := &models.Invoice{
		CampaignID: campaignID,
		Amount:     amount,
		Currency:   currency,
		Status:     models.InvoiceStatusPending,
		DueAt:      dueAt,
	}

	query := `
		INSERT INTO invoices (campaign_id, amount, currency, status, due_at)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, issued_at
	`
	if err := s.db.QueryRowContext(ctx, query,
		inv.CampaignID,
		inv.Amount,
		inv.Currency,
		inv.Status,
		inv.DueAt,
	).Scan(&inv.ID, &inv.IssuedAt); err != nil {
		return nil, err
	}

	return inv, nil
}
