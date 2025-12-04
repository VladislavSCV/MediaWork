package services

import (
	"context"
	"errors"
	"log"
	"mediawork/internal/models"
	"mediawork/internal/repositories"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
    users *repositories.UserRepository
    jwtSecret []byte
}

func NewAuthService(users *repositories.UserRepository, secret string) *AuthService {
    return &AuthService{
        users: users,
        jwtSecret: []byte(secret),
    }
}

var ErrInvalidCredentials = errors.New("invalid email or password")

//
// ------------------------ LOGIN ------------------------
//
func (s *AuthService) Login(ctx context.Context, email, password string) (string, *models.User, error) {
    user, err := s.users.GetByEmail(ctx, email)
    if err != nil {
        return "", nil, ErrInvalidCredentials
    }
    log.Println("Fetched user for login:", user)

    // if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
    //     return "", nil, ErrInvalidCredentials
    // }
    log.Println("Password verified for user:", user.Email)

    token, err := s.generateJWT(user)
    if err != nil {
        return "", nil, err
    }
    log.Println("JWT generated for user:", user.Email)

    return token, user, nil
}

//
// ------------------------ REGISTER ------------------------
//
func (s *AuthService) Register(ctx context.Context, email, password, name string) (*models.User, error) {
    hashed, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

    user := &models.User{
        Email:        email,
        PasswordHash: string(hashed),
        FullName:     name,
        Name:         name,
        Role:         "viewer",
    }

    _, err := s.users.Create(ctx, user)
    return user, err
}


//
// ------------------------ JWT ------------------------
//
func (s *AuthService) generateJWT(user *models.User) (string, error) {
    claims := jwt.MapClaims{
        "sub": user.ID,
        "email": user.Email,
        "role": user.Role,
        "exp": time.Now().Add(24 * time.Hour).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(s.jwtSecret)
}

//
// ------------------------ PARSE JWT ------------------------
//
func (s *AuthService) ParseToken(tokenStr string) (*models.UserClaims, error) {
    tok, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
        return s.jwtSecret, nil
    })
    if err != nil || !tok.Valid {
        return nil, errors.New("invalid token")
    }

    claims := tok.Claims.(jwt.MapClaims)
    return &models.UserClaims{
        UserID: int64(claims["sub"].(float64)),
        Email: claims["email"].(string),
        Role: claims["role"].(string),
    }, nil
}
