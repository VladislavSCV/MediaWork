package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CampaignSlotRepository struct {
    db *sql.DB
}

func NewCampaignSlotRepository(db *sql.DB) *CampaignSlotRepository {
    return &CampaignSlotRepository{db: db}
}

func (r *CampaignSlotRepository) Insert(ctx context.Context, slot *models.CampaignSlot) error {
    query := `
        INSERT INTO campaign_slots (campaign_id, facade_id, start_time, end_time, priority)
        VALUES($1, $2, $3, $4, $5)
        RETURNING id
    `
    return r.db.QueryRowContext(ctx, query,
        slot.CampaignID, slot.FacadeID, slot.StartTime, slot.EndTime, slot.Priority,
    ).Scan(&slot.ID)
}

func (r *CampaignSlotRepository) ListByCampaign(ctx context.Context, id int64) ([]models.CampaignSlot, error) {
    query := `
        SELECT 
            id, 
            campaign_id, 
            NULL AS facade_id, -- в таблице нет facade_id, ставим NULL
            start_time, 
            end_time, 
            priority
        FROM campaign_schedules
        WHERE campaign_id = $1
        ORDER BY priority DESC
    `
    rows, err := r.db.QueryContext(ctx, query, id)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    slots := []models.CampaignSlot{}
    for rows.Next() {
        var s models.CampaignSlot
        if err := rows.Scan(
            &s.ID,
            &s.CampaignID,
            &s.FacadeID, // будет NULL
            &s.StartTime,
            &s.EndTime,
            &s.Priority,
        ); err != nil {
            return nil, err
        }
        slots = append(slots, s)
    }

    return slots, nil
}

