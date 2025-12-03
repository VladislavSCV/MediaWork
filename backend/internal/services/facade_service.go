package services

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type FacadeService struct {
    facades  *repositories.FacadeRepository
    liveRepo *repositories.LiveStreamRepository
}

func NewFacadeService(fr *repositories.FacadeRepository, lr *repositories.LiveStreamRepository) *FacadeService {
    return &FacadeService{facades: fr, liveRepo: lr}
}

//
// --------------- GET FACADE FULL STATUS ---------------
//
func (s *FacadeService) GetStatus(ctx context.Context, facadeID int64) (*models.FacadeFullStatus, error) {
    facade, err := s.facades.GetByID(ctx, facadeID)
    if err != nil { return nil, err }

    status, _ := s.liveRepo.GetFacadeStatus(ctx, facadeID)
    lastEvent, _ := s.liveRepo.GetLastPlayed(ctx, facadeID)
    recent, _ := s.liveRepo.GetRecentEvents(ctx, facadeID, 10)

    return &models.FacadeFullStatus{
        Facade:      facade,
        Status:      status,
        LastPlayed:  lastEvent,
        RecentPlays: recent,
    }, nil
}
