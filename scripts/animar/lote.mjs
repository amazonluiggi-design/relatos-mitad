// Anima las escenas de una historia con Wan 2.2 (Hugging Face, gratis). Salta las que ya tienen clip.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
const h = process.argv[2];
const { HISTORIA } = await import(`../../historias/${h}.mjs`);
const orden = (process.argv[3] || "").split(",").filter(Boolean);
const escenas = [...HISTORIA.escenas].sort((a, b) => (orden.indexOf(a.id) + 1 || 999) - (orden.indexOf(b.id) + 1 || 999));
fs.mkdirSync(`public/${h}/clips`, { recursive: true });
let fallos = 0;
for (const e of escenas) {
  const sal = `public/${h}/clips/${e.id}.mp4`;
  if (fs.existsSync(sal)) continue;
  const prompt = `${e.img.replace(/, no (body|face|people)[^,]*/g, "")}. Natural cinematic motion: people move slowly and realistically, clothes and veils sway gently, fog drifting, lantern flames flickering, slow smooth camera push in. Keep the same faces, costumes and setting.`;
  try {
    execFileSync("node", ["scripts/animar/animar.mjs", `public/${h}/h/${e.id}.jpg`, sal, prompt, "5"], { stdio: "inherit", timeout: 600000 });
    fallos = 0;
  } catch (err) {
    console.log("FALLO", e.id); fallos++;
    if (fallos >= 3) { console.log("3 fallos seguidos: probablemente se acabó la cuota gratis por hoy"); break; }
  }
}
console.log("LOTE FIN", fs.readdirSync(`public/${h}/clips`).length, "clips");
