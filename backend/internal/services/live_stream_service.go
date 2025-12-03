package services

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type LiveStreamService struct {
    repo *repositories.LiveStreamRepository
}

func NewLiveStreamService(repo *repositories.LiveStreamRepository) *LiveStreamService {
    return &LiveStreamService{repo: repo}
}

//
// ---------- HANDLE HEARTBEAT ----------
//
func (s *LiveStreamService) Heartbeat(ctx context.Context, hb *models.Heartbeat) error {
    return s.repo.RegisterHeartbeat(ctx, hb)
}

//
// ---------- REGISTER PLAY EVENT ----------
//
func (s *LiveStreamService) PlayEvent(ctx context.Context, ev *models.PlayEvent) error {
    return s.repo.RegisterPlayEvent(ctx, ev)
}

//
// ---------- GET FULL LIVE DATA ----------
//
func (s *LiveStreamService) LiveData(ctx context.Context, facadeID int64) (*models.FacadeLiveView, error) {
    status, _ := s.repo.GetFacadeStatus(ctx, facadeID)
    last, _ := s.repo.GetLastPlayed(ctx, facadeID)
    recent, _ := s.repo.GetRecentEvents(ctx, facadeID, 20)

    return &models.FacadeLiveView{
        Status: status,
        Last:   last,
        Recent: recent,
    }, nil
}
