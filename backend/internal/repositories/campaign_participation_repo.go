package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CampaignParticipationRepository struct {
    db *sql.DB
}

func NewCampaignParticipationRepository(db *sql.DB) *CampaignParticipationRepository {
    return &CampaignParticipationRepository{db: db}
}

//
// ----------------------- ADD PARTICIPATION -----------------------
//

func (r *CampaignParticipationRepository) AddParticipation(
    ctx context.Context,
    p *models.CampaignParticipation,
) (int64, error) {

    query := `
        INSERT INTO campaign_participation (
            campaign_id,
            facade_id,
            created_at
        )
        VALUES ($1, $2, NOW())
        RETURNING id
    `

    var id int64
    err := r.db.QueryRowContext(
        ctx,
        query,
        p.CampaignID,
        p.FacadeID,
    ).Scan(&id)

    return id, err
}

//
// ----------------------- REMOVE PARTICIPATION -----------------------
//

func (r *CampaignParticipationRepository) RemoveParticipation(
    ctx context.Context,
    campaignID int64,
    facadeID int64,
) error {

    _, err := r.db.ExecContext(
        ctx,
        `DELETE FROM campaign_participation WHERE campaign_id = $1 AND facade_id = $2`,
        campaignID,
        facadeID,
    )
    return err
}

//
// ----------------------- LIST FACADES FOR CAMPAIGN -----------------------
//

func (r *CampaignParticipationRepository) GetFacadesForCampaign(
    ctx context.Context,
    campaignID int64,
) ([]models.Facade, error) {

    query := `
        SELECT f.id, f.name, f.city, f.address, f.width_px, f.height_px, f.status, f.created_at
        FROM facades f
        JOIN campaign_participation cp ON cp.facade_id = f.id
        WHERE cp.campaign_id = $1
        ORDER BY f.city, f.name
    `

    rows, err := r.db.QueryContext(ctx, query, campaignID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Facade{}

    for rows.Next() {
        var f models.Facade
        if err := rows.Scan(
            &f.ID,
            &f.Name,
            &f.City,
            &f.Address,
            &f.WidthPx,
            &f.HeightPx,
            &f.Status,
            &f.CreatedAt,
        ); err != nil {
            return nil, err
        }
        result = append(result, f)
    }

    return result, nil
}

//
// ----------------------- LIST CAMPAIGNS FOR FACADE -----------------------
//

func (r *CampaignParticipationRepository) GetCampaignsForFacade(
    ctx context.Context,
    facadeID int64,
) ([]models.Campaign, error) {

    query := `
        SELECT 
            c.id,
            c.company_id,
            c.name,
            c.description,
            c.start_time,
            c.end_time,
            c.status,
            c.priority,
            c.created_at
        FROM campaigns c
        JOIN campaign_participation cp ON cp.campaign_id = c.id
        WHERE cp.facade_id = $1
        ORDER BY c.created_at DESC
    `

    rows, err := r.db.QueryContext(ctx, query, facadeID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    result := []models.Campaign{}

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
        result = append(result, c)
    }

    return result, nil
}


//
// ----------------------- CHECK IF ATTACHED -----------------------
//

func (r *CampaignParticipationRepository) IsAttached(
    ctx context.Context,
    campaignID int64,
    facadeID int64,
) (bool, error) {

    var exists bool

    err := r.db.QueryRowContext(
        ctx,
        `SELECT EXISTS(SELECT 1 FROM campaign_participation WHERE campaign_id = $1 AND facade_id = $2)`,
        campaignID,
        facadeID,
    ).Scan(&exists)

    return exists, err
}

//
// ----------------------- COUNT FACADES FOR CAMPAIGN -----------------------
//

func (r *CampaignParticipationRepository) CountFacades(
    ctx context.Context,
    campaignID int64,
) (int, error) {

    var count int
    err := r.db.QueryRowContext(
        ctx,
        `SELECT COUNT(*) FROM campaign_participation WHERE campaign_id = $1`,
        campaignID,
    ).Scan(&count)

    return count, err
}

//
// ----------------------- COUNT CAMPAIGNS ON FACADE -----------------------
//

func (r *CampaignParticipationRepository) CountCampaigns(
    ctx context.Context,
    facadeID int64,
) (int, error) {

    var count int
    err := r.db.QueryRowContext(
        ctx,
        `SELECT COUNT(*) FROM campaign_participation WHERE facade_id = $1`,
        facadeID,
    ).Scan(&count)

    return count, err
}
