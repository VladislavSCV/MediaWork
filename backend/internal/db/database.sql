-- =========================================
-- 🧩 Таблица форматов экранов
-- =========================================
CREATE TABLE screen_formats (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс по названию для быстрых LIKE / поиска
CREATE INDEX idx_screen_formats_name ON screen_formats (name text_pattern_ops);

-- =========================================
-- 🧩 Таблица операторов рекламы
-- =========================================
CREATE TABLE operators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индекс для частых поисков по имени
CREATE INDEX idx_operators_name ON operators (name text_pattern_ops);

-- =========================================
-- 🧩 Таблица экранов
-- =========================================
CREATE TABLE screens (
    id SERIAL PRIMARY KEY,

    format_id INT NOT NULL REFERENCES screen_formats(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    operator_id INT NOT NULL REFERENCES operators(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    duration_seconds INT NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 600),
    width_px INT NOT NULL CHECK (width_px > 0 AND width_px < 32768),
    height_px INT NOT NULL CHECK (height_px > 0 AND height_px < 32768),
    font_size_px INT CHECK (font_size_px IS NULL OR (font_size_px > 0 AND font_size_px < 200)),

    comment TEXT,
    tech_requirements_link TEXT CHECK (
        tech_requirements_link IS NULL OR tech_requirements_link ~* '^https?://'
    ),

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- ⚙️ Триггер для автообновления updated_at
-- =========================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_screens_timestamp
BEFORE UPDATE ON screens
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =========================================
-- ⚡ Индексы и оптимизация
-- =========================================

-- Для частого фильтра по формату и оператору
CREATE INDEX idx_screens_format_operator ON screens (format_id, operator_id);

-- Для быстрой сортировки по дате добавления
CREATE INDEX idx_screens_created_at ON screens (created_at DESC);

-- Для полнотекстового поиска по комментариям
CREATE INDEX idx_screens_comment_search ON screens USING GIN (to_tsvector('simple', comment));

-- =========================================
-- 🔐 Дополнительные ограничения целостности
-- =========================================

-- Чтобы один и тот же экран не был добавлен дважды с одинаковыми параметрами
ALTER TABLE screens ADD CONSTRAINT uq_screens_unique_combo UNIQUE (format_id, operator_id, width_px, height_px, duration_seconds);
