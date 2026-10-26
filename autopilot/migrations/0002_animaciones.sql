-- Escenas que el dueño anima en Flow (Veo) y sube desde el panel.
CREATE TABLE animaciones (
  id TEXT PRIMARY KEY,               -- "<historia>:<escena>"
  historia_id TEXT NOT NULL REFERENCES historias(id),
  escena TEXT NOT NULL,
  orden INTEGER NOT NULL,
  descripcion TEXT NOT NULL,         -- qué pasa en la escena (español)
  instruccion TEXT NOT NULL,         -- prompt para Flow
  imagen TEXT NOT NULL,              -- clave en R2
  clip TEXT,                         -- clave en R2 del video subido
  subido TEXT
);
