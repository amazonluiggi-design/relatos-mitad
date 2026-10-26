// Registra en D1 una historia ya producida: videos y publicaciones (con los IDs reales de FB/YT).
// node autopilot/scripts/registrar-historia.mjs cantuna   (desde ~/relatos-mitad)
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const h = process.argv[2];
const { HISTORIA, REELS } = await import(`../../historias/${h}.mjs`);
const { PUBLICACION, YOUTUBE } = await import(`../../publicaciones/${h}.mjs`);
const plan = JSON.parse(fs.readFileSync(`src/datos/${h}-plan.json`, "utf8"));
const fb = fs.existsSync(`publicaciones/${h}-fb.json`) ? JSON.parse(fs.readFileSync(`publicaciones/${h}-fb.json`, "utf8")) : {};
const yt = fs.existsSync(`publicaciones/${h}-yt.json`) ? JSON.parse(fs.readFileSync(`publicaciones/${h}-yt.json`, "utf8")) : {};
const q = (v) => (v === null || v === undefined ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const iso = (s) => new Date(s).toISOString();
const sql = [`INSERT INTO historias (id, titulo, estado, semana) VALUES (${q(h)}, ${q(HISTORIA.titulo)}, 'listo', ${q(PUBLICACION.largo.cuando.slice(0, 10))}) ON CONFLICT(id) DO UPDATE SET titulo = excluded.titulo, estado = 'listo', semana = excluded.semana;`];
sql.push(`INSERT OR REPLACE INTO videos (id, historia_id, tipo, titulo, gancho, duracion, archivo, miniatura) VALUES (${q(h + "-largo")}, ${q(h)}, 'largo', ${q(YOUTUBE.largo.titulo)}, ${q(HISTORIA.escenas[0].texto)}, ${plan.total / plan.fps}, NULL, ${q(h + "/miniatura.jpg")});`);
REELS.forEach((r, i) => sql.push(`INSERT OR REPLACE INTO videos (id, historia_id, tipo, titulo, gancho, duracion, archivo, miniatura) VALUES (${q(`${h}-${r.id}`)}, ${q(h)}, ${q(r.tiktok ? "parte" : "reel")}, ${q(r.gancho)}, ${q(r.gancho)}, ${plan.reels[i].total / plan.fps}, ${q(`${h}/${r.id}.mp4`)}, ${q(`${h}/${r.id}.jpg`)});`));
const pub = (video, red, cuando, estado, externo, texto) =>
  sql.push(`INSERT OR IGNORE INTO publicaciones (id, video_id, red, cuando, estado, externo_id, texto) VALUES (${q(`${video}:${red}`)}, ${q(video)}, ${q(red)}, ${q(iso(cuando))}, ${q(estado)}, ${q(externo)}, ${q(texto)});`);
pub(h + "-largo", "facebook", PUBLICACION.largo.cuando, fb.largo ? "programado" : "pendiente", fb.largo?.id, PUBLICACION.largo.texto);
pub(h + "-largo", "youtube", PUBLICACION.largo.cuando, yt.largo ? "programado" : "pendiente", yt.largo?.id, YOUTUBE.largo.titulo);
PUBLICACION.reels.forEach((r, i) => {
  const id = `${h}-reel${i + 1}`, k = `reel${i + 1}`;
  pub(id, "facebook", r.cuando, fb[k] ? "programado" : "pendiente", fb[k]?.id, r.texto);
  pub(id, "youtube", r.cuando, yt[k] ? "programado" : "pendiente", yt[k]?.id, YOUTUBE.reels[i].titulo);
  pub(id, "tiktok", r.cuando, "pendiente", null, r.texto.replace("en la página 👆", "en YouTube 👆"));
});
(PUBLICACION.partes || []).forEach((p, i) => pub(`${h}-parte${i + 1}`, "tiktok", p.cuando, "pendiente", null, p.texto));
sql.push(`INSERT INTO eventos (nivel, mensaje) VALUES ('info', ${q(`Historia "${HISTORIA.titulo}" registrada con ${REELS.length + 1} videos`)});`);
fs.writeFileSync("prueba/registro.sql", sql.join("\n"));
execFileSync("npx", ["wrangler", "d1", "execute", "relatos-autopilot", "--remote", "--file", "../prueba/registro.sql", "-y"], { cwd: "autopilot", stdio: "inherit", shell: true });
