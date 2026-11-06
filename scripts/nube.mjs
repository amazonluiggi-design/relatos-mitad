// Acceso de la fábrica al Worker (sin wrangler): subir archivos a R2 y ejecutar SQL en D1 con la clave de scripts.
// La clave sale de RELATOS_CLAVE (GitHub Actions) o de ~/.relatos-secretos/clave-imagenes.txt (laptop).
import fs from "node:fs";
import os from "node:os";
const U = (process.env.RELATOS_API || "https://relatos-autopilot.probador-worker.workers.dev") + "/api/fabrica";
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

/** { "reel5": "externo_id", ... } de una historia y red, según el panel. */
export async function yaProgramados(h, red) {
  const r = await fetch("https://relatos-autopilot.probador-worker.workers.dev/api/publicaciones", { headers: H });
  const l = await r.json();
  const out = {};
  for (const p of l) if (p.red === red && p.externo_id && p.video_id.startsWith(h + "-")) out[p.video_id.slice(h.length + 1)] = p.externo_id;
  return out;
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

/* ───── Sentinel: botón DETENER y presupuesto ───── */
/** Estado del botón DETENER. Si el panel no responde se devuelve null (la fábrica sigue: falla abierta, decidido 2026-11-06). */
export async function estadoDetener() {
  try {
    const r = await fetch(`${U}/estado`, { headers: H, signal: AbortSignal.timeout(15000) });
    if (!r.ok) return null;
    return (await r.json()).detener;
  } catch { return null; }
}
export async function detenido(division, ambito) {
  const d = await estadoDetener();
  return !!d && (d.grupo || d[division] || d[ambito]);
}

/** Pide permiso antes de gastar. Devuelve true si cabe en el presupuesto (o si el panel no responde). */
export async function puedoGastar(proveedor, monto, concepto, division = "relatos") {
  try {
    const r = await fetch(`${U}/gasto`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ proveedor, monto, concepto, division, previo: true }), signal: AbortSignal.timeout(15000) });
    const j = await r.json();
    if (!j.ok) console.error(`⛔ Presupuesto: ${j.motivo}`);
    return !!j.ok;
  } catch (e) { console.error("⚠ No se pudo consultar el presupuesto, se continúa:", e.message); return true; }
}

/** Anota un gasto en el libro de costos (no corta el trabajo si falla). */
export async function anotarGasto(g) {
  try {
    await fetch(`${U}/gasto`, { method: "POST", headers: { ...H, "content-type": "application/json" }, body: JSON.stringify({ division: "relatos", tipo: "estimado", ...g }), signal: AbortSignal.timeout(15000) });
  } catch (e) { console.error("⚠ No se pudo anotar el gasto:", e.message); }
}

// node scripts/nube.mjs alto <division> <ambito>  → sale con código 3 si el botón DETENER lo tiene parado.
if (process.argv[1]?.endsWith("nube.mjs") && process.argv[2] === "alto") {
  if (await detenido(process.argv[3] || "relatos", process.argv[4] || "publicaciones")) {
    console.error(`🛑 DETENER EMPRESA activo (${process.argv[3]}/${process.argv[4]}): no se hace nada.`);
    process.exit(3);
  }
  console.log("Interruptor de emergencia: en marcha.");
}
