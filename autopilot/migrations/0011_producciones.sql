-- Pedidos de producción de video que hacen los agentes (Michael/Jim) con un guion aprobado por Dwight.
-- La fábrica en la nube (GitHub Actions, scripts/producir.mjs) los toma: voz → imágenes → render → programación.
CREATE TABLE IF NOT EXISTS producciones (
  id TEXT PRIMARY KEY,               -- id de la historia (slug), igual que historias/<id>.mjs
  division_id TEXT NOT NULL DEFAULT 'relatos',
  guion TEXT NOT NULL,               -- JSON validado (ver agentes/PRODUCCION.md)
  estado TEXT NOT NULL DEFAULT 'pedida', -- pedida | produciendo | renderizando | lista | error
  detalle TEXT,
  tarea_id INTEGER,                  -- tarea del guion aprobada (calidad >= 85)
  pedida_por TEXT NOT NULL,
  creada TEXT NOT NULL DEFAULT (datetime('now')),
  actualizada TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS produccion_estado ON producciones(estado, creada);
