// Prueba de restauración del respaldo diario (Sentinel). No toca la base de producción.
// 1) baja de R2 el último respaldo cifrado  2) lo descifra (~/.relatos-secretos/respaldo-clave.txt)
// 3) genera SQL y lo carga en una D1 LOCAL aislada  4) compara filas por tabla  5) marca la prueba en el panel.
// Uso: node scripts/restaurar-respaldo.mjs [clave_r2]   ·   Para restaurar de verdad: ver docs/GROUP-V3-AUDITORIA.md
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { bajar } from "./nube.mjs";

const SECRETOS = path.join(os.homedir(), ".relatos-secretos");
const CLAVE = process.env.RELATOS_CLAVE || fs.readFileSync(path.join(SECRETOS, "clave-imagenes.txt"), "utf8").trim();
const API = "https://relatos-autopilot.probador-worker.workers.dev/api";
const llave = Buffer.from(fs.readFileSync(path.join(SECRETOS, "respaldo-clave.txt"), "utf8").trim(), "base64");

let clave = process.argv[2];
if (!clave) {
  // El último respaldo bueno, según el panel.
  const lista = await (await fetch(`${API}/fabrica/respaldos`, { headers: { "x-clave": CLAVE } })).json();
  clave = lista[0]?.clave_r2;
}
if (!clave) throw new Error("No hay respaldos en R2");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "restaurar-"));
const enc = path.join(tmp, "respaldo.enc");
await bajar(clave, enc);
const buf = fs.readFileSync(enc);
if (buf.subarray(0, 4).toString() !== "RAG1") throw new Error("formato desconocido");
const iv = buf.subarray(4, 16), datos = buf.subarray(16, buf.length - 16), tag = buf.subarray(buf.length - 16);
const d = crypto.createDecipheriv("aes-256-gcm", llave, iv); d.setAuthTag(tag);
const r = JSON.parse(zlib.gunzipSync(Buffer.concat([d.update(datos), d.final()])).toString("utf8"));
console.log(`Respaldo ${clave} (${r.hecho}): ${r.tablas.length} tablas`);

const lit = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const lineas = ["PRAGMA defer_foreign_keys = ON;"];
// Primero todas las tablas (hay llaves foráneas entre ellas) y después las filas.
for (const t of r.tablas) lineas.push(t.sql.replace(/^CREATE TABLE /i, "CREATE TABLE IF NOT EXISTS ") + ";");
for (const t of r.tablas) {
  for (const f of r.datos[t.nombre]) {
    const cols = Object.keys(f);
    lineas.push(`INSERT INTO "${t.nombre}" (${cols.map((c) => `"${c}"`).join(", ")}) VALUES (${cols.map((c) => lit(f[c])).join(", ")});`);
  }
}
for (const i of r.indices) lineas.push(i.replace(/^CREATE (UNIQUE )?INDEX /i, "CREATE $1INDEX IF NOT EXISTS ") + ";");
const sqlFile = path.join(tmp, "restaurar.sql");
fs.writeFileSync(sqlFile, lineas.join("\n"));

// D1 local aislada en la carpeta temporal (no pisa la de desarrollo ni toca producción).
const persist = path.join(tmp, "d1");
execFileSync("npx", ["wrangler", "d1", "execute", "relatos-autopilot", "--local", "--persist-to", persist, "--file", sqlFile, "--yes"], { cwd: "autopilot", shell: true, stdio: ["ignore", "ignore", "inherit"] });
let total = 0, malas = 0;
for (const t of r.tablas) {
  const o = execFileSync("npx", ["wrangler", "d1", "execute", "relatos-autopilot", "--local", "--persist-to", persist, "--json", "--command", `"SELECT COUNT(*) n FROM \\"${t.nombre}\\""`], { cwd: "autopilot", shell: true, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  const n = JSON.parse(o)[0].results[0].n;
  total += n;
  if (n !== t.filas) { malas++; console.log(`❌ ${t.nombre}: ${n} de ${t.filas}`); }
}
console.log(malas ? `❌ ${malas} tablas no coinciden` : `✅ Restauración probada: ${total} filas en ${r.tablas.length} tablas coinciden con el respaldo`);
if (!malas) {
  const j = await (await fetch(`${API}/fabrica/respaldo-probado`, { method: "POST", headers: { "x-clave": CLAVE, "content-type": "application/json" }, body: JSON.stringify({ clave, filas: total }) })).json();
  console.log("Panel:", j.ok ? "prueba registrada" : "no se pudo registrar");
}
fs.rmSync(tmp, { recursive: true, force: true });
process.exit(malas ? 1 : 0);
