// Listas de reproducción del canal (crea las que falten y agrega los videos nuevos; se puede correr cuantas veces sea).
// node scripts/yt-listas.mjs   (necesita el token con youtube.force-ssl de ~/.relatos-secretos/youtube-token.json)
import fs from "node:fs";
import os from "node:os";
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json()).access_token;
const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" };
const api = async (ruta, opts = {}) => { const r = await fetch("https://www.googleapis.com/youtube/v3/" + ruta, { headers: H, ...opts }); const j = await r.json(); if (j.error) throw new Error(ruta.split("?")[0] + ": " + j.error.message); return j; };

// Videos subidos, por historia (publicaciones/<h>-yt.json).
const yt = (h) => (fs.existsSync(`publicaciones/${h}-yt.json`) ? JSON.parse(fs.readFileSync(`publicaciones/${h}-yt.json`, "utf8")) : {});
const ordenar = (o) => Object.entries(o).sort(([a], [b]) => { const r = (k) => (k === "largo" ? 0 : k.startsWith("episodio") ? 1 : k.startsWith("parte") ? 2 : 3); return r(a) - r(b) || a.localeCompare(b, "es", { numeric: true }); });
const de = (h, filtro = () => true) => ordenar(yt(h)).filter(([k]) => filtro(k)).map(([, v]) => v.id);
const largos = (k) => k === "largo" || k.startsWith("episodio");
const cortos = (k) => k.startsWith("reel") || k.startsWith("parte");

const LISTAS = [
  { titulo: "Tesoros perdidos de Ecuador", descripcion: "Oro inca, minas malditas y tesoros piratas: las historias reales y leyendas de tesoros perdidos de Ecuador y Latinoamérica.",
    videos: [...de("llanganates", largos), ...de("isla-plata", largos), ...de("cantuna", largos), ...de("llanganates", cortos), ...de("isla-plata", cortos)] },
  { titulo: "Leyendas de Quito", descripcion: "Las leyendas del Quito colonial: Cantuña y el diablo, el Padre Almeida, la Caja Ronca y más.",
    videos: [...de("cantuna"), ...de("padre-almeida"), ...de("caja-ronca")] },
  { titulo: "Leyendas de Guayaquil y la Costa", descripcion: "La Dama Tapada, la Isla de la Plata y otras leyendas de la costa ecuatoriana.",
    videos: [...de("dama-tapada"), ...de("isla-plata")] },
  { titulo: "Historias completas", descripcion: "Cada relato completo, de principio a fin. Leyendas y misterios de Ecuador y Latinoamérica.",
    videos: ["cantuna", "llanganates", "dama-tapada", "padre-almeida", "caja-ronca", "isla-plata"].flatMap((h) => de(h, largos)) },
];

const existentes = (await api("playlists?part=snippet&mine=true&maxResults=50")).items || [];
for (const l of LISTAS) {
  let lista = existentes.find((p) => p.snippet.title === l.titulo);
  if (!lista) {
    lista = await api("playlists?part=snippet,status", { method: "POST", body: JSON.stringify({ snippet: { title: l.titulo, description: l.descripcion, defaultLanguage: "es" }, status: { privacyStatus: "public" } }) });
    console.log("creada:", l.titulo);
    await new Promise((r) => setTimeout(r, 8000)); // YouTube tarda en reconocer la lista nueva
  }
  const ya = new Set();
  let pag = "";
  do { const r = await api(`playlistItems?part=contentDetails&playlistId=${lista.id}&maxResults=50${pag ? "&pageToken=" + pag : ""}`); for (const i of r.items) ya.add(i.contentDetails.videoId); pag = r.nextPageToken; } while (pag);
  let n = 0;
  for (const v of [...new Set(l.videos)]) {
    if (ya.has(v)) continue;
    try { await api("playlistItems?part=snippet", { method: "POST", body: JSON.stringify({ snippet: { playlistId: lista.id, resourceId: { kind: "youtube#video", videoId: v } } }) }); n++; }
    catch (e) { console.log("  no se pudo agregar", v, String(e.message).slice(0, 80)); }
  }
  console.log(l.titulo, "→", n, "nuevos,", ya.size + n, "en total");
}
