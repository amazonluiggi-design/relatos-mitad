// Recopilatorios: reels hechos con escenas YA montadas de otras historias (su imagen, su voz y sus subtítulos),
// sin gastar voz nueva. La historia exporta RECOPILAR = [{ id, gancho, cierre, partes: [{ rotulo, escenas: ["h:id", …] }] }]
// y FUENTES = ["h", …]. planear.mjs llama aquí cuando la historia es un recopilatorio.
import fs from "node:fs";

const FPS = 30;
export function recopilar(nombre, { HISTORIA, RECOPILAR }) {
  const planes = {};
  const escena = (ref) => {
    const [h, id] = ref.split(":");
    planes[h] ??= JSON.parse(fs.readFileSync(`src/datos/${h}-plan.json`, "utf8"));
    const e = planes[h].escenas.find((x) => x.id === id);
    if (!e) throw new Error(`no existe la escena ${ref}`);
    return { ...e, id: `${h}-${id}` };
  };
  const reels = RECOPILAR.map((r) => {
    let t = 0.3;
    const escenas = [], rotulos = [];
    r.partes.forEach((p, i) => {
      p.escenas.forEach((ref, j) => {
        const e = escena(ref);
        if (j === 0) rotulos.push({ desde: Math.round(t * FPS), texto: p.rotulo });
        // Pausa corta dentro de un tesoro y más larga al pasar al siguiente.
        const pausa = j < p.escenas.length - 1 ? 0.25 : i < r.partes.length - 1 ? 0.9 : 0;
        const desde = Math.round(t * FPS);
        t += e.audio.duracion + pausa;
        escenas.push({ ...e, desde, cuadros: Math.round(t * FPS) - desde, capitulo: null });
      });
    });
    const cola = 3.2;
    escenas.at(-1).cuadros += Math.round(cola * FPS);
    return { id: r.id, gancho: r.gancho, cierre: r.cierre, rotulos, escenas, total: Math.round((t + cola) * FPS) };
  });
  const plan = { fps: FPS, titulo: HISTORIA.titulo, cartel: null, escenas: [], total: 0, reels, episodios: [] };
  fs.writeFileSync(`src/datos/${nombre}-plan.json`, JSON.stringify(plan));
  fs.writeFileSync(`src/datos/${nombre}-capitulos.txt`, "");
  reels.forEach((r) => console.log(`${r.id}: ${(r.total / FPS).toFixed(1)} s · ${r.rotulos.map((x) => x.texto).join(" / ")}`));
}
