package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CompanyRepository struct {
    db *sql.DB
}

func NewCompanyRepository(db *sql.DB) *CompanyRepository {
    return &CompanyRepository{db: db}
}

//
// --------------------- CREATE ---------------------
//
func (r *CompanyRepository) Create(ctx context.Context, c *models.Company) error {
    query := `
        INSERT INTO companies (name, owner_id, is_active, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, created_at
    `
    return r.db.QueryRowContext(ctx, query,
        c.Name, c.OwnerID, c.IsActive,
    ).Scan(&c.ID, &c.CreatedAt)
}

//
// --------------------- GET BY ID ---------------------
//
func (r *CompanyRepository) GetByID(ctx context.Context, id int64) (*models.Company, error) {
    query := `
        SELECT id, name, owner_id, is_active, created_at
        FROM companies
        WHERE id = $1
    `
    var c models.Company
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(&c.ID, &c.Name, &c.OwnerID, &c.IsActive, &c.CreatedAt)

    if err != nil {
        return nil, err
    }
    return &c, nil
}

//
// --------------------- LIST ALL / PAGED ---------------------
//
func (r *CompanyRepository) List(ctx context.Context, limit, offset int) ([]models.Company, error) {
    query := `
        SELECT id, name, owner_id, is_active, created_at
        FROM companies
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `
    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Company{}
    for rows.Next() {
        var c models.Company
        if err := rows.Scan(&c.ID, &c.Name, &c.OwnerID, &c.IsActive, &c.CreatedAt); err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- LIST BY OWNER ---------------------
//
func (r *CompanyRepository) ListByOwner(ctx context.Context, ownerID int64) ([]models.Company, error) {
    query := `
        SELECT id, name, owner_id, is_active, created_at
        FROM companies
        WHERE owner_id = $1
        ORDER BY created_at DESC
    `
    rows, err := r.db.QueryContext(ctx, query, ownerID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Company{}
    for rows.Next() {
        var c models.Company
        if err := rows.Scan(&c.ID, &c.Name, &c.OwnerID, &c.IsActive, &c.CreatedAt); err != nil {
            return nil, err
        }
        list = append(list, c)
    }
    return list, nil
}

//
// --------------------- UPDATE ---------------------
//
func (r *CompanyRepository) Update(ctx context.Context, c *models.Company) error {
    query := `
        UPDATE companies
        SET name = $1,
            owner_id = $2,
            is_active = $3
        WHERE id = $4
    `
    _, err := r.db.ExecContext(ctx, query,
        c.Name, c.OwnerID, c.IsActive, c.ID,
    )
    return err
}

//
// --------------------- DELETE ---------------------
//
func (r *CompanyRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM companies WHERE id = $1`, id)
    return err
}


//
// ----------------------- SET ACTIVE / DEACTIVATE -----------------------
//

func (r *CompanyRepository) SetActive(ctx context.Context, id int64, active bool) error {
    query := `
        UPDATE companies
        SET is_active = $1,
            updated_at = NOW()
        WHERE id = $2
    `
    _, err := r.db.ExecContext(ctx, query, active, id)
    return err
}
