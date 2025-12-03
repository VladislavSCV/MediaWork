package db

import (
    "database/sql"
    "fmt"
    "time"

    _ "github.com/lib/pq"
)

var DB *sql.DB

func Init() error {
    conn := "postgres://postgres.yaadnfxwvdhnxwqheybz:3PMxdwXEUtMxOamr@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
    if conn == "" {
        return fmt.Errorf("DATABASE_URL is not set")
    }

    var err error
    DB, err = sql.Open("postgres", conn)
    if err != nil {
        return fmt.Errorf("cannot open DB: %w", err)
    }

    // Настройки пула
    DB.SetMaxOpenConns(20)
    DB.SetMaxIdleConns(5)
    DB.SetConnMaxLifetime(30 * time.Minute)

    // Проверяем коннект
    if err = DB.Ping(); err != nil {
        return fmt.Errorf("cannot ping DB: %w", err)
    }

    fmt.Println("Connected to PostgreSQL")
    return nil
}
