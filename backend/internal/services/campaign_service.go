package services

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type CampaignService struct {
    repoCampaigns *repositories.CampaignRepository
    repoSlots     *repositories.CampaignSlotRepository
}

func NewCampaignService(cRepo *repositories.CampaignRepository, slotRepo *repositories.CampaignSlotRepository) *CampaignService {
    return &CampaignService{repoCampaigns: cRepo, repoSlots: slotRepo}
}

//
// --------------- CREATE WITH SLOTS ---------------
//
func (s *CampaignService) Create(ctx context.Context, c *models.Campaign, slots []models.CampaignSlot) (int64, error) {
    id, err := s.repoCampaigns.Create(ctx, c)
    if err != nil { return 0, err }

    for i := range slots {
        slots[i].CampaignID = id
        _, _ = s.repoSlots.Create(ctx, &slots[i])
    }

    return id, nil
}

//
// --------------- GET FULL CAMPAIGN ---------------
//
func (s *CampaignService) GetDetailed(ctx context.Context, id int64) (*models.CampaignDetailed, error) {
    // Получаем базовую кампанию
    base, err := s.repoCampaigns.GetByID(ctx, id)
    if err != nil {
        return nil, err
    }

    // Получаем слоты кампании
    slots, _ := s.repoSlots.ListByCampaign(ctx, id)

    // Собираем структуру CampaignDetailed
    return &models.CampaignDetailed{
        Campaign: &models.CampaignFull{
            ID:          base.ID,
            CompanyID:   base.CompanyID,
            Name:        base.Name,
            Description: base.Description,
            StartTime:   base.StartTime,
            EndTime:     base.EndTime,
            Status:      base.Status,
            Priority:    base.Priority,
            CreatedAt:   base.CreatedAt,

            // Эти два поля будут пустые, пока мы не подключим репы
            Facades:   []models.Facade{},
            Creatives: []models.Creative{},
        },

        Slots: slots,
    }, nil
}


