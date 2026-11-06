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
// Sentinel: Lucid Origin ≈ 2.700 neuronas ≈ $0,03 por imagen (estimado). Se pide permiso por el lote completo.
const { detenido, puedoGastar, anotarGasto } = await import("./scripts/nube.mjs");
const PRECIO = 0.03;
if (lista.length && (await detenido("relatos", "apis"))) { console.error("🛑 DETENER EMPRESA: APIs con consumo paradas."); process.exit(3); }
if (lista.length && !(await puedoGastar("workers-ai", lista.length * PRECIO, `${lista.length} imágenes ${nombre}`))) process.exit(4);
let i = 0;
const trabajador = async () => {
  while (i < lista.length) {
    const e = lista[i++];
    const semilla = [...e.id].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) % 100000;
    try {
      await imagen(`${dir}/${e.id}.jpg`, `${e.img}, ${HISTORIA.estilo}`, "@cf/leonardo/lucid-origin", w, h, semilla);
      console.log("ok", e.id);
      await anotarGasto({ proveedor: "workers-ai", concepto: `Imagen ${nombre}/${orient}/${e.id}`, monto: PRECIO, unidades: 1, unidad: "imagen", agente: "generar-imagenes" });
    } catch (err) { console.log("FALLO", e.id, err.message); }
  }
};
await Promise.all([trabajador(), trabajador(), trabajador()]);
