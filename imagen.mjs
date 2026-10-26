// node imagen.mjs <salida> "<prompt>" [modelo] [ancho] [alto] [semilla]
import fs from "node:fs";
import os from "node:os";
const CLAVE = fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
export async function imagen(salida, prompt, modelo, ancho = 1344, alto = 768, semilla) {
  for (let i = 0; i < 3; i++) {
    const r = await fetch("https://relatos-imagenes.probador-worker.workers.dev", {
      method: "POST",
      headers: { "x-clave": CLAVE, "content-type": "application/json" },
      body: JSON.stringify({ prompt, modelo, ancho, alto, semilla, pasos: modelo?.includes("schnell") ? 8 : undefined }),
    });
    if (r.ok) { fs.writeFileSync(salida, Buffer.from(await r.arrayBuffer())); return salida; }
    console.error("intento", i, r.status, (await r.text()).slice(0, 300));
  }
  throw new Error("falló " + salida);
}
if (process.argv[1]?.endsWith("imagen.mjs")) {
  const [, , s, p, m, w, h, se] = process.argv;
  await imagen(s, p, m, w ? +w : undefined, h ? +h : undefined, se ? +se : undefined);
  console.log("ok", s);
}
