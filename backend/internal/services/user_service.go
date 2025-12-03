package services

import (
    "context"
    "mediawork/internal/models"
    "mediawork/internal/repositories"
)

type UserService struct {
    users *repositories.UserRepository
}

func NewUserService(users *repositories.UserRepository) *UserService {
    return &UserService{users: users}
}

//
// ---------------- GET PROFILE ----------------
//
func (s *UserService) Profile(ctx context.Context, userID int64) (*models.User, error) {
    return s.users.GetByID(ctx, userID)
}

//
// ---------------- UPDATE ROLE (ADMIN) ----------------
//
func (s *UserService) UpdateRole(ctx context.Context, userID int64, role string) error {
    return s.users.UpdateRole(ctx, userID, role)
}

//
// ---------------- UPDATE BASIC INFO ----------------
//
func (s *UserService) UpdateProfile(ctx context.Context, u *models.User) error {
    return s.users.Update(ctx, u)
}
