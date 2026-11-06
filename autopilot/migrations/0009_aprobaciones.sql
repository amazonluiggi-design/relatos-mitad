-- RELATOS AI GROUP (V3, fase 10): bandeja de revisión. Decisión del propietario (2026-11-06): la publicación sigue
-- automática; la bandeja informa y deja registro. "bloqueado" frena lo que aún controla el panel (TikTok y lo no programado).
CREATE TABLE IF NOT EXISTS approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division_id TEXT NOT NULL DEFAULT 'relatos',
  video_id TEXT NOT NULL REFERENCES videos(id),
  decision TEXT NOT NULL,             -- visto | cambios | bloqueado | desbloqueado
  plataformas TEXT,
  nota TEXT,
  user_id INTEGER,
  por TEXT NOT NULL,
  cuando TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS aprob_video ON approvals(video_id, cuando);
