// Arma el plan de montaje (cuadros por escena) a partir de la voz grabada.
// node scripts/planear.mjs cantuna  → src/datos/<historia>-plan.json
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const nombre = process.argv[2];
const FPS = 30;
const { HISTORIA, REELS, CAPITULOS = {}, TITULO_CARTEL, CLIPS_MAX = {} } = await import(`../historias/${nombre}.mjs`);
const voz = JSON.parse(fs.readFileSync(`src/datos/${nombre}-voz.json`, "utf8"));
const porId = Object.fromEntries(voz.map((v) => [v.id, v]));

const duracion = (f) => +execFileSync(process.execPath, ["node_modules/@remotion/cli/remotion-cli.js", "ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim();

const armar = (escenas, inicio = 0.6, cola = 2.5, solo = false) => {
  let t = inicio;
  const out = escenas.map((e, i) => {
    const v = porId[e.id];
    const sig = escenas[i + 1];
    const pausa = !sig ? 0 : solo ? 0.25 : CAPITULOS[sig.id] || sig.id[0] !== e.id[0] ? 0.9 : 0.3;
    const desde = Math.round(t * FPS);
    t += v.duracion + pausa;
    // Clip animado subido desde el panel (public/<h>/clips/<escena>.mp4).
    const archivoClip = `public/${nombre}/clips/${e.id}.mp4`;
    const clip = fs.existsSync(archivoClip) ? { src: `${nombre}/clips/${e.id}.mp4`, dur: Math.min(duracion(archivoClip), CLIPS_MAX[e.id] ?? Infinity) } : null;
    const img = (o) => (fs.existsSync(`public/${nombre}/${o}/${e.id}.jpg`) ? `${nombre}/${o}/${e.id}.jpg` : null);
    return {
      id: e.id, mov: e.mov, h: img("h"), v: img("v"), clip,
      desde, cuadros: Math.round(t * FPS) - desde,
      audio: { archivo: v.archivo, recorte: v.recorte, duracion: v.duracion },
      palabras: v.palabras, capitulo: CAPITULOS[e.id] || null,
    };
  });
  out.at(-1).cuadros += Math.round(cola * FPS);
  return { escenas: out, total: Math.round((t + cola) * FPS) };
};

const largo = armar(HISTORIA.escenas);
const ids = HISTORIA.escenas.map((e) => e.id);
const reels = (REELS || []).map((r) => {
  const sub = r.escenas.map((id) => HISTORIA.escenas[ids.indexOf(id)]);
  return { ...r, ...armar(sub, 0.3, 3.2, true) };
});
// Episodios horizontales de 3 a 5 min (Facebook con anuncios, YouTube): capítulos completos agrupados.
const MIN_EP = 185;
const bloques = [];
for (const e of HISTORIA.escenas) { if (!bloques.length || (CAPITULOS[e.id] && bloques.at(-1).some((x) => CAPITULOS[x.id]))) bloques.push([]); bloques.at(-1).push(e); }
const dur = (l) => l.reduce((a, e) => a + porId[e.id].duracion + 0.5, 0);
const grupos = [];
for (const b of bloques) { if (grupos.length && dur(grupos.at(-1)) < MIN_EP) grupos.at(-1).push(...b); else grupos.push([...b]); }
if (grupos.length > 1 && dur(grupos.at(-1)) < MIN_EP) grupos.at(-2).push(...grupos.pop());
let capsAntes = 0;
const episodios = grupos.map((g, i) => {
  const caps = g.filter((e) => CAPITULOS[e.id]).map((e) => CAPITULOS[e.id]);
  const ep = { id: `episodio${i + 1}`, capitulos: caps, capInicial: capsAntes, ...armar(g) };
  capsAntes += caps.length;
  return ep;
});
const plan = { fps: FPS, titulo: HISTORIA.titulo, cartel: TITULO_CARTEL || null, ...largo, reels, episodios };
fs.writeFileSync(`src/datos/${nombre}-plan.json`, JSON.stringify(plan));
console.log(`largo: ${(largo.total / FPS / 60).toFixed(2)} min`);
reels.forEach((r) => console.log(`${r.id}: ${(r.total / FPS).toFixed(1)} s`));
episodios.forEach((e) => console.log(`${e.id}: ${(e.total / FPS / 60).toFixed(2)} min · ${e.capitulos.join(" / ")}`));
// Capítulos para la descripción de YouTube.
let marcas = ["0:00 Introducción"];
for (const e of largo.escenas) if (e.capitulo) {
  const s = Math.floor(e.desde / FPS);
  marcas.push(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} ${e.capitulo}`);
}
fs.writeFileSync(`src/datos/${nombre}-capitulos.txt`, marcas.join("\n"));
