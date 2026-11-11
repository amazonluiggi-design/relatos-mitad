// Cambia en YouTube la hora de lo ya programado para que coincida con el panel (D1). Gemelo de fb-reprogramar.mjs.
// node scripts/yt-reprogramar.mjs <historia> [--probar]   (cada cambio cuesta 50 unidades de la cuota diaria)
import fs from "node:fs";
import os from "node:os";
const h = process.argv[2], probar = process.argv.includes("--probar");
const YT = "https://www.googleapis.com/youtube/v3";
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const CL = fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json()).access_token;
if (!tok) throw new Error("no se pudo renovar el token de YouTube");
const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" };
const l = await (await fetch("https://relatos-autopilot.probador-worker.workers.dev/api/publicaciones", { headers: { "x-clave": CL } })).json();
const pubs = l.filter((p) => p.red === "youtube" && p.estado === "programado" && p.externo_id && p.video_id.startsWith(h + "-"));
if (!pubs.length) { console.log(h, "nada programado en YouTube"); process.exit(0); }
const v = await (await fetch(`${YT}/videos?part=status&id=${pubs.map((p) => p.externo_id).join(",")}`, { headers: H })).json();
if (v.error) throw new Error(v.error.message);
for (const p of pubs) {
  const s = v.items.find((i) => i.id === p.externo_id)?.status;
  if (!s) { console.log(p.video_id, "no está en YouTube"); continue; }
  if (s.privacyStatus !== "private" || !s.publishAt) { console.log(p.video_id, "ya publicado o sin fecha: no se toca"); continue; }
  if (Date.parse(s.publishAt) === Date.parse(p.cuando)) continue;
  console.log(p.video_id, s.publishAt, "→", p.cuando);
  if (probar) continue;
  // Se reenvía el estado completo: videos.update reemplaza la parte "status" entera.
  const r = await (await fetch(`${YT}/videos?part=status`, { method: "PUT", headers: H, body: JSON.stringify({ id: p.externo_id, status: { ...s, privacyStatus: "private", publishAt: new Date(p.cuando).toISOString() } }) })).json();
  console.log("   ", r.error ? "ERROR: " + r.error.message : "ok | ahora: " + r.status?.publishAt);
  if (r.error?.errors?.[0]?.reason === "quotaExceeded") { console.log("Cuota de YouTube agotada por hoy: repite mañana."); process.exit(2); }
}
