// Mueve en Facebook y YouTube una historia N días (TikTok NO: va programado en Studio y su hora queda igual).
// node scripts/mover-historia.mjs <historia> <dias> [archivo=YYYY-MM-DDTHH:MM ...] [--probar]
//   archivo=hora fija la hora de una pieza a mano (ej. isla-plata-reel1=2026-11-13T08:30).
// Cambia publicaciones/<h>.mjs (cuando de largo/reels/episodios, yt de partes) y D1 (solo facebook/youtube).
// Después: node scripts/fb-reprogramar.mjs <h> y node scripts/yt-reprogramar.mjs <h>.
import fs from "node:fs";
import { sql } from "./nube.mjs";
const [h, dias, ...resto] = process.argv.slice(2);
const probar = resto.includes("--probar");
const fijas = Object.fromEntries(resto.filter((a) => a.includes("=")).map((a) => a.split("=")));
const ruta = `publicaciones/${h}.mjs`;
const { PUBLICACION } = await import(`../${ruta}`);
let texto = fs.readFileSync(ruta, "utf8");
const ec = (ms) => new Date(ms - 5 * 36e5).toISOString().slice(0, 16) + ":00-05:00";
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const piezas = [PUBLICACION.largo, ...PUBLICACION.reels, ...(PUBLICACION.episodios || []), ...(PUBLICACION.partes || [])];
const orden = [];
for (const p of piezas) {
  const id = p.archivo.replace(/^out\//, "").replace(/\.mp4$/, "");
  const campo = p.yt ? "yt" : "cuando"; // las partes: "cuando" es la hora de TikTok, "yt" la de YouTube
  const viejo = p[campo];
  if (Date.parse(viejo) < Date.now()) { console.log(id, "ya salió, no se toca"); continue; }
  const nuevo = fijas[id] ? fijas[id] + ":00-05:00" : ec(Date.parse(viejo) + +dias * 864e5);
  const i = texto.indexOf(`${campo}: "${viejo}"`, texto.indexOf(`"${p.archivo}"`));
  if (i < 0) throw new Error(`no encontré ${campo} de ${id}`);
  texto = texto.slice(0, i) + `${campo}: "${nuevo}"` + texto.slice(i + `${campo}: "${viejo}"`.length);
  console.log(id.padEnd(26), viejo, "→", nuevo);
  for (const red of p.yt ? ["youtube"] : ["facebook", "youtube"])
    orden.push(`UPDATE publicaciones SET cuando = ${q(new Date(nuevo).toISOString())} WHERE video_id = ${q(id)} AND red = ${q(red)} AND estado <> 'publicado';`);
}
if (probar) process.exit(0);
fs.writeFileSync(ruta, texto);
console.log(orden.length, "cambios en el panel →", JSON.stringify(await sql(orden)).slice(0, 120));
