// Publica YA (público, sin programar) un reel en YouTube y lo marca como hecho para que no se vuelva a subir.
// node scripts/yt-ahora.mjs <historia> <reelN>
import fs from "node:fs";
import os from "node:os";
import { bajar, sql } from "./nube.mjs";
const [, , h, k] = process.argv;
const n = +k.replace("reel", "") - 1;
const { PUBLICACION, YOUTUBE } = await import(`../publicaciones/${h}.mjs`);
const p = PUBLICACION.reels[n], y = YOUTUBE.reels[n];
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json()).access_token;
fs.mkdirSync("out", { recursive: true });
if (!fs.existsSync(p.archivo)) await bajar(`${h}/${k}.mp4`, p.archivo);
const buf = fs.readFileSync(p.archivo);
const meta = {
  snippet: { title: y.titulo, description: p.texto.replace("en la página", "en el canal"), tags: YOUTUBE.largo.etiquetas, categoryId: "24", defaultLanguage: "es", defaultAudioLanguage: "es" },
  status: { privacyStatus: "public", selfDeclaredMadeForKids: false, containsSyntheticMedia: true },
};
const ini = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
  method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Length": String(buf.length), "X-Upload-Content-Type": "video/mp4" }, body: JSON.stringify(meta),
});
if (!ini.ok) throw new Error("inicio: " + (await ini.text()).slice(0, 300));
const v = await (await fetch(ini.headers.get("location"), { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf })).json();
if (!v.id) throw new Error("subida: " + JSON.stringify(v).slice(0, 300));
const reg = `publicaciones/${h}-yt.json`;
const hecho = fs.existsSync(reg) ? JSON.parse(fs.readFileSync(reg, "utf8")) : {};
hecho[k] = { id: v.id, cuando: new Date().toISOString(), adelantado: true };
fs.writeFileSync(reg, JSON.stringify(hecho, null, 1));
await sql([`UPDATE publicaciones SET estado = 'publicado', externo_id = '${v.id}', url = 'https://youtu.be/${v.id}', publicado_en = datetime('now') WHERE id = '${h}-${k}:youtube'`,
  `INSERT INTO eventos (nivel, red, mensaje) VALUES ('info', 'youtube', 'Publicado ya en YouTube (adelantado a pedido): ${h}-${k}')`]);
console.log("publicado en YouTube:", v.status?.privacyStatus, "https://youtu.be/" + v.id);
