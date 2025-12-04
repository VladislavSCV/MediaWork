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

// --------------------- CREATE ---------------------
func (r *CampaignRepository) Create(ctx context.Context, c *models.Campaign) (int64, error) {
	query := `
        INSERT INTO campaigns (
            company_id, name, external_ref,
            start_at, end_at, status,
            created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING id, created_at
    `

	err := r.db.QueryRowContext(ctx, query,
		c.CompanyID,
		c.Name,
		c.Description, // пишем в external_ref
		c.StartTime,
		c.EndTime,
		c.Status,
	).Scan(&c.ID, &c.CreatedAt)

	if err != nil {
		return 0, err
	}

	return c.ID, nil
}

// дальше можешь оставить всё как у тебя есть: GetByID / List / ListByCompany / ListActive / Update / Delete
// (они уже нормально матчатся с моделями)

func (r *CampaignRepository) GetByID(ctx context.Context, id int64) (*models.Campaign, error) {
    query := `
        SELECT
            id,
            company_id,
            name,
            external_ref,
            start_at,
            end_at,
            status,
            0 AS priority,   -- нет в БД → ставим 0
            created_at
        FROM campaigns
        WHERE id = $1
    `

    var c models.Campaign

    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &c.ID,
        &c.CompanyID,
        &c.Name,
        &c.Description,
        &c.StartTime,
        &c.EndTime,
        &c.Status,
        &c.Priority,
        &c.CreatedAt,
    )

    if err != nil {
        return nil, err
    }

    return &c, nil
}

func (r *CampaignRepository) List(ctx context.Context) ([]models.Campaign, error) {
    query := `
        SELECT
            id,
            company_id,
            name,
            external_ref,
            start_at,
            end_at,
            status,
            0 AS priority,
            created_at
        FROM campaigns
        ORDER BY created_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.Campaign{}

    for rows.Next() {
        var c models.Campaign
        if err := rows.Scan(
            &c.ID,
            &c.CompanyID,
            &c.Name,
            &c.Description,
            &c.StartTime,
            &c.EndTime,
            &c.Status,
            &c.Priority,
            &c.CreatedAt,
        ); err != nil {
            return nil, err
        }

        list = append(list, c)
    }

    return list, nil
}
