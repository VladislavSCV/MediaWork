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

//
// --------------------- CREATE ---------------------
//
func (r *InvoiceRepository) Create(ctx context.Context, inv *models.Invoice) error {
    query := `
        INSERT INTO invoices (company_id, amount, period, status, created_at, paid_at)
        VALUES ($1, $2, $3, $4, NOW(), $5)
        RETURNING id, created_at
    `
    return r.db.QueryRowContext(ctx, query,
        inv.CompanyID,
        inv.Amount,
        inv.Period,
        inv.Status,
        inv.PaidAt,
    ).Scan(&inv.ID, &inv.CreatedAt)
}

//
// --------------------- GET BY ID ---------------------
//
func (r *InvoiceRepository) GetByID(ctx context.Context, id int64) (*models.Invoice, error) {
    query := `
        SELECT id, company_id, amount, period, status, created_at, paid_at
        FROM invoices
        WHERE id = $1
    `
    var inv models.Invoice

    err := r.db.QueryRowContext(ctx, query, id).
        Scan(
            &inv.ID,
            &inv.CompanyID,
            &inv.Amount,
            &inv.Period,
            &inv.Status,
            &inv.CreatedAt,
            &inv.PaidAt,
        )

    if err != nil {
        return nil, err
    }

    return &inv, nil
}

//
// --------------------- LIST ALL ---------------------
//
func (r *InvoiceRepository) List(ctx context.Context, limit, offset int) ([]models.Invoice, error) {
    query := `
        SELECT id, company_id, amount, period, status, created_at, paid_at
        FROM invoices
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `
    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Invoice{}
    for rows.Next() {
        var inv models.Invoice
        if err := rows.Scan(
            &inv.ID, &inv.CompanyID, &inv.Amount,
            &inv.Period, &inv.Status, &inv.CreatedAt,
            &inv.PaidAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, inv)
    }

    return list, nil
}

//
// --------------------- LIST BY COMPANY ---------------------
//
func (r *InvoiceRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Invoice, error) {
    query := `
        SELECT id, company_id, amount, period, status, created_at, paid_at
        FROM invoices
        WHERE company_id = $1
        ORDER BY created_at DESC
    `
    rows, err := r.db.QueryContext(ctx, query, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Invoice{}
    for rows.Next() {
        var inv models.Invoice
        if err := rows.Scan(
            &inv.ID, &inv.CompanyID, &inv.Amount,
            &inv.Period, &inv.Status, &inv.CreatedAt,
            &inv.PaidAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, inv)
    }

    return list, nil
}

//
// --------------------- LIST BY STATUS ---------------------
//
func (r *InvoiceRepository) ListByStatus(ctx context.Context, status string) ([]models.Invoice, error) {
    query := `
        SELECT id, company_id, amount, period, status, created_at, paid_at
        FROM invoices
        WHERE status = $1
        ORDER BY created_at DESC
    `
    rows, err := r.db.QueryContext(ctx, query, status)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Invoice{}
    for rows.Next() {
        var inv models.Invoice
        if err := rows.Scan(
            &inv.ID, &inv.CompanyID, &inv.Amount,
            &inv.Period, &inv.Status, &inv.CreatedAt,
            &inv.PaidAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, inv)
    }

    return list, nil
}

//
// --------------------- UPDATE STATUS ---------------------
//
func (r *InvoiceRepository) UpdateStatus(ctx context.Context, id int64, status string) error {
    query := `
        UPDATE invoices
        SET status = $1,
            paid_at = CASE WHEN $1 = 'paid' THEN NOW() ELSE paid_at END
        WHERE id = $2
    `
    _, err := r.db.ExecContext(ctx, query, status, id)
    return err
}

//
// --------------------- UPDATE FULL ---------------------
//
func (r *InvoiceRepository) Update(ctx context.Context, inv *models.Invoice) error {
    query := `
        UPDATE invoices
        SET amount = $1,
            period = $2,
            status = $3,
            paid_at = $4
        WHERE id = $5
    `
    _, err := r.db.ExecContext(ctx, query,
        inv.Amount,
        inv.Period,
        inv.Status,
        inv.PaidAt,
        inv.ID,
    )
    return err
}

//
// --------------------- DELETE ---------------------
//
func (r *InvoiceRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM invoices WHERE id = $1`, id)
    return err
}

//
// ---------- SUM FOR PERIOD (start, end) ----------
//
func (r *InvoiceRepository) CalculateAmountForPeriod(
    ctx context.Context,
    companyID int64,
    startPeriod string,
    endPeriod string,
) (float64, error) {

    query := `
        SELECT COALESCE(SUM(amount), 0)
        FROM invoices
        WHERE company_id = $1
          AND period BETWEEN $2 AND $3
    `
    var sum float64
    err := r.db.QueryRowContext(ctx, query, companyID, startPeriod, endPeriod).Scan(&sum)
    return sum, err
}

//
// ---------- PDF DATA ----------
//
func (r *InvoiceRepository) PreparePDFData(ctx context.Context, invoiceID int64) (*models.InvoicePDF, error) {
    query := `
        SELECT id, company_id, amount, period, status, created_at, paid_at
        FROM invoices
        WHERE id = $1
    `
    var inv models.Invoice
    err := r.db.QueryRowContext(ctx, query, invoiceID).
        Scan(&inv.ID, &inv.CompanyID, &inv.Amount, &inv.Period, &inv.Status, &inv.CreatedAt, &inv.PaidAt)
    if err != nil {
        return nil, err
    }

    return &models.InvoicePDF{
        Invoice:     inv,
        PlayHistory: []models.PlayHistory{}, // пока mock
    }, nil
}
