package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CreativeRepository struct {
    db *sql.DB
}

func NewCreativeRepository(db *sql.DB) *CreativeRepository {
    return &CreativeRepository{db: db}
}

//
// --------------------- CREATE / UPLOAD ---------------------
//
func (r *CreativeRepository) Create(ctx context.Context, c *models.Creative) error {
    query := `
        INSERT INTO creatives (company_id, campaign_id, filename, file_type,
                               duration, resolution, uploaded_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id, uploaded_at
    `
    return r.db.QueryRowContext(ctx, query,
        c.CompanyID,
        c.CampaignID,
        c.FileName,
        c.FileType,
        c.Duration,
        c.Resolution,
    ).Scan(&c.ID, &c.UploadedAt)
}

//
// --------------------- GET BY ID ---------------------
//
func (r *CreativeRepository) GetByID(ctx context.Context, id int64) (*models.Creative, error) {
    query := `
        SELECT id, company_id, campaign_id, filename, file_type,
               duration, resolution, uploaded_at
        FROM creatives
        WHERE id = $1
    `

    var c models.Creative
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(
            &c.ID, &c.CompanyID, &c.CampaignID,
            &c.FileName, &c.FileType,
            &c.Duration, &c.Resolution,
            &c.UploadedAt,
        )
    if err != nil {
        return nil, err
    }
    return &c, nil
}

//
// --------------------- LIST ALL ---------------------
//
func (r *CreativeRepository) List(ctx context.Context, limit, offset int) ([]models.Creative, error) {
    query := `
        SELECT id, company_id, campaign_id, filename, file_type,
               duration, resolution, uploaded_at
        FROM creatives
        ORDER BY uploaded_at DESC
        LIMIT $1 OFFSET $2
    `

    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Creative{}
    for rows.Next() {
        var c models.Creative
        if err := rows.Scan(
            &c.ID, &c.CompanyID, &c.CampaignID,
            &c.FileName, &c.FileType,
            &c.Duration, &c.Resolution,
            &c.UploadedAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- LIST BY COMPANY ---------------------
//
func (r *CreativeRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Creative, error) {
    query := `
        SELECT id, company_id, campaign_id, filename, file_type,
               duration, resolution, uploaded_at
        FROM creatives
        WHERE company_id = $1
        ORDER BY uploaded_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Creative{}
    for rows.Next() {
        var c models.Creative
        if err := rows.Scan(
            &c.ID, &c.CompanyID, &c.CampaignID,
            &c.FileName, &c.FileType,
            &c.Duration, &c.Resolution,
            &c.UploadedAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- LIST BY CAMPAIGN ---------------------
//
func (r *CreativeRepository) ListByCampaign(ctx context.Context, campaignID int64) ([]models.Creative, error) {
    query := `
        SELECT id, company_id, campaign_id, filename, file_type,
               duration, resolution, uploaded_at
        FROM creatives
        WHERE campaign_id = $1
        ORDER BY uploaded_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query, campaignID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Creative{}
    for rows.Next() {
        var c models.Creative
        if err := rows.Scan(
            &c.ID, &c.CompanyID, &c.CampaignID,
            &c.FileName, &c.FileType,
            &c.Duration, &c.Resolution,
            &c.UploadedAt,
        ); err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- ASSIGN TO CAMPAIGN ---------------------
//
func (r *CreativeRepository) AssignToCampaign(ctx context.Context, creativeID, campaignID int64) error {
    query := `
        UPDATE creatives
        SET campaign_id = $1
        WHERE id = $2
    `
    _, err := r.db.ExecContext(ctx, query, campaignID, creativeID)
    return err
}

//
// --------------------- UPDATE META ---------------------
//
func (r *CreativeRepository) UpdateMeta(ctx context.Context, c *models.Creative) error {
    query := `
        UPDATE creatives
        SET file_type = $1,
            duration = $2,
            resolution = $3
        WHERE id = $4
    `
    _, err := r.db.ExecContext(ctx, query,
        c.FileType,
        c.Duration,
        c.Resolution,
        c.ID,
    )
    return err
}

//
// --------------------- DELETE ---------------------
//
func (r *CreativeRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM creatives WHERE id = $1`, id)
    return err
}
