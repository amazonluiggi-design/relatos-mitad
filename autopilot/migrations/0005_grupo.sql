-- RELATOS AI GROUP (V3, fase 2): empresa matriz, divisiones, usuarios, sesiones revocables y auditoría.
-- No mueve ni borra datos: las tablas existentes pasan a pertenecer a la división 'relatos'.

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  zona TEXT NOT NULL DEFAULT 'America/Guayaquil',
  moneda TEXT NOT NULL DEFAULT 'USD',
  presupuesto_mensual REAL NOT NULL DEFAULT 75,
  creada TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO organizations (id, nombre) VALUES ('grupo', 'RELATOS AI GROUP');

CREATE TABLE IF NOT EXISTS divisions (
  id TEXT PRIMARY KEY,                -- relatos | gaming
  org_id TEXT NOT NULL REFERENCES organizations(id),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  estado TEXT NOT NULL DEFAULT 'activa', -- activa | preparacion | detenida
  creada TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO divisions (id, org_id, nombre, descripcion, estado) VALUES
  ('relatos', 'grupo', 'RELATOS AI MEDIA AGENCY', 'Historias, documentales, misterios, curiosidades y producción audiovisual inteligente.', 'activa'),
  ('gaming', 'grupo', 'RELATOS GAMING MEDIA', 'Gaming, GTA, clips, noticias, curiosidades, entretenimiento y producción especializada.', 'preparacion');

-- Usuarios: hoy solo el propietario. No hay registro público.
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  correo TEXT NOT NULL UNIQUE COLLATE NOCASE,
  nombre TEXT,
  rol TEXT NOT NULL DEFAULT 'propietario',  -- propietario | admin | editor | lector
  clave_hash TEXT NOT NULL,                -- "pbkdf2$<iter>$<sal>$<hash>" o "sal:hash" heredado
  totp_cifrado TEXT,                       -- secreto TOTP cifrado (AES-GCM)
  totp_activo INTEGER NOT NULL DEFAULT 0,
  totp_ultimo_paso INTEGER NOT NULL DEFAULT 0, -- evita reutilizar el mismo código
  recuperacion TEXT,                       -- JSON con hashes de códigos de un solo uso
  fallos INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta TEXT,
  activo INTEGER NOT NULL DEFAULT 1,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Acceso de cada usuario a cada división (para futuros empleados). El propietario ve todo.
CREATE TABLE IF NOT EXISTS user_divisions (
  user_id INTEGER NOT NULL REFERENCES users(id),
  division_id TEXT NOT NULL REFERENCES divisions(id),
  rol TEXT NOT NULL DEFAULT 'lector',
  PRIMARY KEY (user_id, division_id)
);

-- Sesiones guardadas (la cookie solo lleva un número aleatorio; aquí se guarda su hash).
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                -- SHA-256 del token de la cookie
  user_id INTEGER NOT NULL REFERENCES users(id),
  nivel TEXT NOT NULL,                -- mfa (falta el código) | completa
  origen TEXT NOT NULL DEFAULT 'clave', -- clave | portal
  creada TEXT NOT NULL DEFAULT (datetime('now')),
  ultima TEXT NOT NULL DEFAULT (datetime('now')),
  vence TEXT NOT NULL,
  ip TEXT,
  agente TEXT,
  revocada INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  user_id INTEGER,
  actor TEXT NOT NULL,                -- correo, "script", "cron", nombre del agente
  accion TEXT NOT NULL,               -- login, logout, mfa-activado, pausa, aprobar…
  division_id TEXT,
  detalle TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS audit_cuando ON audit_logs(cuando);

CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  tipo TEXT NOT NULL,                 -- login-fallido, bloqueo, mfa-fallido, origen-invalido…
  severidad TEXT NOT NULL DEFAULT 'baja', -- baja | media | alta
  detalle TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS seg_cuando ON security_events(cuando);

-- Las tablas de Relatos Autopilot pasan a la división 'relatos'.
ALTER TABLE historias ADD COLUMN division_id TEXT NOT NULL DEFAULT 'relatos';
ALTER TABLE videos ADD COLUMN division_id TEXT NOT NULL DEFAULT 'relatos';
ALTER TABLE publicaciones ADD COLUMN division_id TEXT NOT NULL DEFAULT 'relatos';
ALTER TABLE eventos ADD COLUMN division_id TEXT NOT NULL DEFAULT 'relatos';
ALTER TABLE recomendaciones ADD COLUMN division_id TEXT NOT NULL DEFAULT 'relatos';

-- Bajada (manual, si hiciera falta):
--   ALTER TABLE historias DROP COLUMN division_id; (ídem videos, publicaciones, eventos, recomendaciones)
--   DROP TABLE security_events; DROP TABLE audit_logs; DROP TABLE sessions; DROP TABLE user_divisions;
--   DROP TABLE users; DROP TABLE divisions; DROP TABLE organizations;
