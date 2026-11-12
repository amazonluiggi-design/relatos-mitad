// Sube a YouTube el video largo (programado, con miniatura) y los reels como Shorts.
// node scripts/yt-publicar.mjs cantuna [largo|reel1..]  → publicaciones/<h>-yt.json
import fs from "node:fs";
import os from "node:os";
const [, , nombre, solo] = process.argv;
const { PUBLICACION, YOUTUBE } = await import(`../publicaciones/${nombre}.mjs`);
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const registro = `publicaciones/${nombre}-yt.json`;
const hecho = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, "utf8")) : {};

// El panel (D1) también sabe qué está programado: si el JSON del repo se perdió, no se duplica.
try {
  const { yaProgramados } = await import("./nube.mjs");
  for (const [k, id] of Object.entries(await yaProgramados(nombre, "youtube"))) if (!hecho[k]) hecho[k] = { id, desdePanel: true };
} catch (e) { console.log("aviso: no se pudo consultar el panel", String(e).slice(0, 80)); }
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
// YouTube rechaza títulos de más de 100 letras: se cortan para no frenar la historia entera.
const meta = (titulo, descripcion, etiquetas, cuando) => ({
  snippet: { title: titulo.slice(0, 100), description: descripcion, tags: etiquetas, categoryId: "24", defaultLanguage: "es", defaultAudioLanguage: "es" },
  status: { privacyStatus: "private", publishAt: new Date(cuando).toISOString(), selfDeclaredMadeForKids: false, containsSyntheticMedia: true },
});

const tituloParte = (t) => t.split("\n")[0].replace(/[^\p{L}\p{N}\s·:¿?¡!…,.()«»-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 95);
const tareas = [["largo", PUBLICACION.largo, YOUTUBE.largo], ...PUBLICACION.reels.map((r, i) => [`reel${i + 1}`, r, YOUTUBE.reels[i]]),
  ...(PUBLICACION.episodios || []).map((e, i) => [`episodio${i + 1}`, e, YOUTUBE.episodios[i]]),
  // Partes de TikTok que también van a YouTube Shorts (llevan su propia hora en "yt").
  ...(PUBLICACION.partes || []).map((p, i) => [`parte${i + 1}`, { ...p, cuando: p.yt, texto: p.texto.replace("Sígueme para la", "Suscríbete para la") }, { titulo: tituloParte(p.texto) }]).filter(([, p]) => p.cuando)];
for (const [id, p, y] of tareas.filter(([, p]) => p)) {
  if (solo && solo !== id) continue;
  if (hecho[id]) { console.log(id, "ya subido:", hecho[id].id); continue; }
  // Los episodios no rinden en YouTube (0 vistas al 3-nov) y gastan el cupo diario de subidas: solo con EPISODIOS_YT=1.
  if (id.startsWith("episodio") && !process.env.EPISODIOS_YT) continue;
  if (!fs.existsSync(p.archivo)) { console.log(id, "sin archivo todavía"); continue; }
  if (new Date(p.cuando) < new Date(Date.now() + 15 * 60000)) { console.log(id, "su hora ya pasó, no se sube"); continue; }
  // YT_DIAS: solo lo que sale en los próximos N días (el límite diario de subidas se gasta primero en lo urgente).
  if (process.env.YT_DIAS && new Date(p.cuando) > Date.now() + +process.env.YT_DIAS * 864e5) continue;
  const desc = id.startsWith("episodio") ? `${p.texto.replace("en la página", "en el canal")}

Historia completa en el canal.` : id === "largo" ? y.descripcion(fs.readFileSync(`src/datos/${nombre}-capitulos.txt`, "utf8")) : p.texto.replace("en la página", "en el canal");
  let v;
  try { v = await subir(p.archivo, meta(y.titulo, desc, YOUTUBE.largo?.etiquetas || YOUTUBE.etiquetas || [], p.cuando)); }
  catch (e) { if (/quota|uploadLimitExceeded|exceeded the number of videos/i.test(String(e))) { console.log("Cuota diaria de YouTube agotada: el resto se sube mañana."); break; } throw e; }
  console.log(id, "subido", v.id, "| estado:", v.status.privacyStatus, "| publica:", v.status.publishAt, "| sintético:", v.status.containsSyntheticMedia);
  if (id === "largo" && p.miniatura) {
    const m = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${v.id}`, { method: "POST", headers: { ...H, "Content-Type": "image/jpeg" }, body: fs.readFileSync(p.miniatura) });
    console.log("  miniatura:", m.ok ? "ok" : (await m.text()).slice(0, 200));
  }
  hecho[id] = { id: v.id, cuando: p.cuando };
  fs.writeFileSync(registro, JSON.stringify(hecho, null, 1));
}
