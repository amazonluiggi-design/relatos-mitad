-- Relatos Autopilot: esquema inicial.

CREATE TABLE historias (
  id TEXT PRIMARY KEY,               -- p. ej. "cantuna"
  titulo TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'idea', -- idea, guion, voz, imagenes, render, listo, publicado
  semana TEXT,                        -- semana ISO en que sale el largo
  notas TEXT,
  creada TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE videos (
  id TEXT PRIMARY KEY,               -- "cantuna-largo", "cantuna-reel1"
  historia_id TEXT NOT NULL REFERENCES historias(id),
  tipo TEXT NOT NULL,                -- largo | reel
  titulo TEXT NOT NULL,
  gancho TEXT,
  duracion REAL,                     -- segundos
  archivo TEXT,                      -- clave en R2
  miniatura TEXT,                    -- clave en R2
  calidad TEXT NOT NULL DEFAULT 'aprobado', -- aprobado | revision | bloqueado
  calidad_notas TEXT,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Una fila por (video, red). El id evita publicar dos veces lo mismo.
CREATE TABLE publicaciones (
  id TEXT PRIMARY KEY,               -- "<video_id>:<red>"
  video_id TEXT NOT NULL REFERENCES videos(id),
  red TEXT NOT NULL,                 -- facebook | youtube | tiktok
  cuando TEXT NOT NULL,              -- ISO, hora prevista
  estado TEXT NOT NULL,              -- pendiente | programado | enviado | publicado | privado | fallido
  externo_id TEXT,
  url TEXT,
  privacidad TEXT,
  texto TEXT,
  error TEXT,
  intentos INTEGER NOT NULL DEFAULT 0,
  publicado_en TEXT,
  actualizado TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX pub_cuando ON publicaciones(cuando);

-- Foto de las métricas de cada publicación en cada sincronización.
CREATE TABLE metricas (
  pub_id TEXT NOT NULL REFERENCES publicaciones(id),
  momento TEXT NOT NULL,
  vistas INTEGER, me_gusta INTEGER, comentarios INTEGER, compartidos INTEGER,
  extra TEXT,
  PRIMARY KEY (pub_id, momento)
);

-- Seguidores / suscriptores por red a lo largo del tiempo.
CREATE TABLE cuentas_hist (
  red TEXT NOT NULL,
  momento TEXT NOT NULL,
  seguidores INTEGER, vistas_totales INTEGER, videos INTEGER,
  PRIMARY KEY (red, momento)
);

CREATE TABLE eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  nivel TEXT NOT NULL DEFAULT 'info',   -- info | aviso | error
  red TEXT,
  mensaje TEXT NOT NULL
);

CREATE TABLE config (
  clave TEXT PRIMARY KEY,
  valor TEXT NOT NULL
);
INSERT INTO config VALUES
  ('pausa', '0'),
  ('hora_reel', '19:30'),
  ('max_imagenes_semana', '140'),
  ('max_caracteres_voz_mes', '30000');
