package repositories

import (
    "context"
    "database/sql"
    "log"

    "mediawork/internal/models"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

// --------------------- CREATE USER ---------------------
func (r *UserRepository) Create(ctx context.Context, u *models.User) (int64, error) {
    query := `
        INSERT INTO users (email, password_hash, full_name, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING id, created_at, updated_at
    `

    err := r.db.QueryRowContext(ctx, query,
        u.Email,
        u.PasswordHash,
        u.FullName,
        u.Role,
    ).Scan(&u.ID, &u.CreatedAt, &u.UpdatedAt)

    if err != nil {
        return 0, err
    }

    // дублируем в Name, если хочешь использовать на фронте
    u.Name = u.FullName

    return u.ID, nil
}

// --------------------- UPDATE ROLE ---------------------
func (r *UserRepository) UpdateRole(ctx context.Context, id int64, role string) error {
    _, err := r.db.ExecContext(ctx,
        `UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2`,
        role, id,
    )
    return err
}

// --------------------- UPDATE PROFILE ---------------------
func (r *UserRepository) Update(ctx context.Context, u *models.User) error {
    query := `
        UPDATE users
        SET email = $1,
            full_name = $2,
            role = $3,
            updated_at = NOW()
        WHERE id = $4
    `
    _, err := r.db.ExecContext(ctx, query,
        u.Email,
        u.FullName,
        u.Role,
        u.ID,
    )
    return err
}

// --------------------- GET BY ID ---------------------
func (r *UserRepository) GetByID(ctx context.Context, id int64) (*models.User, error) {
    query := `
        SELECT 
            id, 
            email, 
            full_name,
            global_role AS role,
            created_at,
            created_at AS updated_at -- временная заглушка
        FROM users
        WHERE id = $1
    `

    var u models.User
    err := r.db.QueryRowContext(ctx, query, id).
        Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt)
    if err != nil {
        return nil, err
    }
    u.Name = u.FullName
    return &u, nil
}

// --------------------- GET BY EMAIL ---------------------
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    query := `
        SELECT 
            id, 
            email, 
            full_name, 
            password_hash, 
            global_role AS role,
            created_at,
            created_at -- пока заглушка для updated_at
        FROM users
        WHERE email = $1
    `

    var u models.User
    err := r.db.QueryRowContext(ctx, query, email).
        Scan(&u.ID, &u.Email, &u.FullName, &u.PasswordHash, &u.Role, &u.CreatedAt, &u.UpdatedAt)
    if err != nil {
        return nil, err
    }
    log.Println("Fetched user by email:", u.Email)
    u.Name = u.FullName
    return &u, nil
}

// --------------------- LIST ---------------------
func (r *UserRepository) List(ctx context.Context, limit, offset int) ([]models.User, error) {
    query := `
        SELECT id, email, full_name, role, created_at, updated_at
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
        if err := rows.Scan(&u.ID, &u.Email, &u.FullName, &u.Role, &u.CreatedAt, &u.UpdatedAt); err != nil {
            return nil, err
        }
        u.Name = u.FullName
        list = append(list, u)
    }
    return list, nil
}

// --------------------- DELETE ---------------------
func (r *UserRepository) Delete(ctx context.Context, id int64) error {
    _, err := r.db.ExecContext(ctx, `DELETE FROM users WHERE id = $1`, id)
    return err
}
