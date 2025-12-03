-- ============================================================
--  MEDIAWORK — FULL DATABASE SCHEMA (PostgreSQL)
--  Safe to run as a single SQL file.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================

CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    global_role     TEXT NOT NULL DEFAULT 'user',  -- 'user' | 'admin' | 'owner'
    locale          TEXT DEFAULT 'en',
    time_zone       TEXT DEFAULT 'Europe/Moscow',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_sessions (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   TEXT NOT NULL,
    user_agent      TEXT,
    ip_address      INET,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL
);

CREATE TABLE user_api_tokens (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    token_hash      TEXT NOT NULL,
    scopes          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    last_used_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at      TIMESTAMPTZ
);

-- ============================================================
-- COMPANIES + USER ROLES INSIDE COMPANIES
-- ============================================================

CREATE TABLE companies (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    legal_name      TEXT,
    vat_number      TEXT,
    company_type    TEXT NOT NULL DEFAULT 'client',  -- 'client' | 'operator' | 'internal'
    industry        TEXT,
    country         TEXT,
    city            TEXT,
    website         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_company_roles (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id      BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    role            TEXT NOT NULL, -- 'viewer' | 'campaign_manager' | 'billing' | 'admin' | 'owner'
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- ============================================================
-- FACADE GROUPS + FACADE DEVICES
-- ============================================================

CREATE TABLE facade_groups (
    id              BIGSERIAL PRIMARY KEY,
    name            TEXT NOT NULL,
    city            TEXT,
    country         TEXT,
    timezone        TEXT NOT NULL DEFAULT 'Europe/Moscow',
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facades (
    id                  BIGSERIAL PRIMARY KEY,
    group_id            BIGINT REFERENCES facade_groups(id) ON DELETE SET NULL,
    code                TEXT NOT NULL UNIQUE,
    name                TEXT NOT NULL,
    address             TEXT,
    latitude            DOUBLE PRECISION,
    longitude           DOUBLE PRECISION,

    physical_width_m    NUMERIC(10,2),
    physical_height_m   NUMERIC(10,2),

    resolution_x        INTEGER NOT NULL,
    resolution_y        INTEGER NOT NULL,
    virtual_rows        INTEGER NOT NULL DEFAULT 20,
    virtual_cols        INTEGER NOT NULL DEFAULT 10,

    status              TEXT NOT NULL DEFAULT 'offline',   -- online/offline
    last_ping_at        TIMESTAMPTZ,
    last_latency_ms     INTEGER,
    brightness          INTEGER,
    color_temperature   INTEGER,

    preview_image_url   TEXT,
    ws_endpoint         TEXT,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE facade_status_log (
    id              BIGSERIAL PRIMARY KEY,
    facade_id       BIGINT NOT NULL REFERENCES facades(id) ON DELETE CASCADE,
    status          TEXT NOT NULL, -- online/offline/degraded
    latency_ms      INTEGER,
    brightness      INTEGER,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- MEDIA FILES (CREATIVES)
-- ============================================================

CREATE TABLE media_files (
    id                  BIGSERIAL PRIMARY KEY,
    owner_company_id    BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    uploaded_by         BIGINT REFERENCES users(id) ON DELETE SET NULL,
    file_name           TEXT NOT NULL,
    storage_path        TEXT NOT NULL,
    mime_type           TEXT NOT NULL,
    size_bytes          BIGINT NOT NULL,
    width               INTEGER,
    height              INTEGER,
    duration_sec        NUMERIC(10,2),
    checksum            TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: presets for facade
CREATE TABLE facade_presets (
    id                  BIGSERIAL PRIMARY KEY,
    facade_id           BIGINT NOT NULL REFERENCES facades(id) ON DELETE CASCADE,
    name                TEXT NOT NULL,
    description         TEXT,
    media_file_id       BIGINT REFERENCES media_files(id) ON DELETE SET NULL,
    brightness          INTEGER,
    color_temperature   INTEGER,
    created_by          BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGNS + SCHEDULES + FACADES
-- ============================================================

CREATE TABLE campaigns (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    external_ref    TEXT,

    status          TEXT NOT NULL DEFAULT 'draft', 
    -- allowed: draft | scheduled | live | paused | finished | cancelled

    start_at        TIMESTAMPTZ,
    end_at          TIMESTAMPTZ,

    total_budget    NUMERIC(14,2),
    currency        TEXT DEFAULT 'RUB',

    created_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    updated_by      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_schedules (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    days_of_week    TEXT NOT NULL,   -- "mon,tue,wed"
    start_time      TIME NOT NULL,
    end_time        TIME NOT NULL,
    timezone        TEXT NOT NULL DEFAULT 'Europe/Moscow',
    priority        INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_creatives (
    id              BIGSERIAL PRIMARY KEY,
    campaign_id     BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    media_file_id   BIGINT NOT NULL REFERENCES media_files(id),
    name            TEXT,
    weight          INTEGER NOT NULL DEFAULT 1,
    duration_sec    NUMERIC(10,2),
    safe_area_json  JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE campaign_facades (
    id                  BIGSERIAL PRIMARY KEY,
    campaign_id         BIGINT NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    facade_id           BIGINT NOT NULL REFERENCES facades(id) ON DELETE CASCADE,

    slot_duration_sec   INTEGER NOT NULL DEFAULT 15,
    max_spots_per_hour  INTEGER,
    share_of_voice_pct  NUMERIC(5,2),

    start_at            TIMESTAMPTZ,
    end_at              TIMESTAMPTZ,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(campaign_id, facade_id)
);

-- ============================================================
-- PLAYOUT LOGS (REAL SHOWS ON FACADE)
-- ============================================================

CREATE TABLE playout_logs (
    id              BIGSERIAL PRIMARY KEY,
    facade_id       BIGINT NOT NULL REFERENCES facades(id) ON DELETE CASCADE,
    campaign_id     BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    creative_id     BIGINT REFERENCES campaign_creatives(id) ON DELETE SET NULL,

    started_at      TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ,
    duration_sec    NUMERIC(10,2),

    source          TEXT,  -- scheduled | manual | fallback
    trace_id        TEXT,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- BILLING: RATE CARDS, INVOICES, PAYMENTS
-- ============================================================

CREATE TABLE rate_cards (
    id              BIGSERIAL PRIMARY KEY,
    facade_id       BIGINT NOT NULL REFERENCES facades(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    cpm             NUMERIC(14,4),
    cost_per_spot   NUMERIC(14,4),
    cost_per_second NUMERIC(14,4),
    currency        TEXT NOT NULL DEFAULT 'RUB',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
    id              BIGSERIAL PRIMARY KEY,
    company_id      BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invoice_number  TEXT NOT NULL UNIQUE,
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    amount_total    NUMERIC(14,2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'RUB',
    status          TEXT NOT NULL DEFAULT 'pending',
    due_date        DATE,
    issued_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoice_lines (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,

    line_type       TEXT NOT NULL,
    campaign_id     BIGINT REFERENCES campaigns(id) ON DELETE SET NULL,
    facade_id       BIGINT REFERENCES facades(id) ON DELETE SET NULL,

    description     TEXT NOT NULL,
    quantity        NUMERIC(14,4) NOT NULL DEFAULT 1,
    unit            TEXT,
    unit_price      NUMERIC(14,4),
    amount          NUMERIC(14,2) NOT NULL,
    meta            JSONB,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
    id              BIGSERIAL PRIMARY KEY,
    invoice_id      BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    amount          NUMERIC(14,2) NOT NULL,
    currency        TEXT NOT NULL DEFAULT 'RUB',
    method          TEXT,
    paid_at         TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- USER PREFERENCES
-- ============================================================

CREATE TABLE user_preferences (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    language            TEXT DEFAULT 'en',
    units               TEXT DEFAULT 'metric',
    time_format_24h     BOOLEAN NOT NULL DEFAULT TRUE,
    theme               TEXT DEFAULT 'light',

    quiet_mode          BOOLEAN NOT NULL DEFAULT FALSE,
    notifications_email BOOLEAN NOT NULL DEFAULT TRUE,
    notifications_push  BOOLEAN NOT NULL DEFAULT FALSE,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE(user_id)
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
    id              BIGSERIAL PRIMARY KEY,
    actor_user_id   BIGINT REFERENCES users(id) ON DELETE SET NULL,
    company_id      BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    entity_type     TEXT NOT NULL,
    entity_id       BIGINT,
    meta            JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- END OF SCHEMA
-- ============================================================
