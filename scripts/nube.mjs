// Acceso de la fábrica al Worker (sin wrangler): subir archivos a R2 y ejecutar SQL en D1 con la clave de scripts.
// La clave sale de RELATOS_CLAVE (GitHub Actions) o de ~/.relatos-secretos/clave-imagenes.txt (laptop).
import fs from "node:fs";
import os from "node:os";
const U = "https://relatos-autopilot.probador-worker.workers.dev/api/fabrica";
const CLAVE = process.env.RELATOS_CLAVE || fs.readFileSync(os.homedir() + "/.relatos-secretos/clave-imagenes.txt", "utf8").trim();
const H = { "x-clave": CLAVE };
const TROZO = 64 * 1024 * 1024;

export async function subir(archivo, clave, tipo) {
  const buf = fs.readFileSync(archivo);
  if (buf.length <= 90 * 1024 * 1024) {
    const r = await fetch(`${U}/archivo?clave=${encodeURIComponent(clave)}`, { method: "PUT", headers: { ...H, "content-type": tipo }, body: buf });
    if (!r.ok) throw new Error(`subir ${clave}: ${r.status} ${await r.text()}`);
    return;
  }
  const { id } = await (await fetch(`${U}/multi?accion=crear&clave=${encodeURIComponent(clave)}`, { method: "POST", headers: { ...H, "content-type": tipo } })).json();
  const partes = [];
  for (let n = 1, i = 0; i < buf.length; n++, i += TROZO) {
    const r = await fetch(`${U}/multi?clave=${encodeURIComponent(clave)}&id=${encodeURIComponent(id)}&n=${n}`, { method: "PUT", headers: H, body: buf.subarray(i, i + TROZO) });
    if (!r.ok) throw new Error(`parte ${n} de ${clave}: ${r.status}`);
    partes.push(await r.json());
  }
  const r = await fetch(`${U}/multi?accion=completar&clave=${encodeURIComponent(clave)}&id=${encodeURIComponent(id)}`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ partes }) });
  if (!r.ok) throw new Error(`completar ${clave}: ${r.status}`);
}

export async function sql(sentencias) {
  const r = await fetch(`${U}/sql`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ sql: sentencias }) });
  const j = await r.json();
  if (!r.ok || !j.ok) throw new Error("sql: " + JSON.stringify(j).slice(0, 300));
  return j;
}

export async function bajar(clave, archivo) {
  const r = await fetch(`https://relatos-autopilot.probador-worker.workers.dev/api/medio/${encodeURIComponent(clave)}`, { headers: H });
  if (!r.ok) throw new Error(`bajar ${clave}: ${r.status}`);
  fs.writeFileSync(archivo, Buffer.from(await r.arrayBuffer()));
}

// node scripts/nube.mjs bajar <clave> <archivo>
if (process.argv[1]?.endsWith("nube.mjs") && process.argv[2] === "bajar") {
  await bajar(process.argv[3], process.argv[4]);
  console.log("bajado", process.argv[3]);
}
// node scripts/nube.mjs subir <archivo> <clave> <tipo>
if (process.argv[1]?.endsWith("nube.mjs") && process.argv[2] === "subir") {
  await subir(process.argv[3], process.argv[4], process.argv[5] || "application/octet-stream");
  console.log("subido", process.argv[4]);
}
