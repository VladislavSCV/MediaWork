CREATE TABLE operators (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE formats (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE screens (
  id SERIAL PRIMARY KEY,
  format_id INT REFERENCES formats(id),
  operator_id INT REFERENCES operators(id),
  width INT NOT NULL,
  height INT NOT NULL,
  duration_sec INT,
  font_size_px INT,
  comment TEXT,
  tech_file_url TEXT
);

CREATE TABLE facades (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  current_content_url TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE facade_layout (
  id SERIAL PRIMARY KEY,
  facade_id INT REFERENCES facades(id) ON DELETE CASCADE,
  screen_id INT REFERENCES screens(id) ON DELETE CASCADE,
  pos_x INT NOT NULL,
  pos_y INT NOT NULL
);
