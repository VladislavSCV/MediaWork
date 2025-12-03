package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type LiveStreamRepository struct {
    db *sql.DB
}

func NewLiveStreamRepository(db *sql.DB) *LiveStreamRepository {
    return &LiveStreamRepository{db: db}
}

//
// ----------------------- REGISTER PLAY EVENT -----------------------
//
func (r *LiveStreamRepository) RegisterPlayEvent(
    ctx context.Context,
    event *models.PlayEvent,
) (int64, error) {

    query := `
        INSERT INTO play_history (
            facade_id,
            campaign_id,
            slot_id,
            media_url,
            played_at,
            duration_sec,
            resolution_w,
            resolution_h,
            bitrate_kbps,
            sync_latency_ms
        )
        VALUES ($1,$2,$3,$4,NOW(),$5,$6,$7,$8,$9)
        RETURNING id
    `

    var id int64
    err := r.db.QueryRowContext(ctx, query,
        event.FacadeID,
        event.CampaignID,
        event.SlotID,
        event.MediaURL,
        event.DurationSec,
        event.ResolutionW,
        event.ResolutionH,
        event.BitrateKbps,
        event.SyncLatencyMS,
    ).Scan(&id)

    return id, err
}

//
// ----------------------- GET LAST PLAYED FOR FACADE -----------------------
//
func (r *LiveStreamRepository) GetLastPlayed(
    ctx context.Context,
    facadeID int64,
) (*models.PlayEvent, error) {

    query := `
        SELECT id, facade_id, campaign_id, slot_id, media_url,
               played_at, duration_sec, resolution_w, resolution_h,
               bitrate_kbps, sync_latency_ms
        FROM play_history
        WHERE facade_id = $1
        ORDER BY played_at DESC
        LIMIT 1
    `

    var ev models.PlayEvent
    err := r.db.QueryRowContext(ctx, query, facadeID).Scan(
        &ev.ID,
        &ev.FacadeID,
        &ev.CampaignID,
        &ev.SlotID,
        &ev.MediaURL,
        &ev.PlayedAt,
        &ev.DurationSec,
        &ev.ResolutionW,
        &ev.ResolutionH,
        &ev.BitrateKbps,
        &ev.SyncLatencyMS,
    )
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &ev, err
}

//
// ----------------------- REGISTER HEARTBEAT -----------------------
//

func (r *LiveStreamRepository) RegisterHeartbeat(
    ctx context.Context,
    hb *models.Heartbeat,
) error {

    query := `
        INSERT INTO facade_heartbeat (facade_id, timestamp, latency_ms, source_ip)
        VALUES ($1, NOW(), $2, $3)
    `

    _, err := r.db.ExecContext(ctx, query, hb.FacadeID, hb.LatencyMS, hb.SourceIP)
    return err
}

//
// ----------------------- GET FACADE STATUS -----------------------
//

func (r *LiveStreamRepository) GetFacadeStatus(
    ctx context.Context,
    facadeID int64,
) (*models.FacadeStatus, error) {

    query := `
        SELECT 
            (NOW() - MAX(timestamp)) < INTERVAL '10 seconds' AS is_online,
            COALESCE(AVG(latency_ms), 0) AS avg_latency
        FROM facade_heartbeat
        WHERE facade_id = $1
    `

    var status models.FacadeStatus
    err := r.db.QueryRowContext(ctx, query, facadeID).Scan(
        &status.IsOnline,
        &status.AvgLatencyMS,
    )

    if err != nil {
        return nil, err
    }

    status.FacadeID = facadeID
    return &status, nil
}

//
// ----------------------- GET RECENT EVENTS -----------------------
//

func (r *LiveStreamRepository) GetRecentEvents(
    ctx context.Context,
    facadeID int64,
    limit int,
) ([]models.PlayEvent, error) {

    query := `
        SELECT id, facade_id, campaign_id, slot_id, media_url,
               played_at, duration_sec, resolution_w, resolution_h,
               bitrate_kbps, sync_latency_ms
        FROM play_history
        WHERE facade_id = $1
        ORDER BY played_at DESC
        LIMIT $2
    `

    rows, err := r.db.QueryContext(ctx, query, facadeID, limit)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    events := []models.PlayEvent{}
    for rows.Next() {
        var ev models.PlayEvent
        if err := rows.Scan(
            &ev.ID,
            &ev.FacadeID,
            &ev.CampaignID,
            &ev.SlotID,
            &ev.MediaURL,
            &ev.PlayedAt,
            &ev.DurationSec,
            &ev.ResolutionW,
            &ev.ResolutionH,
            &ev.BitrateKbps,
            &ev.SyncLatencyMS,
        ); err != nil {
            return nil, err
        }
        events = append(events, ev)
    }

    return events, nil
}

//
// ----------------------- CLEAN OLD HISTORY -----------------------
//

func (r *LiveStreamRepository) CleanupOldEvents(ctx context.Context) error {

    _, err := r.db.ExecContext(ctx,
        `DELETE FROM play_history WHERE played_at < NOW() - INTERVAL '90 days'`,
    )
    return err
}

