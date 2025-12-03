package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CampaignRepository struct {
    db *sql.DB
}

func NewCampaignRepository(db *sql.DB) *CampaignRepository {
    return &CampaignRepository{db: db}
}

//
// --------------------- CREATE ---------------------
//
func (r *CampaignRepository) Create(ctx context.Context, c *models.Campaign) error {
    query := `
        INSERT INTO campaigns (company_id, name, description,
                               start_time, end_time, status, priority,
                               created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING id, created_at
    `
    return r.db.QueryRowContext(ctx, query,
        c.CompanyID, c.Name, c.Description,
        c.StartTime, c.EndTime, c.Status, c.Priority,
    ).Scan(&c.ID, &c.CreatedAt)
}

//
// --------------------- LINK FADES ---------------------
//
func (r *CampaignRepository) AttachFacades(ctx context.Context, campaignID int64, facades []int64) error {
    if len(facades) == 0 {
        return nil
    }

    query := `INSERT INTO campaign_facades (campaign_id, facade_id) VALUES ($1, $2)`

    for _, id := range facades {
        if _, err := r.db.ExecContext(ctx, query, campaignID, id); err != nil {
            return err
        }
    }
    return nil
}

//
// --------------------- LINK CREATIVES ---------------------
//
func (r *CampaignRepository) AttachCreatives(ctx context.Context, campaignID int64, creatives []int64) error {
    if len(creatives) == 0 {
        return nil
    }

    query := `UPDATE creatives SET campaign_id = $1 WHERE id = $2`

    for _, id := range creatives {
        if _, err := r.db.ExecContext(ctx, query, campaignID, id); err != nil {
            return err
        }
    }
    return nil
}

//
// --------------------- GET BY ID (FULL STRUCTURE) ---------------------
//
func (r *CampaignRepository) GetByID(ctx context.Context, id int64) (*models.CampaignFull, error) {
    // --- get main row ---
    campaignQuery := `
        SELECT id, company_id, name, description,
               start_time, end_time, status, priority,
               created_at
        FROM campaigns
        WHERE id = $1
    `

    var c models.CampaignFull

    err := r.db.QueryRowContext(ctx, campaignQuery, id).
        Scan(
            &c.ID, &c.CompanyID, &c.Name, &c.Description,
            &c.StartTime, &c.EndTime, &c.Status, &c.Priority,
            &c.CreatedAt,
        )
    if err != nil {
        return nil, err
    }

    //
    // --- facades ---
    //
    facadesQuery := `
        SELECT f.id, f.name, f.city, f.address, f.width_cells, f.height_cells,
               f.latitude, f.longitude, f.is_active, f.created_at
        FROM facades f
        JOIN campaign_facades cf ON cf.facade_id = f.id
        WHERE cf.campaign_id = $1
    `
    facadesRows, err := r.db.QueryContext(ctx, facadesQuery, id)
    if err != nil {
        return nil, err
    }
    defer facadesRows.Close()

    c.Facades = []models.Facade{}
    for facadesRows.Next() {
        var f models.Facade
        if err := facadesRows.Scan(
            &f.ID, &f.Name, &f.City, &f.Address,
            &f.WidthCells, &f.HeightCells,
            &f.Latitude, &f.Longitude,
            &f.IsActive, &f.CreatedAt,
        ); err != nil {
            return nil, err
        }
        c.Facades = append(c.Facades, f)
    }

    //
    // --- creatives ---
    //
    creativesQuery := `
        SELECT id, company_id, filename, file_type, duration, resolution,
               uploaded_at
        FROM creatives
        WHERE campaign_id = $1
    `
    creativesRows, err := r.db.QueryContext(ctx, creativesQuery, id)
    if err != nil {
        return nil, err
    }
    defer creativesRows.Close()

    c.Creatives = []models.Creative{}
    for creativesRows.Next() {
        var m models.Creative
        if err := creativesRows.Scan(
            &m.ID, &m.CompanyID, &m.FileName, &m.FileType,
            &m.Duration, &m.Resolution, &m.UploadedAt,
        ); err != nil {
            return nil, err
        }
        c.Creatives = append(c.Creatives, m)
    }

    return &c, nil
}

//
// --------------------- LIST ---------------------
//
func (r *CampaignRepository) List(ctx context.Context, limit, offset int) ([]models.Campaign, error) {
    query := `
        SELECT id, company_id, name, description, start_time, end_time,
               status, priority, created_at
        FROM campaigns
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `

    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Campaign{}
    for rows.Next() {
        var c models.Campaign
        err := rows.Scan(
            &c.ID, &c.CompanyID, &c.Name, &c.Description,
            &c.StartTime, &c.EndTime,
            &c.Status, &c.Priority,
            &c.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- LIST BY COMPANY ---------------------
//
func (r *CampaignRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Campaign, error) {
    query := `
        SELECT id, company_id, name, description, start_time, end_time,
               status, priority, created_at
        FROM campaigns
        WHERE company_id = $1
        ORDER BY created_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Campaign{}
    for rows.Next() {
        var c models.Campaign
        err := rows.Scan(
            &c.ID, &c.CompanyID, &c.Name, &c.Description,
            &c.StartTime, &c.EndTime,
            &c.Status, &c.Priority,
            &c.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- LIST ACTIVE ---------------------
//
func (r *CampaignRepository) ListActive(ctx context.Context) ([]models.Campaign, error) {
    query := `
        SELECT id, company_id, name, description, start_time, end_time,
               status, priority, created_at
        FROM campaigns
        WHERE status = 'active'
        ORDER BY priority DESC, start_time ASC
    `

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Campaign{}
    for rows.Next() {
        var c models.Campaign
        err := rows.Scan(
            &c.ID, &c.CompanyID, &c.Name, &c.Description,
            &c.StartTime, &c.EndTime,
            &c.Status, &c.Priority,
            &c.CreatedAt,
        )
        if err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- UPDATE ---------------------
//
func (r *CampaignRepository) Update(ctx context.Context, c *models.Campaign) error {
    query := `
        UPDATE campaigns
        SET name = $1,
            description = $2,
            start_time = $3,
            end_time = $4,
            status = $5,
            priority = $6
        WHERE id = $7
    `
    _, err := r.db.ExecContext(ctx, query,
        c.Name, c.Description,
        c.StartTime, c.EndTime,
        c.Status, c.Priority,
        c.ID,
    )
    return err
}

//
// --------------------- DELETE ---------------------
//
func (r *CampaignRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM campaigns WHERE id = $1`, id)
    return err
}
