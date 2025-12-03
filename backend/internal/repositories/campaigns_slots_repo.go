package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CampaignSlotsRepository struct {
    db *sql.DB
}

func NewCampaignSlotsRepository(db *sql.DB) *CampaignSlotsRepository {
    return &CampaignSlotsRepository{db: db}
}

//
// ----------------------- CREATE SLOT -----------------------
//
func (r *CampaignSlotsRepository) CreateSlot(
    ctx context.Context,
    slot *models.CampaignSlot,
) (int64, error) {

    query := `
        INSERT INTO campaign_slots (
            campaign_id,
            day_of_week,
            start_time,
            end_time,
            duration_sec,
            priority,
            created_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,NOW())
        RETURNING id
    `

    var id int64
    err := r.db.QueryRowContext(
        ctx,
        query,
        slot.CampaignID,
        slot.DayOfWeek,
        slot.StartTime,
        slot.EndTime,
        slot.DurationSec,
        slot.Priority,
    ).Scan(&id)

    return id, err
}

//
// ----------------------- UPDATE SLOT -----------------------
//
func (r *CampaignSlotsRepository) UpdateSlot(
    ctx context.Context,
    slot *models.CampaignSlot,
) error {

    query := `
        UPDATE campaign_slots
        SET day_of_week = $1,
            start_time = $2,
            end_time = $3,
            duration_sec = $4,
            priority = $5
        WHERE id = $6
    `

    _, err := r.db.ExecContext(ctx, query,
        slot.DayOfWeek,
        slot.StartTime,
        slot.EndTime,
        slot.DurationSec,
        slot.Priority,
        slot.ID,
    )
    return err
}

//
// ----------------------- DELETE SLOT -----------------------
//
func (r *CampaignSlotsRepository) DeleteSlot(
    ctx context.Context,
    slotID int64,
) error {
    _, err := r.db.ExecContext(ctx,
        `DELETE FROM campaign_slots WHERE id = $1`,
        slotID,
    )
    return err
}

//
// ----------------------- GET SLOTS BY CAMPAIGN -----------------------
//
func (r *CampaignSlotsRepository) GetSlotsByCampaign(
    ctx context.Context,
    campaignID int64,
) ([]models.CampaignSlot, error) {

    query := `
        SELECT id, campaign_id, day_of_week, start_time, end_time,
               duration_sec, priority, created_at
        FROM campaign_slots
        WHERE campaign_id = $1
        ORDER BY day_of_week ASC, start_time ASC
    `

    rows, err := r.db.QueryContext(ctx, query, campaignID)
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
            &s.DayOfWeek,
            &s.StartTime,
            &s.EndTime,
            &s.DurationSec,
            &s.Priority,
            &s.CreatedAt,
        ); err != nil {
            return nil, err
        }
        slots = append(slots, s)
    }

    return slots, nil
}

//
// ----------------------- GET ACTIVE SLOTS FOR FACADE (REALTIME) -----------------------
//
func (r *CampaignSlotsRepository) GetActiveSlotsForFacade(
    ctx context.Context,
    facadeID int64,
    weekday int,
    currentTime string,
) ([]models.ActiveSlot, error) {

    // Explanation:
    // - campaign must be ACTIVE
    // - campaign must be attached to facade via campaign_participation
    // - slot must match required weekday
    // - slot must cover currentTime

    query := `
        SELECT 
            cs.id AS slot_id,
            cs.campaign_id,
            c.name AS campaign_name,
            cs.start_time,
            cs.end_time,
            cs.priority,
            c.media_url
        FROM campaign_slots cs
        JOIN campaigns c ON c.id = cs.campaign_id
        JOIN campaign_participation cp ON cp.campaign_id = c.id
        WHERE cp.facade_id = $1
          AND cs.day_of_week = $2
          AND cs.start_time <= $3
          AND cs.end_time >= $3
          AND c.status = 'active'
        ORDER BY cs.priority DESC
    `

    rows, err := r.db.QueryContext(ctx, query, facadeID, weekday, currentTime)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    active := []models.ActiveSlot{}
    for rows.Next() {
        var a models.ActiveSlot
        if err := rows.Scan(
            &a.SlotID,
            &a.CampaignID,
            &a.CampaignName,
            &a.StartTime,
            &a.EndTime,
            &a.Priority,
            &a.MediaURL,
        ); err != nil {
            return nil, err
        }
        active = append(active, a)
    }

    return active, nil
}

func (r *CampaignSlotRepository) Create(ctx context.Context, slot *models.CampaignSlot) (int64, error) {
    query := `
        INSERT INTO campaign_slots (campaign_id, facade_id, start_time, end_time)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `
    err := r.db.QueryRowContext(ctx, query,
        slot.CampaignID,
        slot.FacadeID,
        slot.StartTime,
        slot.EndTime,
    ).Scan(&slot.ID)

    if err != nil {
        return 0, err
    }

    return slot.ID, nil
}
