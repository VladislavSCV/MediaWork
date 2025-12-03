package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type PlayHistoryRepository struct {
    db *sql.DB
}

func NewPlayHistoryRepository(db *sql.DB) *PlayHistoryRepository {
    return &PlayHistoryRepository{db: db}
}

func (r *PlayHistoryRepository) Insert(ctx context.Context, h *models.PlayHistory) error {
    query := `
        INSERT INTO play_history (facade_id, campaign_id, media_url, duration_sec, played_at)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id
    `
    return r.db.QueryRowContext(ctx, query,
        h.FacadeID, h.CampaignID, h.MediaURL, h.DurationSec, h.PlayedAt,
    ).Scan(&h.ID)
}

func (r *PlayHistoryRepository) GetRecent(ctx context.Context, facadeID int64, limit int) ([]models.PlayHistory, error) {
    query := `
        SELECT id, facade_id, campaign_id, media_url, duration_sec, played_at
        FROM play_history
        WHERE facade_id = $1
        ORDER BY played_at DESC
        LIMIT $2
    `

    rows, err := r.db.QueryContext(ctx, query, facadeID, limit)
    if err != nil { return nil, err }
    defer rows.Close()

    result := []models.PlayHistory{}
    for rows.Next() {
        var h models.PlayHistory
        if err := rows.Scan(&h.ID, &h.FacadeID, &h.CampaignID, &h.MediaURL, &h.DurationSec, &h.PlayedAt); err != nil {
            return nil, err
        }
        result = append(result, h)
    }

    return result, nil
}
