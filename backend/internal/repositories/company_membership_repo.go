package repositories

import (
    "context"
    "database/sql"
    "mediawork/internal/models"
)

type CompanyMembershipRepository struct {
    db *sql.DB
}

func NewCompanyMembershipRepository(db *sql.DB) *CompanyMembershipRepository {
    return &CompanyMembershipRepository{db: db}
}

//
// --------------------- ADD MEMBER ---------------------
//
func (r *CompanyMembershipRepository) AddMember(
    ctx context.Context,
    companyID int64,
    userID int64,
    role string,
) error {

    query := `
        INSERT INTO company_memberships (company_id, user_id, role)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, user_id) 
        DO UPDATE SET role = EXCLUDED.role
    `
    _, err := r.db.ExecContext(ctx, query, companyID, userID, role)
    return err
}

//
// --------------------- REMOVE MEMBER ---------------------
//
func (r *CompanyMembershipRepository) RemoveMember(
    ctx context.Context,
    companyID int64,
    userID int64,
) error {
    _, err := r.db.ExecContext(ctx,
        `DELETE FROM company_memberships WHERE company_id = $1 AND user_id = $2`,
        companyID, userID,
    )
    return err
}

//
// --------------------- GET USER ROLE IN COMPANY ---------------------
//
func (r *CompanyMembershipRepository) GetUserRole(
    ctx context.Context,
    companyID int64,
    userID int64,
) (string, error) {

    query := `
        SELECT role
        FROM company_memberships
        WHERE company_id = $1 AND user_id = $2
    `
    var role string
    err := r.db.QueryRowContext(ctx, query, companyID, userID).Scan(&role)

    if err != nil {
        return "", err
    }

    return role, nil
}

//
// --------------------- LIST MEMBERS OF COMPANY ---------------------
//
func (r *CompanyMembershipRepository) ListMembers(
    ctx context.Context,
    companyID int64,
) ([]models.CompanyMember, error) {

    query := `
        SELECT cm.user_id, u.email, u.name, cm.role
        FROM company_memberships cm
        JOIN users u ON u.id = cm.user_id
        WHERE cm.company_id = $1
        ORDER BY u.name ASC
    `
    rows, err := r.db.QueryContext(ctx, query, companyID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    members := []models.CompanyMember{}
    for rows.Next() {
        var m models.CompanyMember
        if err := rows.Scan(&m.UserID, &m.Email, &m.Name, &m.Role); err != nil {
            return nil, err
        }
        members = append(members, m)
    }

    return members, nil
}

//
// --------------------- LIST COMPANIES OF USER ---------------------
//
func (r *CompanyMembershipRepository) ListUserCompanies(
    ctx context.Context,
    userID int64,
) ([]models.Company, error) {

    query := `
        SELECT c.id, c.name, c.industry, c.created_at
        FROM company_memberships cm
        JOIN companies c ON c.id = cm.company_id
        WHERE cm.user_id = $1
        ORDER BY c.created_at ASC
    `
    rows, err := r.db.QueryContext(ctx, query, userID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    companies := []models.Company{}
    for rows.Next() {
        var c models.Company
        if err := rows.Scan(
            &c.ID, &c.Name, &c.Industry, &c.CreatedAt,
        ); err != nil {
            return nil, err
        }
        companies = append(companies, c)
    }

    return companies, nil
}

//
// --------------------- CHECK ACCESS ---------------------
//
func (r *CompanyMembershipRepository) CheckAccess(
    ctx context.Context,
    companyID int64,
    userID int64,
    required string,
) (bool, error) {

    query := `
        SELECT role
        FROM company_memberships
        WHERE company_id = $1 AND user_id = $2
    `
    var actual string
    err := r.db.QueryRowContext(ctx, query, companyID, userID).Scan(&actual)
    if err != nil {
        return false, err
    }

    // Порядок важности ролей:
    // owner > admin > editor > viewer
    rank := map[string]int{
        "viewer": 1,
        "editor": 2,
        "admin":  3,
        "owner":  4,
    }

    return rank[actual] >= rank[required], nil
}
