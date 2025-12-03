package repositories

import (
    "context"
    "database/sql"
    "time"

    "mediawork/internal/models"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

// --------------------- CREATE USER ---------------------
func (r *UserRepository) Create(ctx context.Context, user *models.User) error {
    query := `
        INSERT INTO users (name, email, password, role, created_at)
        VALUES ($1, $2, $3, $4, NOW())
        RETURNING id, created_at
    `
    return r.db.QueryRowContext(ctx, query,
        user.Name, user.Email, user.Password, user.Role,
    ).Scan(&user.ID, &user.CreatedAt)
}

// --------------------- GET BY ID ---------------------
func (r *UserRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
    query := `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
    `
    var u models.User
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt)
    if err != nil {
        return nil, err
    }
    return &u, nil
}

// --------------------- GET BY EMAIL ---------------------
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    query := `
        SELECT id, name, email, password, role, created_at
        FROM users
        WHERE email = $1
    `
    var u models.User
    err := r.db.QueryRowContext(ctx, query, email).
        Scan(&u.ID, &u.Name, &u.Email, &u.Password, &u.Role, &u.CreatedAt)
    if err != nil {
        return nil, err
    }
    return &u, nil
}

// --------------------- LIST ---------------------
func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]models.User, error) {
    query := `
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `
    rows, err := r.db.QueryContext(ctx, query, limit, offset)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    list := []models.User{}
    for rows.Next() {
        var u models.User
        if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.Role, &u.CreatedAt); err != nil {
            return nil, err
        }
        list = append(list, u)
    }
    return list, nil
}

// --------------------- DELETE ---------------------
func (r *UserRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
    return err
}
