// Baja de R2 solo los videos que aún faltan programar en Facebook o YouTube (para la fábrica en la nube).
// node scripts/bajar-pendientes.mjs <historia>
import fs from "node:fs";
import { bajar } from "./nube.mjs";
const h = process.argv[2];
const { PUBLICACION } = await import(`../publicaciones/${h}.mjs`);
const leer = (r) => (fs.existsSync(`publicaciones/${h}-${r}.json`) ? JSON.parse(fs.readFileSync(`publicaciones/${h}-${r}.json`, "utf8")) : {});
const { yaProgramados } = await import("./nube.mjs");
const fb = { ...(await yaProgramados(h, "facebook").catch(() => ({}))), ...leer("fb") }, yt = { ...(await yaProgramados(h, "youtube").catch(() => ({}))), ...leer("yt") };
const tareas = [["largo", PUBLICACION.largo], ...PUBLICACION.reels.map((r, i) => [`reel${i + 1}`, r]), ...(PUBLICACION.episodios || []).map((e, i) => [`episodio${i + 1}`, e]),
  ...(PUBLICACION.partes || []).map((p, i) => [`parte${i + 1}`, { ...p, cuando: p.yt }]).filter(([, p]) => p.cuando)];
fs.mkdirSync("out", { recursive: true });
for (const [k, p] of tareas.filter(([, p]) => p)) {
  if ((fb[k] && yt[k]) || (k.startsWith("parte") && yt[k]) || new Date(p.cuando) < new Date(Date.now() + 15 * 60000)) continue;
  try { await bajar(`${h}/${k}.mp4`, p.archivo); console.log("bajado", k); } catch (e) { console.log("sin video en R2:", k); }
  if (k === "largo" && PUBLICACION.largo?.miniatura) await bajar(`${h}/miniatura.jpg`, PUBLICACION.largo.miniatura).catch(() => {});
}
