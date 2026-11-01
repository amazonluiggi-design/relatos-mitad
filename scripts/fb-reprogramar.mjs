// Cambia en Facebook la hora de lo ya programado para que coincida con el panel (D1).
// node scripts/fb-reprogramar.mjs <historia> [--probar]
import fs from "node:fs";
import os from "node:os";
const h = process.argv[2], probar = process.argv.includes("--probar");
const G = "https://graph.facebook.com/v23.0";
const P = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/facebook-pagina.json", "utf8"));
const CL = fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
const l = await (await fetch("https://relatos-autopilot.probador-worker.workers.dev/api/publicaciones", { headers: { "x-clave": CL } })).json();
for (const p of l.filter((p) => p.red === "facebook" && p.estado === "programado" && p.externo_id && p.video_id.startsWith(h + "-"))) {
  const quiere = Math.floor(new Date(p.cuando) / 1000);
  const v = await (await fetch(`${G}/${p.externo_id}?fields=scheduled_publish_time,published&access_token=${P.token}`)).json();
  const tiene = v.scheduled_publish_time ? Math.floor(new Date(v.scheduled_publish_time) / 1000) : null;
  if (v.error) { console.log(p.video_id, "ERROR leer:", v.error.message); continue; }
  if (v.published) { console.log(p.video_id, "ya publicado"); continue; }
  if (tiene === quiere) continue;
  console.log(p.video_id, new Date(tiene * 1000).toISOString(), "→", p.cuando);
  if (probar) continue;
  const r = await (await fetch(`${G}/${p.externo_id}`, { method: "POST", body: new URLSearchParams({ scheduled_publish_time: String(quiere), access_token: P.token }) })).json();
  const ok = await (await fetch(`${G}/${p.externo_id}?fields=scheduled_publish_time&access_token=${P.token}`)).json();
  console.log("   ", r.error ? "ERROR: " + r.error.message : "ok", "| ahora:", ok.scheduled_publish_time);
}
