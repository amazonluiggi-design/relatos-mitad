-- RELATOS AI GROUP (V3, fase 4): presupuesto, botón de emergencia, respaldos y controles de Sentinel.

-- Libro de costos. division_id NULL = gasto compartido del grupo.
CREATE TABLE IF NOT EXISTS cost_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  mes TEXT NOT NULL DEFAULT (strftime('%Y-%m', 'now', '-5 hours')), -- mes de Ecuador
  division_id TEXT,
  proveedor TEXT NOT NULL,            -- anthropic | elevenlabs | cloudflare | workers-ai | github | otro
  concepto TEXT NOT NULL,
  monto_usd REAL NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'real',  -- real (factura/precio exacto) | estimado (precio de lista o cálculo)
  unidades REAL,                      -- letras, imágenes, tokens…
  unidad TEXT,
  agente TEXT,                        -- quién lo gastó (script, agente, persona)
  ref TEXT UNIQUE                     -- evita registrar dos veces lo mismo (p. ej. "sub:cloudflare:2026-11")
);
CREATE INDEX IF NOT EXISTS costos_mes ON cost_ledger(mes);

-- Topes (USD por mes). 'total' nunca puede pasar de 75 sin autorización del propietario.
INSERT OR IGNORE INTO config (clave, valor) VALUES
  ('presupuesto', '{"total":75,"diario":6,"proveedores":{"anthropic":40,"elevenlabs":12,"infraestructura":10,"reserva":13}}'),
  -- Suscripciones fijas que se anotan solas el día 1 de cada mes (precio de lista: tipo estimado hasta ver la factura).
  ('suscripciones', '[{"proveedor":"cloudflare","grupo":"infraestructura","concepto":"Workers Paid","monto":5,"tipo":"real"},{"proveedor":"elevenlabs","grupo":"elevenlabs","concepto":"Plan Starter (30.000 letras)","monto":5,"tipo":"estimado"}]'),
  -- Botón DETENER EMPRESA: qué está detenido.
  ('detener', '{"grupo":false,"relatos":false,"gaming":false,"publicaciones":false,"renderizados":false,"agentes":false,"apis":false}');

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  clave_r2 TEXT NOT NULL,
  bytes INTEGER,
  tablas INTEGER,
  filas INTEGER,
  estado TEXT NOT NULL,               -- ok | error
  detalle TEXT,
  restaurado_prueba TEXT              -- fecha de la última prueba de restauración exitosa
);

-- Bajada: DROP TABLE backups; DROP TABLE cost_ledger; DELETE FROM config WHERE clave IN ('presupuesto','suscripciones','detener');
