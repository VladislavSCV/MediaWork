package services

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type AdminService struct {
    users    *repositories.UserRepository
    companies *repositories.CompanyRepository
}

func NewAdminService(u *repositories.UserRepository, c *repositories.CompanyRepository) *AdminService {
    return &AdminService{users: u, companies: c}
}

func (s *AdminService) ListUsers(ctx context.Context, limit int, offset int) ([]models.User, error) {
    return s.users.List(ctx, limit, offset)
}

func (s *AdminService) ListCompanies(ctx context.Context, limit int, offset int) ([]models.Company, error) {
    return s.companies.List(ctx, limit, offset)
}

func (s *AdminService) SetRole(ctx context.Context, id int64, role string) error {
    return s.users.UpdateRole(ctx, id, role)
}
