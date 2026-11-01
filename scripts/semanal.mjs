// Resumen semanal (lunes): qué funcionó en los últimos 7 días, a qué hora y en qué red, y lo deja en el panel
// como recomendación. node scripts/semanal.mjs [--probar]
import fs from "node:fs";
import os from "node:os";
import { sql } from "./nube.mjs";
const CLAVE = process.env.RELATOS_CLAVE || fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
const U = "https://relatos-autopilot.probador-worker.workers.dev";
await fetch(U + "/api/sincronizar", { method: "POST", headers: { "x-clave": CLAVE, Origin: U } }).catch(() => {});
const { cuentas, pubs } = await (await fetch(U + "/api/crecimiento", { headers: { "x-clave": CLAVE } })).json();
const desde = Date.now() - 7 * 864e5, num = (n) => Number(n || 0).toLocaleString("es-EC");
const semana = pubs.filter((p) => !p.video_id.startsWith("demo") && p.publicado_en && new Date(p.publicado_en) > desde);
const franja = (t) => { const h = new Date(new Date(t) - 5 * 36e5).getUTCHours() + new Date(t).getUTCMinutes() / 60; return h < 11 ? "mañana (8:30)" : h < 16 ? "mediodía (12:30–13:00)" : h < 21.5 ? "noche (19:00–20:00)" : "noche tarde (22:00)"; };
const lineas = [], REDES = { youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" };
let total = 0;
for (const [red, nombre] of Object.entries(REDES)) {
  const l = semana.filter((p) => p.red === red); if (!l.length) continue;
  const v = l.reduce((a, p) => a + (p.vistas || 0), 0); total += v;
  const mejor = [...l].sort((a, b) => (b.vistas || 0) - (a.vistas || 0))[0];
  const seg = cuentas.filter((c) => c.red === red), dif = seg.length > 1 ? seg.at(-1).seguidores - (seg.find((c) => new Date(c.dia) >= desde - 864e5) || seg[0]).seguidores : 0;
  const fr = {}; for (const p of l) { const f = franja(p.publicado_en); (fr[f] ||= []).push(p.vistas || 0); }
  const top = Object.entries(fr).map(([f, xs]) => [f, xs.reduce((a, b) => a + b, 0) / xs.length, xs.length]).sort((a, b) => b[1] - a[1]);
  lineas.push(`${nombre}: ${num(v)} vistas en ${l.length} videos (${dif >= 0 ? "+" : ""}${dif} seguidores). Mejor: "${mejor.titulo}" con ${num(mejor.vistas)}. Mejor horario: ${top[0][0]} (${num(Math.round(top[0][1]))} de promedio en ${top[0][2]} videos)${top.length > 1 ? `; el más flojo: ${top.at(-1)[0]} (${num(Math.round(top.at(-1)[1]))})` : ""}.`);
}
const ganchos = [...semana].sort((a, b) => (b.vistas || 0) - (a.vistas || 0)).slice(0, 3).map((p) => `"${p.titulo}"`);
if (ganchos.length) lineas.push(`Los 3 ganchos que más funcionaron: ${ganchos.join(", ")}. La próxima semana repito ese tipo de tema y ese horario.`);
const hoy = new Date(Date.now() - 5 * 36e5).toLocaleDateString("es-EC", { day: "numeric", month: "short", timeZone: "UTC" });
const titulo = `Resumen semanal (${hoy}): ${num(total)} vistas en 7 días`, detalle = lineas.join(" ");
console.log(titulo + "\n" + lineas.join("\n"));
if (!process.argv.includes("--probar")) {
  const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
  console.log(await sql([`INSERT INTO recomendaciones (prioridad, area, quien, titulo, detalle) VALUES ('media', 'estrategia', 'claude', ${q(titulo)}, ${q(detalle)});`]));
}
