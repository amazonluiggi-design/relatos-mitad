-- RELATOS AI GROUP (V3, fase 8): RELATOS GAMING MEDIA — marca, creadores autorizados y RIGHTS MANAGER.
-- Regla: nada de Gaming entra a una publicación monetizada sin autorización COMERCIAL documentada de todos los titulares.

INSERT OR IGNORE INTO config (clave, valor) VALUES
  ('gaming-marca', '{"nombre":null,"especialidad":"Grand Theft Auto (enfoque GTA VI; GTA V como contexto)","redes":{"facebook":null,"youtube":null,"tiktok":null},"pilares":["Clips divertidos","Noticias y novedades","Curiosidades y secretos"]}');

CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division_id TEXT NOT NULL DEFAULT 'gaming',
  nombre TEXT NOT NULL,
  canal TEXT,                          -- URL del canal
  contacto TEXT,
  propietario_grabacion TEXT,          -- quién es dueño de la grabación
  fecha_autorizacion TEXT,
  plataformas TEXT,                    -- JSON ["youtube","tiktok","facebook"]
  uso_comercial INTEGER NOT NULL DEFAULT 0,
  publicidad_patrocinios INTEGER NOT NULL DEFAULT 0,
  modificaciones TEXT,                 -- qué ediciones permite
  atribucion TEXT,                     -- cómo hay que darle crédito
  territorios TEXT,
  vence TEXT,                          -- fin del permiso (NULL = sin fecha)
  pruebas TEXT,                        -- dónde está la prueba (correo, documento, captura)
  restricciones TEXT,
  creado TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Un registro por recurso y titular (un clip de un streamer tiene al menos 2 titulares: el creador y Rockstar).
CREATE TABLE IF NOT EXISTS rights_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  division_id TEXT NOT NULL DEFAULT 'gaming',
  recurso TEXT NOT NULL,               -- clave del recurso: "base-gta", "clip:<url>", "musica:<tema>", "gameplay:<archivo>"
  tipo TEXT NOT NULL,                  -- gameplay-propio | clip-creador | musica | imagen | marca | material-oficial
  titular TEXT NOT NULL,               -- Rockstar Games, nombre del creador, sello musical…
  creator_id INTEGER REFERENCES creators(id),
  estado TEXT NOT NULL DEFAULT 'pendiente', -- pendiente | autorizado | no-comercial | comercial | restricciones | rechazado | vencido
  plataformas TEXT,
  vence TEXT,
  base TEXT,                           -- base de la autorización (contrato, política pública citada con fecha, licencia)
  pruebas TEXT,
  restricciones TEXT,
  verificado_por TEXT,
  actualizado TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS derechos_recurso ON rights_permissions(recurso);

-- Titular base: todo material de GTA depende de Rockstar. Queda PENDIENTE hasta verificar su política vigente.
INSERT INTO rights_permissions (recurso, tipo, titular, estado, base, restricciones, verificado_por) VALUES
  ('base-gta', 'material-oficial', 'Rockstar Games / Take-Two', 'pendiente',
   'Política pública "Policy on posting copyrighted Rockstar Games material" — NO VERIFICADA: la página no cargó el 2026-11-06 (timeout). Según el V3 el permiso de fan content no equivale a autorización comercial.',
   'Hasta verificar: sin publicaciones monetizadas con gameplay, música, cinemáticas ni material de Rockstar. Sin filtraciones, copias anticipadas ni spoilers no autorizados. No implicar asociación oficial. No usar su material para alimentar IA generativa.',
   'michael');

INSERT INTO company_memory (division_id, tipo, titulo, contenido, autor, fuentes, confianza) VALUES
  ('gaming', 'tendencia', 'GTA VI: fecha oficial verificada (6-nov-2026)',
   'La página oficial de Rockstar anuncia "Coming November 19, 2026" para PlayStation 5 y Xbox Series X|S ("Plays Best On PlayStation 5"). Precarga desde el 10 de noviembre (Newswire del 3-nov). Clasificación ESRB Mature. No menciona PC. Volver a verificar antes de cada campaña.',
   'michael', '[{"titulo":"Grand Theft Auto VI — Rockstar Games","url":"https://www.rockstargames.com/VI","fecha":"2026-11-06"}]', 'alta'),
  ('gaming', 'decision', 'Rights Manager: Rockstar pendiente de verificación',
   'La política de copyright de Rockstar no pudo leerse el 6-nov (timeout). Hasta leerla y registrarla, el titular base "Rockstar Games" queda PENDIENTE: ninguna pieza con material de GTA puede ir a publicación monetizada. Se permite investigación editorial y preparación de material original.',
   'michael', '[{"titulo":"Policy on posting copyrighted Rockstar Games material","url":"https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-Rockstar-Games-material","fecha":"2026-11-06 (no cargó)"}]', 'alta');
