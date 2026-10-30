-- Plan de crecimiento: recomendaciones escritas por Claude (o el sistema) y su seguimiento.
CREATE TABLE recomendaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creada TEXT NOT NULL DEFAULT (datetime('now')),
  prioridad TEXT NOT NULL DEFAULT 'media', -- alta | media | baja
  area TEXT NOT NULL,                       -- contenido | youtube | facebook | tiktok | estrategia
  quien TEXT NOT NULL DEFAULT 'claude',     -- claude (lo hago yo) | usuario (lo haces tú)
  titulo TEXT NOT NULL,
  detalle TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | hecho | descartado
  actualizado TEXT
);
