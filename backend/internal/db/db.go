package db

import (
	"context"
	"database/sql"
	"fmt"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Init() error {
	if DB != nil {
		fmt.Println("⚠️ DB already initialized — skipping re-init")
		return nil
	}

	url := os.Getenv("DATABASE_URL")
	if url == "" {
		url = "postgres://postgres.apcmdusrbsshqnoewhpr:XNGbcokQ4QjLfHxs@aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
	}

	var err error
	DB, err = sql.Open("postgres", url)
	if err != nil {
		return err
	}

	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)
	DB.SetConnMaxLifetime(time.Hour)
	DB.SetConnMaxIdleTime(5 * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	if err = DB.PingContext(ctx); err != nil {
		return fmt.Errorf("DB connection error: %w", err)
	}

	fmt.Println("✅ Connected to Postgres via database/sql + pgx")
	return nil
}
