package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type FacadeStatusRepository struct {
    db *sql.DB
}

func NewFacadeStatusRepository(db *sql.DB) *FacadeStatusRepository {
    return &FacadeStatusRepository{db: db}
}

//
// --------------------- UPDATE STATUS (HEARTBEAT) ---------------------
//
func (r *FacadeStatusRepository) UpdateStatus(ctx context.Context, status *models.FacadeStatus) error {
    query := `
        INSERT INTO facade_status (facade_id, is_online, last_seen, latency_ms)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (facade_id)
        DO UPDATE SET
            is_online = EXCLUDED.is_online,
            last_seen = EXCLUDED.last_seen,
            latency_ms = EXCLUDED.latency_ms
    `
    _, err := r.db.ExecContext(ctx, query,
        status.FacadeID,
        status.IsOnline,
        status.LastSeen,
        status.LatencyMS,
    )
    return err
}

//
// --------------------- SET OFFLINE ---------------------
//
func (r *FacadeStatusRepository) SetOffline(ctx context.Context, facadeID int64) error {
    query := `
        UPDATE facade_status
        SET is_online = FALSE,
            latency_ms = NULL,
            last_seen = NOW()
        WHERE facade_id = $1
    `
    _, err := r.db.ExecContext(ctx, query, facadeID)
    return err
}

//
// --------------------- GET BY FACADE ---------------------
//
func (r *FacadeStatusRepository) GetByFacadeID(ctx context.Context, facadeID int64) (*models.FacadeStatus, error) {
    query := `
        SELECT facade_id, is_online, last_seen, latency_ms
        FROM facade_status
        WHERE facade_id = $1
    `

    var s models.FacadeStatus
    err := r.db.QueryRowContext(ctx, query, facadeID).
        Scan(&s.FacadeID, &s.IsOnline, &s.LastSeen, &s.LatencyMS)

    if err != nil {
        return nil, err
    }
    return &s, nil
}

//
// --------------------- LIST ONLINE ---------------------
//
func (r *FacadeStatusRepository) ListOnline(ctx context.Context) ([]models.FacadeStatus, error) {
    query := `
        SELECT facade_id, is_online, last_seen, latency_ms
        FROM facade_status
        WHERE is_online = TRUE
        ORDER BY last_seen DESC
    `

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.FacadeStatus{}
    for rows.Next() {
        var s models.FacadeStatus
        if err := rows.Scan(&s.FacadeID, &s.IsOnline, &s.LastSeen, &s.LatencyMS); err != nil {
            return nil, err
        }
        list = append(list, s)
    }
    return list, nil
}

//
// --------------------- LIST OFFLINE (>5 min) ---------------------
//
func (r *FacadeStatusRepository) ListOffline(ctx context.Context) ([]models.FacadeStatus, error) {
    query := `
        SELECT facade_id, is_online, last_seen, latency_ms
        FROM facade_status
        WHERE is_online = FALSE
        ORDER BY last_seen DESC
    `

    rows, err := r.db.QueryContext(ctx, query)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.FacadeStatus{}
    for rows.Next() {
        var s models.FacadeStatus
        if err := rows.Scan(&s.FacadeID, &s.IsOnline, &s.LastSeen, &s.LatencyMS); err != nil {
            return nil, err
        }
        list = append(list, s)
    }
    return list, nil
}

//
// --------------------- UPDATE LATENCY ---------------------
//
func (r *FacadeStatusRepository) UpdateLatency(ctx context.Context, facadeID int64, latency int) error {
    query := `
        UPDATE facade_status
        SET latency_ms = $1,
            last_seen = NOW(),
            is_online = TRUE
        WHERE facade_id = $2
    `
    _, err := r.db.ExecContext(ctx, query, latency, facadeID)
    return err
}
