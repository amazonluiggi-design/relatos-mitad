// Publica como HISTORIA de la página de Facebook el reel del día (las historias salen arriba para los seguidores).
// node scripts/fb-historia.mjs [video_id]   sin argumento: el último reel de Facebook ya publicado hoy (hora de Ecuador).
// Registro en publicaciones/fb-historias.json para no repetir.
import fs from "node:fs";
import os from "node:os";
import { bajar } from "./nube.mjs";
const P = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/facebook-pagina.json", "utf8"));
const CLAVE = process.env.RELATOS_CLAVE || fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
const G = "https://graph.facebook.com/v23.0", registro = "publicaciones/fb-historias.json";
const hechas = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, "utf8")) : {};
let id = process.argv[2];
if (!id) {
  const pubs = await (await fetch("https://relatos-autopilot.probador-worker.workers.dev/api/publicaciones", { headers: { "x-clave": CLAVE } })).json();
  const hoy = new Date(Date.now() - 5 * 36e5).toISOString().slice(0, 10);
  const del_dia = pubs.filter((p) => p.red === "facebook" && /-reel\d+$/.test(p.video_id) && new Date(p.cuando) <= new Date()
    && new Date(new Date(p.cuando) - 5 * 36e5).toISOString().slice(0, 10) === hoy && !hechas[p.video_id]).sort((a, b) => b.cuando.localeCompare(a.cuando));
  if (!del_dia.length) { console.log("hoy no hay reel nuevo para la historia"); process.exit(0); }
  id = del_dia[0].video_id;
}
if (hechas[id]) { console.log(id, "ya salió como historia"); process.exit(0); }
const h = id.replace(/-reel\d+$/, ""), k = id.slice(h.length + 1), archivo = `out/${id}.mp4`;
fs.mkdirSync("out", { recursive: true });
if (!fs.existsSync(archivo)) await bajar(`${h}/${k}.mp4`, archivo);
const buf = fs.readFileSync(archivo);
const ini = await (await fetch(`${G}/${P.id}/video_stories`, { method: "POST", body: new URLSearchParams({ upload_phase: "start", access_token: P.token }) })).json();
if (!ini.video_id) throw new Error("inicio: " + JSON.stringify(ini));
const up = await (await fetch(ini.upload_url, { method: "POST", headers: { Authorization: "OAuth " + P.token, offset: "0", file_size: String(buf.length) }, body: buf })).json();
if (!up.success) throw new Error("subida: " + JSON.stringify(up));
const fin = await (await fetch(`${G}/${P.id}/video_stories`, { method: "POST", body: new URLSearchParams({ upload_phase: "finish", video_id: ini.video_id, access_token: P.token }) })).json();
if (!fin.success) throw new Error("fin: " + JSON.stringify(fin));
hechas[id] = { post: fin.post_id, cuando: new Date().toISOString() };
fs.writeFileSync(registro, JSON.stringify(hechas, null, 1));
console.log(id, "publicado como historia:", fin.post_id);
