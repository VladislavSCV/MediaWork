package repositories

import (
	"context"
	"database/sql"

	"mediawork/internal/models"
)

type InvoiceRepository struct {
	db *sql.DB
}

func NewInvoiceRepository(db *sql.DB) *InvoiceRepository {
	return &InvoiceRepository{db: db}
}

// --------------------- CREATE ---------------------
func (r *InvoiceRepository) Create(ctx context.Context, inv *models.Invoice) error {
	query := `
        INSERT INTO invoices (
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            due_date,
            issued_at,
            paid_at,
            created_at,
            updated_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
        RETURNING id, created_at, issued_at
    `
	return r.db.QueryRowContext(ctx, query,
		inv.CompanyID,
		inv.InvoiceNumber,
		inv.PeriodStart,
		inv.PeriodEnd,
		inv.AmountTotal,
		inv.Currency,
		inv.Status,
		inv.DueDate,
		inv.IssuedAt,
		inv.PaidAt,
	).Scan(
		&inv.ID,
		&inv.CreatedAt,
		&inv.IssuedAt,
	)
}

// --------------------- GET BY ID ---------------------
func (r *InvoiceRepository) GetByID(ctx context.Context, id int64) (*models.Invoice, error) {
	query := `
        SELECT
            id,
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            due_date,
            issued_at,
            paid_at,
            created_at,
            updated_at
        FROM invoices
        WHERE id = $1
    `

	var inv models.Invoice

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&inv.ID,
		&inv.CompanyID,
		&inv.InvoiceNumber,
		&inv.PeriodStart,
		&inv.PeriodEnd,
		&inv.AmountTotal,
		&inv.Currency,
		&inv.Status,
		&inv.DueDate,
		&inv.IssuedAt,
		&inv.PaidAt,
		&inv.CreatedAt,
		&inv.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &inv, nil
}

// --------------------- LIST ALL ---------------------
func (r *InvoiceRepository) List(ctx context.Context) ([]models.Invoice, error) {
    query := `
        SELECT
            id,
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            due_date,
            issued_at,
            paid_at,
            created_at,
            updated_at
        FROM invoices
        ORDER BY created_at DESC
    `
    
    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    invoices := []models.Invoice{}

    for rows.Next() {
        var inv models.Invoice
        err = rows.Scan(
            &inv.ID,
            &inv.CompanyID,
            &inv.InvoiceNumber,
            &inv.PeriodStart,
            &inv.PeriodEnd,
            &inv.AmountTotal,
            &inv.Currency,
            &inv.Status,
            &inv.DueDate,
            &inv.IssuedAt,
            &inv.PaidAt,
            &inv.CreatedAt,
            &inv.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }

        invoices = append(invoices, inv)
    }

    return invoices, nil
}


// --------------------- LIST BY COMPANY ---------------------
func (r *InvoiceRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Invoice, error) {
	query := `
        SELECT
            id,
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            issued_at,
            paid_at,
            created_at
        FROM invoices
        WHERE company_id = $1
        ORDER BY created_at DESC
    `

	rows, err := r.db.QueryContext(ctx, query, companyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Invoice{}

	for rows.Next() {
		var inv models.Invoice
		if err := rows.Scan(
			&inv.ID,
			&inv.CompanyID,
			&inv.InvoiceNumber,
			&inv.PeriodStart,
			&inv.PeriodEnd,
			&inv.AmountTotal,
			&inv.Currency,
			&inv.Status,
			&inv.IssuedAt,
			&inv.PaidAt,
			&inv.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, inv)
	}

	return items, nil
}

// --------------------- LIST BY STATUS ---------------------
func (r *InvoiceRepository) ListByStatus(ctx context.Context, status string) ([]models.Invoice, error) {
	query := `
        SELECT
            id,
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            issued_at,
            paid_at,
            created_at
        FROM invoices
        WHERE status = $1
        ORDER BY created_at DESC
    `
	rows, err := r.db.QueryContext(ctx, query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.Invoice{}

	for rows.Next() {
		var inv models.Invoice
		if err := rows.Scan(
			&inv.ID,
			&inv.CompanyID,
			&inv.InvoiceNumber,
			&inv.PeriodStart,
			&inv.PeriodEnd,
			&inv.AmountTotal,
			&inv.Currency,
			&inv.Status,
			&inv.IssuedAt,
			&inv.PaidAt,
			&inv.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, inv)
	}

	return items, nil
}

// --------------------- UPDATE STATUS ---------------------
func (r *InvoiceRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
	query := `
        UPDATE invoices
        SET status = $1,
            paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END,
            updated_at = NOW()
        WHERE id = $2
    `
	_, err := r.db.ExecContext(ctx, query, status, id)
	return err
}

// --------------------- UPDATE FULL ---------------------
func (r *InvoiceRepository) Update(ctx context.Context, inv *models.Invoice) error {
	query := `
        UPDATE invoices
        SET 
            invoice_number = $1,
            period_start = $2,
            period_end = $3,
            amount_total = $4,
            currency = $5,
            status = $6,
            due_date = $7,
            issued_at = $8,
            paid_at = $9,
            updated_at = NOW()
        WHERE id = $10
    `

	_, err := r.db.ExecContext(ctx, query,
		inv.InvoiceNumber,
		inv.PeriodStart,
		inv.PeriodEnd,
		inv.AmountTotal,
		inv.Currency,
		inv.Status,
		inv.DueDate,
		inv.IssuedAt,
		inv.PaidAt,
		inv.ID,
	)
	return err
}

// --------------------- DELETE ---------------------
func (r *InvoiceRepository) Delete(ctx context.Context, id int64) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM invoices WHERE id = $1`, id)
	return err
}

// ---------- PDF DATA ----------
func (r *InvoiceRepository) PreparePDFData(ctx context.Context, invoiceID int64) (*models.InvoicePDF, error) {
	query := `
        SELECT
            id,
            company_id,
            invoice_number,
            period_start,
            period_end,
            amount_total,
            currency,
            status,
            issued_at,
            paid_at,
            created_at
        FROM invoices
        WHERE id = $1
    `

	var inv models.Invoice
	err := r.db.QueryRowContext(ctx, query, invoiceID).Scan(
		&inv.ID,
		&inv.CompanyID,
		&inv.InvoiceNumber,
		&inv.PeriodStart,
		&inv.PeriodEnd,
		&inv.AmountTotal,
		&inv.Currency,
		&inv.Status,
		&inv.IssuedAt,
		&inv.PaidAt,
		&inv.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &models.InvoicePDF{
		Invoice:     inv,
		PlayHistory: []models.PlayHistory{}, // TODO later
	}, nil
}

// ---------- SUM FOR PERIOD (start, end) ----------
func (r *InvoiceRepository) CalculateAmountForPeriod(
    ctx context.Context,
    companyID int64,
    start string, // YYYY-MM-DD
    end string,   // YYYY-MM-DD
) (float64, error) {

    query := `
        SELECT COALESCE(SUM(amount_total), 0)
        FROM invoices
        WHERE company_id = $1
          AND period_start >= $2
          AND period_end   <= $3
    `

    var sum float64
    err := r.db.QueryRowContext(ctx, query, companyID, start, end).Scan(&sum)
    return sum, err
}
