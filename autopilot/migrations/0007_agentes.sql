-- RELATOS AI GROUP (V3, fase 6): agentes, tareas, eventos (alimentan la oficina virtual), memoria empresarial y experimentos.

CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,                 -- michael, andy, oscar…
  nombre TEXT NOT NULL,
  cargo TEXT NOT NULL,
  departamento TEXT NOT NULL,
  division_id TEXT,                    -- NULL = del grupo (Michael, Sentinel)
  estado TEXT NOT NULL DEFAULT 'disponible', -- disponible | investigando | analizando | escribiendo | produciendo | renderizando | revisando | coordinando | pausa | error | no-activado
  tarea_actual INTEGER,
  desde TEXT,                          -- desde cuándo está en ese estado
  herramientas TEXT,                   -- JSON: lo que puede usar
  activo INTEGER NOT NULL DEFAULT 1
);

INSERT OR IGNORE INTO agents (id, nombre, cargo, departamento, division_id, herramientas, activo, estado) VALUES
  ('michael',  'Michael',  'Group CEO',                         'Dirección',     NULL,      '["leer panel","crear tareas","verificar entregables","informes"]', 1, 'disponible'),
  ('sentinel', 'Sentinel', 'Chief Security Officer',            'Seguridad',     NULL,      '["leer seguridad","informes"]', 1, 'disponible'),
  ('andy',     'Andy',     'Investigación de redes y nichos',   'Investigación', 'relatos', '["leer panel","búsqueda web","informes"]', 1, 'disponible'),
  ('oscar',    'Oscar',    'Director de analítica y estrategia','Analítica',     'relatos', '["leer panel","cálculos","informes","experimentos"]', 1, 'disponible'),
  ('ryan',     'Ryan',     'Guionista',                         'Contenido',     'relatos', '["leer panel","búsqueda web","guiones"]', 1, 'disponible'),
  ('kelly',    'Kelly',    'Marketing',                         'Marketing',     'relatos', '["leer panel","títulos y ganchos"]', 1, 'disponible'),
  ('jim',      'Jim',      'Producción audiovisual',            'Producción',    'relatos', '["planes de video"]', 1, 'disponible'),
  ('dwight',   'Dwight',   'Control de calidad',                'Calidad',       'relatos', '["revisar entregables","puntuar 0-100"]', 1, 'disponible'),
  ('pam',      'Pam',      'Distribución',                      'Distribución',  'relatos', '["leer agenda","preparar metadatos"]', 1, 'disponible'),
  ('angela',   'Angela',   'Finanzas',                          'Finanzas',      'relatos', '["leer presupuesto","informes"]', 1, 'disponible'),
  ('g-scout',     'Gaming Scout',        'Novedades y tendencias GTA', 'Investigación', 'gaming', '["búsqueda web","informes"]', 0, 'no-activado'),
  ('g-analyst',   'Gaming Analyst',      'Formatos y oportunidades',   'Analítica',     'gaming', '["informes"]', 0, 'no-activado'),
  ('g-writer',    'Gaming Writer',       'Guiones y noticias',         'Contenido',     'gaming', '["guiones"]', 0, 'no-activado'),
  ('g-rights',    'Gaming Rights Manager','Derechos y autorizaciones', 'Derechos',      'gaming', '["registro de derechos"]', 0, 'no-activado');

CREATE TABLE IF NOT EXISTS agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division_id TEXT,
  agente_id TEXT NOT NULL REFERENCES agents(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  prioridad TEXT NOT NULL DEFAULT 'media',  -- alta | media | baja
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | en-curso | en-revision | hecha | rechazada | error | bloqueada
  depende_de INTEGER REFERENCES agent_tasks(id),
  creada_por TEXT NOT NULL,                 -- propietario | michael | <agente>
  creada TEXT NOT NULL DEFAULT (datetime('now')),
  tomada TEXT,
  terminada TEXT,
  resultado TEXT,                           -- markdown del entregable
  calidad INTEGER,                          -- puntuación de Dwight 0-100
  revision TEXT,                            -- comentario de Dwight
  error TEXT
);
CREATE INDEX IF NOT EXISTS tareas_estado ON agent_tasks(estado, agente_id);

CREATE TABLE IF NOT EXISTS agent_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cuando TEXT NOT NULL DEFAULT (datetime('now')),
  agente_id TEXT NOT NULL,
  tarea_id INTEGER,
  estado TEXT,                              -- el estado visible en la oficina
  mensaje TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ev_agente ON agent_events(agente_id, cuando);

