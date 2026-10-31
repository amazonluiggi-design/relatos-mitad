// Recursos de render de una historia (imágenes, voz, clips) por R2, archivo por archivo, en vez de git:
// con internet lento, muchas subidas pequeñas que se reintentan funcionan mejor que un paquete grande.
// node scripts/recursos.mjs subir <historia>   (laptop)   ·   node scripts/recursos.mjs bajar <historia>   (nube)
import fs from "node:fs";
import path from "node:path";
import { subir, bajar } from "./nube.mjs";
const [, , accion, h] = process.argv;
const base = `public/${h}`;
const tipo = (f) => (f.endsWith(".jpg") ? "image/jpeg" : f.endsWith(".mp3") ? "audio/mpeg" : f.endsWith(".mp4") ? "video/mp4" : "application/json");
const reintentar = async (f) => { for (let i = 1; ; i++) { try { return await f(); } catch (e) { if (i >= 6) throw e; await new Promise((r) => setTimeout(r, 5000 * i)); } } };

if (accion === "subir") {
  const lista = fs.readdirSync(base, { recursive: true }).filter((f) => fs.statSync(path.join(base, f)).isFile()).map((f) => f.replace(/\\/g, "/"));
  let n = 0;
  for (const f of lista) { await reintentar(() => subir(path.join(base, f), `recursos/${h}/${f}`, tipo(f))); if (++n % 10 === 0) console.log(`${n}/${lista.length}`); }
  fs.writeFileSync("prueba/manifiesto.json", JSON.stringify(lista));
  await reintentar(() => subir("prueba/manifiesto.json", `recursos/${h}/manifiesto.json`, "application/json"));
  console.log("subidos", lista.length, "recursos de", h);
} else if (accion === "bajar") {
  const tmp = `/tmp/manifiesto-${h}.json`;
  try { await bajar(`recursos/${h}/manifiesto.json`, tmp); } catch { console.log("sin recursos en R2 para", h, "(están en el repo)"); process.exit(0); }
  const lista = JSON.parse(fs.readFileSync(tmp, "utf8"));
  for (const f of lista) {
    const destino = path.join(base, f);
    if (fs.existsSync(destino)) continue;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    await reintentar(() => bajar(`recursos/${h}/${f}`, destino));
  }
  console.log("bajados", lista.length, "recursos de", h);
}
