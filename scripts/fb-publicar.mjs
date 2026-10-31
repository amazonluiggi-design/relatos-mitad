// Programa en la página de Facebook el video largo (con miniatura) y los reels de una historia.
// node scripts/fb-publicar.mjs cantuna [largo|reel1..]   → guarda IDs en publicaciones/<h>-fb.json
import fs from "node:fs";
import os from "node:os";
const [, , nombre, solo] = process.argv;
const { PUBLICACION } = await import(`../publicaciones/${nombre}.mjs`);
const P = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/facebook-pagina.json", "utf8"));
const G = "https://graph.facebook.com/v23.0", GV = "https://graph-video.facebook.com/v23.0";
const registro = `publicaciones/${nombre}-fb.json`;
const hecho = fs.existsSync(registro) ? JSON.parse(fs.readFileSync(registro, "utf8")) : {};
const unix = (s) => Math.floor(new Date(s).getTime() / 1000);
const pedir = async (url, cuerpo) => {
  const r = await fetch(url, { method: "POST", body: cuerpo });
  const j = await r.json();
  if (j.error) throw new Error(`${j.error.message} (${j.error.code}/${j.error.error_subcode || ""})`);
  return j;
};
const form = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.append(k, v); return f; };

// Video normal (largo), subida por partes.
async function videoLargo(p) {
  const buf = fs.readFileSync(p.archivo);
  const ini = await pedir(`${GV}/${P.id}/videos`, form({ access_token: P.token, upload_phase: "start", file_size: buf.length }));
  let { start_offset: a, end_offset: b } = ini;
  while (+a < +b) {
    const parte = new Blob([buf.subarray(+a, +b)]);
    const f = form({ access_token: P.token, upload_phase: "transfer", upload_session_id: ini.upload_session_id, start_offset: a });
    f.append("video_file_chunk", parte, "parte.mp4");
    ({ start_offset: a, end_offset: b } = await pedir(`${GV}/${P.id}/videos`, f));
    process.stdout.write(`\r  subido ${(+a / buf.length * 100).toFixed(0)}%`);
  }
  console.log();
  const fin = await pedir(`${GV}/${P.id}/videos`, form({
    access_token: P.token, upload_phase: "finish", upload_session_id: ini.upload_session_id,
    title: p.titulo, description: p.texto, published: "false", scheduled_publish_time: unix(p.cuando),
  }));
  const id = ini.video_id;
  if (p.miniatura) {
    const f = form({ access_token: P.token, is_preferred: "true" });
    f.append("source", new Blob([fs.readFileSync(p.miniatura)], { type: "image/jpeg" }), "miniatura.jpg");
    await pedir(`${G}/${id}/thumbnails`, f).catch((e) => console.log("  miniatura:", e.message));
  }
  return { id, fin };
}

// Reel: start → subida a rupload → finish programado.
async function reel(p) {
  const buf = fs.readFileSync(p.archivo);
  const ini = await pedir(`${G}/${P.id}/video_reels`, form({ access_token: P.token, upload_phase: "start" }));
  const r = await fetch(ini.upload_url, { method: "POST", headers: { Authorization: `OAuth ${P.token}`, offset: "0", file_size: String(buf.length) }, body: buf });
  const j = await r.json();
  if (!j.success) throw new Error("subida reel: " + JSON.stringify(j));
  await pedir(`${G}/${P.id}/video_reels`, form({
    access_token: P.token, upload_phase: "finish", video_id: ini.video_id,
    video_state: "SCHEDULED", scheduled_publish_time: unix(p.cuando), description: p.texto,
  }));
  return { id: ini.video_id };
}

const tareas = [["largo", PUBLICACION.largo, videoLargo], ...PUBLICACION.reels.map((r, i) => [`reel${i + 1}`, r, reel]),
  ...(PUBLICACION.episodios || []).map((e, i) => [`episodio${i + 1}`, e, videoLargo])];
for (const [id, p, f] of tareas) {
  if (solo && solo !== id) continue;
  if (hecho[id]) { console.log(id, "ya programado:", hecho[id].id); continue; }
  if (!fs.existsSync(p.archivo)) { console.log(id, "sin archivo todavía"); continue; }
  if (new Date(p.cuando) < new Date(Date.now() + 15 * 60000)) { console.log(id, "su hora ya pasó, no se programa"); continue; }
  console.log(id, "→", p.cuando);
  const r = await f(p);
  hecho[id] = { id: r.id, cuando: p.cuando };
  fs.writeFileSync(registro, JSON.stringify(hecho, null, 1));
  console.log("  ok", r.id);
}
