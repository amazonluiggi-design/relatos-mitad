// Tiempos estimados (14 letras/s) y audio en silencio, solo para revisar el montaje.
import fs from "node:fs";
import { execFileSync } from "node:child_process";
const nombre = process.argv[2];
const { HISTORIA } = await import(`../historias/${nombre}.mjs`);
fs.mkdirSync(`public/${nombre}/voz`, { recursive: true });
const salida = HISTORIA.escenas.map((e) => {
  let t = 0;
  const palabras = e.texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).map((w) => {
    const d = (w.length + 1) / 14;
    const p = { texto: w, desde: +t.toFixed(3), hasta: +(t + d).toFixed(3) };
    t += d + (/[.,?!…]$/.test(w) ? 0.25 : 0);
    return p;
  });
  return { id: e.id, bloque: 0, archivo: `${nombre}/voz/silencio.mp3`, recorte: 0, duracion: +(t + 0.25).toFixed(3), palabras };
});
const max = Math.ceil(Math.max(...salida.map((s) => s.duracion))) + 1;
execFileSync(process.execPath, ["node_modules/@remotion/cli/remotion-cli.js", "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", String(max), `public/${nombre}/voz/silencio.mp3`], { stdio: "ignore" });
fs.writeFileSync(`src/datos/${nombre}-voz.json`, JSON.stringify(salida));
console.log("provisional:", salida.reduce((a, s) => a + s.duracion, 0).toFixed(0), "s");
