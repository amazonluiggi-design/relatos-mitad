// node generar-imagenes.mjs <historia> [h|v] [ids,separados]
// Genera public/<historia>/<h|v>/<id>.jpg con Lucid Origin; salta las que ya existen.
import fs from "node:fs";
import { imagen } from "./imagen.mjs";
const [, , nombre, orient = "h", solo] = process.argv;
const { HISTORIA } = await import(`./historias/${nombre}.mjs`);
const dir = `public/${nombre}/${orient}`;
fs.mkdirSync(dir, { recursive: true });
const [w, h] = orient === "h" ? [1344, 768] : [768, 1344];
const lista = HISTORIA.escenas.filter((e) => (!solo || solo.split(",").includes(e.id)) && !fs.existsSync(`${dir}/${e.id}.jpg`));
let i = 0;
const trabajador = async () => {
  while (i < lista.length) {
    const e = lista[i++];
    const semilla = [...e.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 100000;
    try {
      await imagen(`${dir}/${e.id}.jpg`, `${e.img}, ${HISTORIA.estilo}`, "@cf/leonardo/lucid-origin", w, h, semilla);
      console.log("ok", e.id);
    } catch (err) { console.log("FALLO", e.id, err.message); }
  }
};
await Promise.all([trabajador(), trabajador(), trabajador()]);
