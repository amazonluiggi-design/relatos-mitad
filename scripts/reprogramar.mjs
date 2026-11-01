// Pasa al panel (D1) las horas actuales de publicaciones/<h>.mjs para lo que aún no salió.
// node scripts/reprogramar.mjs <historia>   (registrar-historia no cambia la hora de lo ya registrado)
import { sql } from "./nube.mjs";
const h = process.argv[2];
const { PUBLICACION } = await import(`../publicaciones/${h}.mjs`);
const items = [];
const recorrer = (o) => { if (!o || typeof o !== "object") return; if (o.archivo && o.cuando) items.push(o); Object.values(o).forEach(recorrer); };
recorrer(PUBLICACION);
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const orden = items.map((o) => {
  const id = o.archivo.replace(/^out\//, "").replace(/\.mp4$/, "");
  return `UPDATE publicaciones SET cuando = ${q(new Date(o.cuando).toISOString())} WHERE video_id = ${q(id)} AND estado <> 'publicado';`;
});
console.log(items.length, "horas →", await sql(orden));
