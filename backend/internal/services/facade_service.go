package services

import (
	"context"
	"time"

	"mediawork/internal/models"
	"mediawork/internal/repositories"
)

type FacadeService struct {
	facades  *repositories.FacadeRepository
	liveRepo *repositories.LiveStreamRepository
}

var sampleBase64PNG = "https://i0.wp.com/f.partnerkin.com/storage/files/file_1646847200_8.gif?ssl=1"

type LiveFrame struct {
	Base64Frame string
}

func NewFacadeService(fr *repositories.FacadeRepository, lr *repositories.LiveStreamRepository) *FacadeService {
	return &FacadeService{facades: fr, liveRepo: lr}
}

// --------------- GET FACADE FULL STATUS ---------------
func (s *FacadeService) GetStatus(ctx context.Context, facadeID int64) (*models.FacadeFullStatus, error) {
	facade, err := s.facades.GetByID(ctx, facadeID)
	if err != nil {
		return nil, err
	}

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

func (s *FacadeService) List(ctx context.Context) ([]models.Facade, error) {
	return s.facades.List(ctx)
}

func (s *FacadeService) StreamLiveFrames(ctx context.Context, facadeID int64) <-chan LiveFrame {
	out := make(chan LiveFrame)

	go func() {
		defer close(out)

		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ctx.Done():
				return

			case <-ticker.C:
				// здесь должен быть реальный кадр
				// пока — тестовый
				out <- LiveFrame{
					Base64Frame: sampleBase64PNG, // тестовое изображение
				}
			}
		}
	}()

	return out
}
