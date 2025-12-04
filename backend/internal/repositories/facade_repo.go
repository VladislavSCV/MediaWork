package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type FacadeRepository struct {
    db *sql.DB
}

func NewFacadeRepository(db *sql.DB) *FacadeRepository {
    return &FacadeRepository{db: db}
}

//
// --------------------- CREATE ---------------------
//
func (r *FacadeRepository) Create(ctx context.Context, f *models.Facade) error {
    query := `
        INSERT INTO facades 
            (code, name, address, latitude, longitude, 
             resolution_x, resolution_y, virtual_rows, virtual_cols,
             status, created_at, updated_at)
        VALUES 
            ($1, $2, $3, $4, $5, $6, $7, 20, 10, 'offline', NOW(), NOW())
        RETURNING id, created_at, updated_at;
    `

    return r.db.QueryRowContext(ctx, query,
        f.Code,
        f.Name,
        f.Address,
        f.Latitude,
        f.Longitude,
        f.WidthPx,
        f.HeightPx,
    ).Scan(&f.ID, &f.CreatedAt, &f.UpdatedAt)
}

//
// --------------------- GET BY ID ---------------------
//
func (r *FacadeRepository) GetByID(ctx context.Context, id int64) (*models.Facade, error) {
    q := `
        SELECT 
            id,
            code,
            name,
            address,
            latitude,
            longitude,
            resolution_x,
            resolution_y,
            virtual_rows,
            virtual_cols,
            status,
            last_ping_at,
            last_latency_ms,
            created_at,
            updated_at
        FROM facades
        WHERE id = $1
    `

    row := r.db.QueryRowContext(ctx, q, id)

    var f models.Facade

    err := row.Scan(
        &f.ID,
        &f.Code,
        &f.Name,
        &f.Address,
        &f.Latitude,
        &f.Longitude,
        &f.WidthPx,
        &f.HeightPx,
        &f.Rows,
        &f.Cols,
        &f.Status,
        &f.LastSeen,
        &f.LatencyMS,
        &f.CreatedAt,
        &f.UpdatedAt,
    )
    if err != nil {
        return nil, err
    }

    return &f, nil
}

//
// --------------------- LIST ---------------------
//
func (r *FacadeRepository) List(ctx context.Context) ([]models.Facade, error) {
    query := `
        SELECT 
            id,
            code,
            name,
            address,
            latitude,
            longitude,
            resolution_x,
            resolution_y,
            virtual_rows,
            virtual_cols,
            status,
            last_ping_at,
            last_latency_ms,
            created_at,
            updated_at
        FROM facades
        ORDER BY created_at DESC;
    `

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Facade{}

    for rows.Next() {
        var f models.Facade

        err := rows.Scan(
            &f.ID,
            &f.Code,
            &f.Name,
            &f.Address,
            &f.Latitude,
            &f.Longitude,
            &f.WidthPx,
            &f.HeightPx,
            &f.Rows,
            &f.Cols,
            &f.Status,
            &f.LastSeen,
            &f.LatencyMS,
            &f.CreatedAt,
            &f.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }

        list = append(list, f)
    }

    return list, nil
}

//
// --------------------- LIST BY CITY ---------------------
//
func (r *FacadeRepository) ListByCity(ctx context.Context, city string) ([]models.Facade, error) {
    q := `
        SELECT 
            id,
            code,
            name,
            address,
            latitude,
            longitude,
            resolution_x,
            resolution_y,
            virtual_rows,
            virtual_cols,
            status,
            last_ping_at,
            last_latency_ms,
            created_at,
            updated_at
        FROM facades
        WHERE city = $1
        ORDER BY created_at DESC
    `

    rows, err := r.db.QueryContext(ctx, q, city)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Facade{}

    for rows.Next() {
        var f models.Facade

        err := rows.Scan(
            &f.ID,
            &f.Code,
            &f.Name,
            &f.Address,
            &f.Latitude,
            &f.Longitude,
            &f.WidthPx,
            &f.HeightPx,
            &f.Rows,
            &f.Cols,
            &f.Status,
            &f.LastSeen,
            &f.LatencyMS,
            &f.CreatedAt,
            &f.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }

        result = append(result, f)
    }

    return result, nil
}

//
// --------------------- LIST BY COMPANY ---------------------
//
func (r *FacadeRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Facade, error) {
    q := `
        SELECT DISTINCT 
            f.id,
            f.code,
            f.name,
            f.address,
            f.latitude,
            f.longitude,
            f.resolution_x,
            f.resolution_y,
            f.virtual_rows,
            f.virtual_cols,
            f.status,
            f.last_ping_at,
            f.last_latency_ms,
            f.created_at,
            f.updated_at
        FROM facades f
        JOIN campaign_facades cf ON cf.facade_id = f.id
        JOIN campaigns c ON c.id = cf.campaign_id
        WHERE c.company_id = $1
        ORDER BY f.name
    `

    rows, err := r.db.QueryContext(ctx, q, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Facade{}

    for rows.Next() {
        var f models.Facade

        err := rows.Scan(
            &f.ID,
            &f.Code,
            &f.Name,
            &f.Address,
            &f.Latitude,
            &f.Longitude,
            &f.WidthPx,
            &f.HeightPx,
            &f.Rows,
            &f.Cols,
            &f.Status,
            &f.LastSeen,
            &f.LatencyMS,
            &f.CreatedAt,
            &f.UpdatedAt,
        )
        if err != nil {
            return nil, err
        }

        list = append(list, f)
    }

    return list, nil
}

//
// --------------------- UPDATE ---------------------
//
func (r *FacadeRepository) Update(ctx context.Context, f *models.Facade) error {
    q := `
        UPDATE facades
        SET 
            name = $1,
            address = $2,
            latitude = $3,
            longitude = $4,
            resolution_x = $5,
            resolution_y = $6,
            virtual_rows = $7,
            virtual_cols = $8,
            status = $9,
            updated_at = NOW()
        WHERE id = $10
    `

    _, err := r.db.ExecContext(ctx, q,
        f.Name,
        f.Address,
        f.Latitude,
        f.Longitude,
        f.WidthPx,
        f.HeightPx,
        f.Rows,
        f.Cols,
        f.Status,
        f.ID,
    )
    return err
}

//
// --------------------- DELETE ---------------------
//
func (r *FacadeRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM facades WHERE id = $1`, id)
    return err
}
