// Arma el plan de montaje (cuadros por escena) a partir de la voz grabada.
// node scripts/planear.mjs cantuna  → src/datos/<historia>-plan.json
import fs from "node:fs";
const nombre = process.argv[2];
const FPS = 30;
const { HISTORIA, REELS, CAPITULOS = {}, TITULO_CARTEL } = await import(`../historias/${nombre}.mjs`);
const voz = JSON.parse(fs.readFileSync(`src/datos/${nombre}-voz.json`, "utf8"));
const porId = Object.fromEntries(voz.map((v) => [v.id, v]));

const armar = (escenas, inicio = 0.6, cola = 2.5, solo = false) => {
  let t = inicio;
  const out = escenas.map((e, i) => {
    const v = porId[e.id];
    const sig = escenas[i + 1];
    const pausa = !sig ? 0 : solo ? 0.25 : CAPITULOS[sig.id] || sig.id[0] !== e.id[0] ? 0.9 : 0.3;
    const desde = Math.round(t * FPS);
    t += v.duracion + pausa;
    const img = (o) => (fs.existsSync(`public/${nombre}/${o}/${e.id}.jpg`) ? `${nombre}/${o}/${e.id}.jpg` : null);
    return {
      id: e.id, mov: e.mov, h: img("h"), v: img("v"),
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
const plan = { fps: FPS, titulo: HISTORIA.titulo, cartel: TITULO_CARTEL || null, ...largo, reels };
fs.writeFileSync(`src/datos/${nombre}-plan.json`, JSON.stringify(plan));
console.log(`largo: ${(largo.total / FPS / 60).toFixed(2)} min`);
reels.forEach((r) => console.log(`${r.id}: ${(r.total / FPS).toFixed(1)} s`));
// Capítulos para la descripción de YouTube.
let marcas = ["0:00 Introducción"];
for (const e of largo.escenas) if (e.capitulo) {
  const s = Math.floor(e.desde / FPS);
  marcas.push(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} ${e.capitulo}`);
}
fs.writeFileSync(`src/datos/${nombre}-capitulos.txt`, marcas.join("\n"));
