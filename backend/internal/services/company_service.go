package services

import (
    "context"

    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type CompanyService struct {
    companies *repositories.CompanyRepository
    members   *repositories.CompanyMembershipRepository
}

func NewCompanyService(
    companies *repositories.CompanyRepository,
    members *repositories.CompanyMembershipRepository,
) *CompanyService {
    return &CompanyService{
        companies: companies,
        members:   members,
    }
}

// Список компаний (для админки / обзора)
func (s *CompanyService) ListCompanies(ctx context.Context, limit, offset int) ([]models.Company, error) {
    return s.companies.List(ctx, limit, offset)
}

// Одна компания + участники
func (s *CompanyService) GetCompanyWithMembers(ctx context.Context, id int64) (*models.Company, []models.CompanyMember, error) {
    c, err := s.companies.GetByID(ctx, id)
    if err != nil {
        return nil, nil, err
    }

    members, err := s.members.ListMembers(ctx, id)
    if err != nil {
        return c, nil, err
    }

    return c, members, nil
}

// Создать компанию
// Создать компанию
func (s *CompanyService) CreateCompany(ctx context.Context, c *models.Company) (int64, error) {
    err := s.companies.Create(ctx, c)
    if err != nil {
        return 0, err
    }

    return c.ID, nil
}


// Обновить компанию
func (s *CompanyService) UpdateCompany(ctx context.Context, c *models.Company) error {
    return s.companies.Update(ctx, c)
}

// Деактивировать (мягкое удаление)
func (s *CompanyService) DeactivateCompany(ctx context.Context, id int64) error {
    return s.companies.SetActive(ctx, id, false)
}

// Получить компанию + участников (детальный просмотр)
func (s *CompanyService) GetDetailed(ctx context.Context, id int64) (*models.Company, []models.CompanyMember, error) {
    return s.GetCompanyWithMembers(ctx, id)
}
