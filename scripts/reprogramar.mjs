// Pasa al panel (D1) las horas actuales de publicaciones/<h>.mjs para lo que aún no salió.
// node scripts/reprogramar.mjs <historia>   (registrar-historia no cambia la hora de lo ya registrado)
import { sql } from "./nube.mjs";
const h = process.argv[2];
const { PUBLICACION } = await import(`../publicaciones/${h}.mjs`);
const items = [];
const recorrer = (o) => { if (!o || typeof o !== "object") return; if (o.archivo && o.cuando) items.push(o); Object.values(o).forEach(recorrer); };
recorrer(PUBLICACION);
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const orden = items.flatMap((o) => {
  const id = o.archivo.replace(/^out\//, "").replace(/\.mp4$/, "");
  const upd = (cuando, red) => `UPDATE publicaciones SET cuando = ${q(new Date(cuando).toISOString())} WHERE video_id = ${q(id)}${red ? ` AND red = ${q(red)}` : ""} AND estado <> 'publicado';`;
  // Las partes llevan hora propia para YouTube ("yt"); la de "cuando" es la de TikTok.
  return o.yt ? [upd(o.cuando, "tiktok"), upd(o.yt, "youtube")] : [upd(o.cuando)];
});
console.log(items.length, "horas →", await sql(orden));