-- Memoria empresarial: informes, aprendizajes, decisiones, nichos, tendencias. Nunca secretos.
CREATE TABLE IF NOT EXISTS company_memory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division_id TEXT,
  tipo TEXT NOT NULL,                       -- informe | aprendizaje | decision | nicho | tendencia | diagnostico
  titulo TEXT NOT NULL,
  contenido TEXT NOT NULL,                  -- markdown
  autor TEXT NOT NULL,
  fuentes TEXT,                             -- JSON [{titulo,url,fecha}]
  confianza TEXT,                           -- alta | media | baja
  tarea_id INTEGER,
  version INTEGER NOT NULL DEFAULT 1,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS memoria_div ON company_memory(division_id, tipo, creado);

CREATE TABLE IF NOT EXISTS experiments (
  id TEXT PRIMARY KEY,                      -- E-FB1
  division_id TEXT NOT NULL,
  titulo TEXT NOT NULL,
  hipotesis TEXT NOT NULL,
  plataforma TEXT NOT NULL,
  nicho TEXT, formato TEXT, duracion TEXT, gancho TEXT, audiencia TEXT, objetivo TEXT,
  metrica TEXT NOT NULL,
  criterio_exito TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'diseñado',  -- diseñado | en-produccion | en-curso | terminado | descartado
  inicio TEXT, fin TEXT,
  resultado TEXT, conclusion TEXT,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO experiments (id, division_id, titulo, hipotesis, plataforma, nicho, formato, duracion, gancho, audiencia, objetivo, metrica, criterio_exito) VALUES
  ('E-FB1', 'relatos', 'Reels cortos con gancho escrito desde el primer cuadro',
   'En Facebook el abandono ocurre antes de los 6 s (media 6,1 s). Un reel de 15-25 s con el gancho escrito en pantalla desde el cuadro 1 retendrá más y será más distribuido que los reels actuales de 37-74 s.',
   'facebook', 'leyendas y tesoros de Ecuador', 'reel vertical', '15-25 s', 'pregunta escrita en pantalla desde el primer cuadro',
   'audiencia nueva de FB (la página está dormida)', 'más vistas y retención en FB',
   'vistas por reel a 72 h y tiempo medio visto',
   'Con al menos 6 reels de cada grupo: mediana de vistas a 72 h ≥ 2× la de los reels actuales (6) y tiempo medio ≥ 40 % de la duración. Si no hay 6 de cada grupo, no se declara ganador.');

INSERT INTO company_memory (division_id, tipo, titulo, contenido, autor, confianza) VALUES
  ('relatos', 'diagnostico', 'Diagnóstico de Facebook (6-nov-2026)',
   'Audiencia dormida: +1 seguidor en 90 días y 8 vistas al día antes de Relatos. Los mismos reels sacan una mediana de 6 vistas en FB, 294 en YT y 404 en TT. Monetización en verde, sin sanciones, solo Estrellas activo; monetización de contenido por invitación. Categoría cambiada a Creador(a) digital el 6-nov. Documento completo: docs/DIAGNOSTICO-FACEBOOK-2026-11-06.md',
   'michael', 'media');

-- Primeras tareas reales (las toma la jornada de agentes).
INSERT INTO agent_tasks (division_id, agente_id, titulo, descripcion, prioridad, creada_por) VALUES
  ('relatos', 'ryan', 'Guiones de 6 reels cortos para el experimento E-FB1',
   'Escribe 6 guiones de reel de 15-25 s (40-60 palabras) a partir de las historias ya publicadas (historias/*.mjs: cantuna, llanganates, dama-tapada, padre-almeida, caja-ronca, isla-plata, el-dorado). Cada uno: gancho escrito en pantalla para el primer cuadro (máx. 8 palabras, pregunta o dato fuerte), texto de narración, escenas que se pueden reutilizar (ids de escenas existentes de esa historia), cierre que lleve a la historia completa. Hechos verificables: nada inventado presentado como historia real.', 'alta', 'michael'),
  ('relatos', 'andy', 'Investigación de nichos: los 3 mejores para el grupo',
   'Evalúa al menos 8 nichos (capítulo 9 del V3) con la puntuación de 100: demanda 20, retención potencial 20, monetización 20, competencia 15, facilidad de producción 15, diferenciación 10. Usa fuentes públicas con fecha y nuestros datos (el oro y los tesoros es lo que más rinde en YT y TT). Entrega una tabla y los 3 mejores con justificación. Una tendencia no garantiza rentabilidad.', 'media', 'michael'),
  ('relatos', 'oscar', 'Informe comparativo de las 3 redes (primeras 2 semanas)',
   'Con los datos del panel: vistas por formato y red, mediana y mejores piezas, qué ganchos funcionan (por título), crecimiento de seguidores. No compares cifras entre redes sin explicar que se miden distinto. Termina con 3 recomendaciones con evidencia y confianza.', 'media', 'michael');
