// Publica un reel en TikTok (Direct Post, archivo local). Renueva el token si hace falta.
// node scripts/tt-publicar.mjs cantuna reel1   → registro en publicaciones/<h>-tt.json
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
process.chdir(path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const [, , nombre, id] = process.argv;
const { PUBLICACION } = await import(`../publicaciones/${nombre}.mjs`);
const f = os.homedir() + "/.relatos-secretos/tiktok-token.json";
let T = JSON.parse(fs.readFileSync(f, "utf8"));
const registro = `publicaciones/${nombre}-tt.json`;
const hecho = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, "utf8")) : {};
const log = (...a) => { const l = `[${new Date().toISOString()}] ${id}: ${a.join(" ")}`; console.log(l); fs.appendFileSync("publicaciones/tiktok.log", l + "\n"); };
if (hecho[id]) { log("ya publicado", hecho[id].publish_id); process.exit(0); }

if (Date.now() > T.obtenido + (T.expires_in - 600) * 1000) {
  const n = await (await fetch("https://open.tiktokapis.com/v2/oauth/token/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: T.client_key, client_secret: T.client_secret, grant_type: "refresh_token", refresh_token: T.refresh_token }) })).json();
  if (!n.access_token) { log("ERROR renovando token", JSON.stringify(n)); process.exit(1); }
  T = { ...T, ...n, obtenido: Date.now() };
  fs.writeFileSync(f, JSON.stringify(T));
}
const H = { Authorization: `Bearer ${T.access_token}`, "Content-Type": "application/json; charset=UTF-8" };
const n = +id.replace("reel", "") - 1;
const p = PUBLICACION.reels[n];
const buf = fs.readFileSync(p.archivo);
const titulo = p.texto.replace("Relato completo en la página 👆", "Relato completo en YouTube 👆").replace("El final completo en la página 👆", "El final completo en YouTube 👆").slice(0, 2200);

async function iniciar(privacidad) {
  return (await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", { method: "POST", headers: H, body: JSON.stringify({
    post_info: { title: titulo, privacy_level: privacidad, disable_comment: false, disable_duet: false, disable_stitch: false, is_aigc: true },
    source_info: { source: "FILE_UPLOAD", video_size: buf.length, chunk_size: buf.length, total_chunk_count: 1 },
  }) })).json();
}
let privacidad = "PUBLIC_TO_EVERYONE";
let ini = await iniciar(privacidad);
if (ini.error?.code !== "ok") {
  log("público no permitido:", ini.error?.code, "→ privado");
  privacidad = "SELF_ONLY";
  ini = await iniciar(privacidad);
}
if (ini.error?.code !== "ok") { log("ERROR init", JSON.stringify(ini.error)); process.exit(1); }
const up = await fetch(ini.data.upload_url, { method: "PUT", headers: { "Content-Type": "video/mp4", "Content-Length": String(buf.length), "Content-Range": `bytes 0-${buf.length - 1}/${buf.length}` }, body: buf });
if (!up.ok) { log("ERROR subida", up.status, await up.text()); process.exit(1); }
let estado;
for (let i = 0; i < 40; i++) {
  await new Promise((r) => setTimeout(r, 6000));
  estado = (await (await fetch("https://open.tiktokapis.com/v2/post/publish/status/fetch/", { method: "POST", headers: H, body: JSON.stringify({ publish_id: ini.data.publish_id }) })).json()).data;
  if (["PUBLISH_COMPLETE", "FAILED"].includes(estado?.status)) break;
}
log("estado:", estado?.status, estado?.fail_reason || "", "| privacidad:", privacidad);
if (estado?.status === "PUBLISH_COMPLETE") {
  hecho[id] = { publish_id: ini.data.publish_id, privacidad, cuando: new Date().toISOString() };
  fs.writeFileSync(registro, JSON.stringify(hecho, null, 1));
}
