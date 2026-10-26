// Sube a YouTube el video largo (programado, con miniatura) y los reels como Shorts.
// node scripts/yt-publicar.mjs cantuna [largo|reel1..]  → publicaciones/<h>-yt.json
import fs from "node:fs";
import os from "node:os";
const [, , nombre, solo] = process.argv;
const { PUBLICACION, YOUTUBE } = await import(`../publicaciones/${nombre}.mjs`);
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const registro = `publicaciones/${nombre}-yt.json`;
const hecho = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, "utf8")) : {};
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json()).access_token;
const H = { Authorization: `Bearer ${tok}` };

async function subir(archivo, meta) {
  const buf = fs.readFileSync(archivo);
  const ini = await fetch("https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status", {
    method: "POST", headers: { ...H, "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Length": String(buf.length), "X-Upload-Content-Type": "video/mp4" },
    body: JSON.stringify(meta),
  });
  if (!ini.ok) throw new Error("inicio: " + (await ini.text()).slice(0, 300));
  const r = await fetch(ini.headers.get("location"), { method: "PUT", headers: { "Content-Type": "video/mp4" }, body: buf });
  const j = await r.json();
  if (!j.id) throw new Error("subida: " + JSON.stringify(j).slice(0, 300));
  return j;
}
const meta = (titulo, descripcion, etiquetas, cuando) => ({
  snippet: { title: titulo, description: descripcion, tags: etiquetas, categoryId: "24", defaultLanguage: "es", defaultAudioLanguage: "es" },
  status: { privacyStatus: "private", publishAt: new Date(cuando).toISOString(), selfDeclaredMadeForKids: false, containsSyntheticMedia: true },
});

const tareas = [["largo", PUBLICACION.largo, YOUTUBE.largo], ...PUBLICACION.reels.map((r, i) => [`reel${i + 1}`, r, YOUTUBE.reels[i]])];
for (const [id, p, y] of tareas) {
  if (solo && solo !== id) continue;
  if (hecho[id]) { console.log(id, "ya subido:", hecho[id].id); continue; }
  const desc = id === "largo" ? y.descripcion(fs.readFileSync(`src/datos/${nombre}-capitulos.txt`, "utf8")) : p.texto.replace("en la página", "en el canal");
  const v = await subir(p.archivo, meta(y.titulo, desc, YOUTUBE.largo.etiquetas, p.cuando));
  console.log(id, "subido", v.id, "| estado:", v.status.privacyStatus, "| publica:", v.status.publishAt, "| sintético:", v.status.containsSyntheticMedia);
  if (id === "largo" && p.miniatura) {
    const m = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${v.id}`, { method: "POST", headers: { ...H, "Content-Type": "image/jpeg" }, body: fs.readFileSync(p.miniatura) });
    console.log("  miniatura:", m.ok ? "ok" : (await m.text()).slice(0, 200));
  }
  hecho[id] = { id: v.id, cuando: p.cuando };
  fs.writeFileSync(registro, JSON.stringify(hecho, null, 1));
}
