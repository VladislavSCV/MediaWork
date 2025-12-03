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
        INSERT INTO facades (name, city, address, width_cells, height_cells,
                             latitude, longitude, is_active, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id, created_at
    `

    return r.db.QueryRowContext(ctx, query,
        f.Name, f.City, f.Address,
        f.WidthCells, f.HeightCells,
        f.Latitude, f.Longitude,
        f.IsActive,
    ).Scan(&f.ID, &f.CreatedAt)
}

//
// --------------------- GET BY ID ---------------------
//
func (r *FacadeRepository) GetByID(ctx context.Context, id int64) (*models.Facade, error) {
    query := `
        SELECT id, name, city, address, width_cells, height_cells,
               latitude, longitude, is_active, created_at
        FROM facades
        WHERE id = $1
    `
    var f models.Facade
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(
            &f.ID, &f.Name, &f.City, &f.Address,
            &f.WidthCells, &f.HeightCells,
            &f.Latitude, &f.Longitude,
            &f.IsActive, &f.CreatedAt,
        )
    if err != nil {
        return nil, err
    }
    return &f, nil
}

//
// --------------------- LIST (с пагинацией) ---------------------
//
func (r *FacadeRepository) List(ctx context.Context, limit, offset int) ([]models.Facade, error) {
    query := `
        SELECT id, name, city, address, width_cells, height_cells,
               latitude, longitude, is_active, created_at
        FROM facades
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `

    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Facade{}
    for rows.Next() {
        var f models.Facade
        if err := rows.Scan(
            &f.ID, &f.Name, &f.City, &f.Address,
            &f.WidthCells, &f.HeightCells,
            &f.Latitude, &f.Longitude,
            &f.IsActive, &f.CreatedAt,
        ); err != nil {
            return nil, err
        }
        result = append(result, f)
    }
    return result, nil
}

//
// --------------------- LIST BY CITY ---------------------
//
func (r *FacadeRepository) ListByCity(ctx context.Context, city string) ([]models.Facade, error) {
    query := `
        SELECT id, name, city, address, width_cells, height_cells,
               latitude, longitude, is_active, created_at
        FROM facades
        WHERE city = $1
        ORDER BY created_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query, city)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Facade{}
    for rows.Next() {
        var f models.Facade
        if err := rows.Scan(
            &f.ID, &f.Name, &f.City, &f.Address,
            &f.WidthCells, &f.HeightCells,
            &f.Latitude, &f.Longitude,
            &f.IsActive, &f.CreatedAt,
        ); err != nil {
            return nil, err
        }
        result = append(result, f)
    }
    return result, nil
}

//
// --------------------- LIST BY COMPANY (через campaign_facades) ---------------------
//
func (r *FacadeRepository) ListByCompany(ctx context.Context, companyID int64) ([]models.Facade, error) {
    query := `
        SELECT DISTINCT f.id, f.name, f.city, f.address, f.width_cells, f.height_cells,
                        f.latitude, f.longitude, f.is_active, f.created_at
        FROM facades f
        JOIN campaign_facades cf ON cf.facade_id = f.id
        JOIN campaigns c ON c.id = cf.campaign_id
        WHERE c.company_id = $1
        ORDER BY f.city, f.name
    `

    rows, err := r.db.QueryContext(ctx, query, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Facade{}
    for rows.Next() {
        var f models.Facade
        if err := rows.Scan(
            &f.ID, &f.Name, &f.City, &f.Address,
            &f.WidthCells, &f.HeightCells,
            &f.Latitude, &f.Longitude,
            &f.IsActive, &f.CreatedAt,
        ); err != nil {
            return nil, err
        }
        result = append(result, f)
    }
    return result, nil
}

//
// --------------------- UPDATE ---------------------
//
func (r *FacadeRepository) Update(ctx context.Context, f *models.Facade) error {
    query := `
        UPDATE facades
        SET name = $1,
            city = $2,
            address = $3,
            width_cells = $4,
            height_cells = $5,
            latitude = $6,
            longitude = $7,
            is_active = $8
        WHERE id = $9
    `
    _, err := r.db.ExecContext(ctx, query,
        f.Name, f.City, f.Address,
        f.WidthCells, f.HeightCells,
        f.Latitude, f.Longitude,
        f.IsActive,
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
