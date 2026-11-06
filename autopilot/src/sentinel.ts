// SENTINEL: controles de seguridad implementados en código (no depende de la IA).
// - Lista blanca del SQL que puede mandar la fábrica.
// - Botón DETENER EMPRESA (por grupo, división y ámbito).
// - Presupuesto con topes mensuales, por proveedor y diario.
// - Respaldo diario cifrado de D1 en R2.
// - Informe de seguridad con comprobaciones automáticas.
import { auditar, eventoSeguridad } from "./auth";
import { evento, type Env } from "./tipos";

/* ───────────── SQL de la fábrica ───────────── */
const TABLAS_FABRICA = new Set(["historias", "videos", "publicaciones", "eventos", "recomendaciones", "animaciones", "metricas"]);
const PROTEGIDAS = /\b(users|sessions|audit_logs|security_events|config|cost_ledger|backups|divisions|organizations|user_divisions|d1_migrations|sqlite_master|sqlite_schema)\b/i;

/** null si la sentencia es aceptable; si no, el motivo. Se analizan sin los textos entre comillas. */
export function validarSql(s: string): string | null {
  if (typeof s !== "string" || s.length > 20000) return "sentencia no válida";
  const sin = s.replace(/'(?:[^']|'')*'/g, "''").replace(/--[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").trim().replace(/;\s*$/, "");
  if (sin.includes(";")) return "una sola sentencia por elemento";
  const m = /^(?:INSERT(?:\s+OR\s+(?:REPLACE|IGNORE))?\s+INTO|REPLACE\s+INTO|UPDATE)\s+"?([A-Za-z_]+)"?/i.exec(sin);
  if (!m) return "solo se permite INSERT o UPDATE";
  if (!TABLAS_FABRICA.has(m[1].toLowerCase())) return `tabla no permitida: ${m[1]}`;
  if (/\b(DROP|ALTER|ATTACH|DETACH|PRAGMA|DELETE|CREATE|VACUUM|REINDEX|load_extension|readfile|writefile)\b/i.test(sin)) return "operación no permitida";
  if (PROTEGIDAS.test(sin)) return "toca una tabla protegida";
  return null;
}

/* ───────────── DETENER EMPRESA ───────────── */
export const AMBITOS = ["grupo", "relatos", "gaming", "publicaciones", "renderizados", "agentes", "apis"] as const;
export type Ambito = (typeof AMBITOS)[number];
export type Detener = Record<Ambito, boolean> & { cambiado?: string; por?: string };

export async function leerDetener(env: Env): Promise<Detener> {
  const v = await env.DB.prepare("SELECT valor FROM config WHERE clave = 'detener'").first<string>("valor");
  const base = Object.fromEntries(AMBITOS.map((a) => [a, false])) as unknown as Detener;
  try { return { ...base, ...(v ? JSON.parse(v) : {}) }; } catch { return { ...base, grupo: true }; } // si está corrupto, se asume detenido
}

/** ¿Está detenida esa división o ese ámbito (o todo el grupo)? */
export async function detenido(env: Env, division: string | null, ambito: Ambito | null, d?: Detener) {
  const x = d ?? (await leerDetener(env));
  return x.grupo || (division ? !!x[division as Ambito] : false) || (ambito ? x[ambito] : false);
}

export async function cambiarDetener(env: Env, ambito: string, valor: boolean, quien: { id: number; correo: string }, ip: string | null) {
  if (!(AMBITOS as readonly string[]).includes(ambito)) throw new Error("ámbito no válido");
  const d = await leerDetener(env);
  d[ambito as Ambito] = valor;
  d.cambiado = new Date().toISOString(); d.por = quien.correo;
  await env.DB.prepare("UPDATE config SET valor = ? WHERE clave = 'detener'").bind(JSON.stringify(d)).run();
  await auditar(env, valor ? "DETENER" : "reanudar", { user_id: quien.id, actor: quien.correo, ip, division: ["relatos", "gaming"].includes(ambito) ? ambito : null, detalle: ambito });
  await evento(env, valor ? `🛑 DETENIDO: ${ambito} (por ${quien.correo})` : `▶ Reanudado: ${ambito} (por ${quien.correo})`, valor ? "error" : "aviso");
  return d;
}

/* ───────────── Presupuesto ───────────── */
type Presupuesto = { total: number; diario: number; proveedores: Record<string, number> };
const GRUPO_PROVEEDOR: Record<string, string> = { anthropic: "anthropic", elevenlabs: "elevenlabs", cloudflare: "infraestructura", "workers-ai": "infraestructura", github: "infraestructura", hetzner: "infraestructura" };
export const grupoDe = (p: string) => GRUPO_PROVEEDOR[p] ?? "reserva";
const mesEc = (d = new Date()) => new Date(d.getTime() - 5 * 3600e3).toISOString().slice(0, 7);
const diaEc = (d = new Date()) => new Date(d.getTime() - 5 * 3600e3).toISOString().slice(0, 10);

export async function leerPresupuesto(env: Env): Promise<Presupuesto> {
  const v = await env.DB.prepare("SELECT valor FROM config WHERE clave = 'presupuesto'").first<string>("valor");
  const p = JSON.parse(v || "{}") as Presupuesto;
  return { total: Math.min(p.total ?? 75, 75), diario: p.diario ?? 6, proveedores: p.proveedores ?? {} }; // 75 es el techo duro del V3
}

export async function estadoPresupuesto(env: Env) {
  await suscripcionesDelMes(env); // idempotente: anota las fijas del mes si aún no están
  const p = await leerPresupuesto(env);
  const mes = mesEc();
  const filas = (await env.DB.prepare("SELECT proveedor, division_id, tipo, SUM(monto_usd) usd, SUM(unidades) unidades, MAX(unidad) unidad, COUNT(*) n FROM cost_ledger WHERE mes = ? GROUP BY proveedor, division_id, tipo").bind(mes).all<{ proveedor: string; division_id: string | null; tipo: string; usd: number; unidades: number | null; unidad: string | null; n: number }>()).results;
  const porGrupo: Record<string, number> = {}, porDivision: Record<string, number> = {}, porProveedor: Record<string, { usd: number; unidades: number | null; unidad: string | null }> = {};
  let usado = 0, estimado = 0;
  for (const f of filas) {
    usado += f.usd; if (f.tipo === "estimado") estimado += f.usd;
    porGrupo[grupoDe(f.proveedor)] = (porGrupo[grupoDe(f.proveedor)] || 0) + f.usd;
    porDivision[f.division_id ?? "compartido"] = (porDivision[f.division_id ?? "compartido"] || 0) + f.usd;
    const pp = (porProveedor[f.proveedor] ??= { usd: 0, unidades: null, unidad: f.unidad });
    pp.usd += f.usd; if (f.unidades != null) pp.unidades = (pp.unidades || 0) + f.unidades;
  }
  const hoy = (await env.DB.prepare("SELECT COALESCE(SUM(monto_usd), 0) s FROM cost_ledger WHERE substr(datetime(cuando, '-5 hours'), 1, 10) = ? AND COALESCE(ref, '') NOT LIKE 'sub:%'").bind(diaEc()).first<number>("s")) || 0;
  // Proyección: lo fijo del mes + lo variable al ritmo de los días transcurridos.
  const fijo = (await env.DB.prepare("SELECT COALESCE(SUM(monto_usd), 0) s FROM cost_ledger WHERE mes = ? AND ref LIKE 'sub:%'").bind(mes).first<number>("s")) || 0;
  const ahora = new Date(Date.now() - 5 * 3600e3), diasMes = new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() + 1, 0)).getUTCDate();
  const proyeccion = fijo + ((usado - fijo) / Math.max(1, ahora.getUTCDate())) * diasMes;
  const ultimos = (await env.DB.prepare("SELECT cuando, proveedor, division_id, concepto, monto_usd, tipo, unidades, unidad, agente FROM cost_ledger ORDER BY id DESC LIMIT 25").all()).results;
  return { mes, limites: p, usado, estimado, disponible: Math.max(0, p.total - usado), hoy, proyeccion, porGrupo, porDivision, porProveedor, ultimos };
}

/** Comprueba si cabe un gasto. No escribe nada. */
export async function verificarGasto(env: Env, proveedor: string, monto: number, division: string | null) {
  if (await detenido(env, division, "apis")) return { ok: false, motivo: "El botón DETENER tiene paradas las APIs con consumo." };
  if (!(monto >= 0) || monto > 75) return { ok: false, motivo: "monto no válido" };
  const e = await estadoPresupuesto(env);
  const g = grupoDe(proveedor), tope = e.limites.proveedores[g];
  if (e.usado + monto > e.limites.total) return { ok: false, motivo: `Se pasaría del presupuesto mensual (${e.usado.toFixed(2)} + ${monto.toFixed(2)} > ${e.limites.total}).` };
  if (tope != null && (e.porGrupo[g] || 0) + monto > tope) return { ok: false, motivo: `Se pasaría del tope de ${g} (${(e.porGrupo[g] || 0).toFixed(2)} + ${monto.toFixed(2)} > ${tope}).` };
  if (e.hoy + monto > e.limites.diario) return { ok: false, motivo: `Se pasaría del tope diario (${e.hoy.toFixed(2)} + ${monto.toFixed(2)} > ${e.limites.diario}).` };
  return { ok: true, disponible: e.disponible - monto };
}

export async function registrarGasto(env: Env, g: { proveedor: string; concepto: string; monto: number; tipo?: string; unidades?: number | null; unidad?: string | null; division?: string | null; agente?: string | null; ref?: string | null }) {
  await env.DB.prepare("INSERT OR IGNORE INTO cost_ledger (division_id, proveedor, concepto, monto_usd, tipo, unidades, unidad, agente, ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(g.division ?? null, g.proveedor, g.concepto.slice(0, 200), g.monto, g.tipo === "estimado" ? "estimado" : "real", g.unidades ?? null, g.unidad ?? null, g.agente ?? null, g.ref ?? null).run();
}

/** Anota las suscripciones fijas del mes (idempotente: una sola vez por mes y proveedor). */
export async function suscripcionesDelMes(env: Env) {
  const lista = JSON.parse((await env.DB.prepare("SELECT valor FROM config WHERE clave = 'suscripciones'").first<string>("valor")) || "[]") as { proveedor: string; concepto: string; monto: number; tipo: string }[];
  const mes = mesEc();
  for (const s of lista) await registrarGasto(env, { proveedor: s.proveedor, concepto: `${s.concepto} · ${mes}`, monto: s.monto, tipo: s.tipo, ref: `sub:${s.proveedor}:${mes}`, agente: "suscripción" });
}

/* ───────────── Respaldo cifrado ───────────── */
async function llaveRespaldo(env: Env) {
  return crypto.subtle.importKey("raw", Uint8Array.from(atob(env.RESPALDO_CLAVE), (c) => c.charCodeAt(0)), "AES-GCM", false, ["encrypt"]);
}

/** Exporta todas las tablas (esquema + filas) → gzip → AES-GCM → R2 respaldos/. Guarda 14 días. */
export async function hacerRespaldo(env: Env) {
  const clave = `respaldos/d1-${new Date().toISOString().slice(0, 16).replace(":", "")}.json.gz.enc`;
  try {
    const tablas = (await env.DB.prepare("SELECT name, sql FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' ORDER BY name").all<{ name: string; sql: string }>()).results;
    const indices = (await env.DB.prepare("SELECT sql FROM sqlite_master WHERE type = 'index' AND sql IS NOT NULL AND name NOT LIKE '_cf_%'").all<{ sql: string }>()).results.map((x) => x.sql);
    const datos: Record<string, unknown[]> = {};
    let filas = 0;
    for (const t of tablas) {
      datos[t.name] = [];
      for (let desde = 0; ; desde += 5000) {
        const r = (await env.DB.prepare(`SELECT * FROM "${t.name.replace(/"/g, "")}" LIMIT 5000 OFFSET ?`).bind(desde).all()).results;
        datos[t.name].push(...r); filas += r.length;
        if (r.length < 5000) break;
      }
    }
    const json = JSON.stringify({ version: 1, hecho: new Date().toISOString(), tablas: tablas.map((t) => ({ nombre: t.name, sql: t.sql, filas: datos[t.name].length })), indices, datos });
    const gz = await new Response(new Blob([json]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cifrado = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await llaveRespaldo(env), gz));
    const cuerpo = new Uint8Array(4 + 12 + cifrado.length);
    cuerpo.set(new TextEncoder().encode("RAG1")); cuerpo.set(iv, 4); cuerpo.set(cifrado, 16);
    await env.VIDEOS.put(clave, cuerpo, { httpMetadata: { contentType: "application/octet-stream" }, customMetadata: { filas: String(filas), tablas: String(tablas.length) } });
    await env.DB.prepare("INSERT INTO backups (clave_r2, bytes, tablas, filas, estado) VALUES (?, ?, ?, ?, 'ok')").bind(clave, cuerpo.length, tablas.length, filas).run();
    // Se borran los respaldos de más de 14 días (en R2 y en la tabla).
    const viejos = (await env.DB.prepare("SELECT id, clave_r2 FROM backups WHERE cuando < datetime('now', '-14 days')").all<{ id: number; clave_r2: string }>()).results;
    for (const v of viejos) { await env.VIDEOS.delete(v.clave_r2); await env.DB.prepare("DELETE FROM backups WHERE id = ?").bind(v.id).run(); }
    return { ok: true, clave, bytes: cuerpo.length, filas, tablas: tablas.length };
  } catch (e) {
    await env.DB.prepare("INSERT INTO backups (clave_r2, estado, detalle) VALUES (?, 'error', ?)").bind(clave, String(e).slice(0, 300)).run();
    await evento(env, `Respaldo diario falló: ${String(e).slice(0, 200)}`, "error");
    return { ok: false, error: String(e) };
  }
}

/* ───────────── Informe de Sentinel ───────────── */
type Control = { id: string; nombre: string; estado: "ok" | "aviso" | "grave"; detalle: string };

export async function informeSentinel(env: Env) {
  const c: Control[] = [];
  const add = (id: string, nombre: string, estado: Control["estado"], detalle: string) => c.push({ id, nombre, estado, detalle });

  const u = await env.DB.prepare("SELECT correo, totp_activo, (SELECT COUNT(*) FROM json_each(COALESCE(recuperacion, '[]'))) rec FROM users WHERE rol = 'propietario' LIMIT 1").first<{ correo: string; totp_activo: number; rec: number }>();
  add("mfa", "Verificación en dos pasos del propietario", u?.totp_activo ? (u.rec <= 2 ? "aviso" : "ok") : "grave",
    u?.totp_activo ? `Activa · quedan ${u.rec} códigos de recuperación` : "Sin activar: entra con correo y contraseña para configurarla");

  const b = await env.DB.prepare("SELECT cuando, estado, filas, bytes, restaurado_prueba FROM backups ORDER BY id DESC LIMIT 1").first<{ cuando: string; estado: string; filas: number; bytes: number; restaurado_prueba: string | null }>();
  const horas = b ? (Date.now() - Date.parse(b.cuando.replace(" ", "T") + "Z")) / 3600e3 : Infinity;
  add("respaldo", "Respaldo diario cifrado", !b || b.estado !== "ok" ? "grave" : horas > 30 ? "aviso" : "ok",
    b ? `${b.estado === "ok" ? "Último" : "Falló el último"}: hace ${Math.round(horas)} h · ${b.filas ?? 0} filas · ${Math.round((b.bytes || 0) / 1024)} KB` : "Aún no hay respaldos");
  const prueba = await env.DB.prepare("SELECT MAX(restaurado_prueba) p FROM backups").first<string>("p");
  add("restauracion", "Prueba de restauración", prueba && Date.now() - Date.parse(prueba) < 35 * 86400e3 ? "ok" : "aviso", prueba ? `Última prueba exitosa: ${prueba.slice(0, 10)}` : "Nunca probada (se hace con scripts/restaurar-respaldo.mjs)");

  const s = await env.DB.prepare("SELECT SUM(severidad = 'alta') altas, SUM(severidad = 'media') medias, SUM(tipo = 'login-fallido') fallidos, SUM(tipo = 'sql-rechazado') sql FROM security_events WHERE cuando >= datetime('now', '-1 day')").first<{ altas: number | null; medias: number | null; fallidos: number | null; sql: number | null }>();
  add("eventos", "Eventos de seguridad (24 h)", s?.altas ? "grave" : (s?.medias || 0) > 3 ? "aviso" : "ok", `${s?.altas || 0} graves · ${s?.medias || 0} medios · ${s?.fallidos || 0} logins fallidos · ${s?.sql || 0} SQL rechazados`);

  const ses = await env.DB.prepare("SELECT COUNT(*) n, COUNT(DISTINCT ip) ips FROM sessions WHERE revocada = 0 AND nivel = 'completa' AND vence > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')").first<{ n: number; ips: number }>();
  add("sesiones", "Sesiones abiertas", (ses?.ips || 0) > 4 ? "aviso" : "ok", `${ses?.n || 0} sesiones desde ${ses?.ips || 0} conexiones`);

  const p = await estadoPresupuesto(env);
  add("presupuesto", "Presupuesto del mes", p.usado > p.limites.total * 0.9 ? "grave" : p.proyeccion > p.limites.total ? "aviso" : "ok",
    `$${p.usado.toFixed(2)} de $${p.limites.total} · proyección $${p.proyeccion.toFixed(2)}`);

  const d = await leerDetener(env);
  const parados = AMBITOS.filter((a) => d[a]);
  add("detener", "Botón DETENER EMPRESA", parados.length ? "aviso" : "ok", parados.length ? `Detenido: ${parados.join(", ")}` : "Todo en marcha");

  // Hallazgos conocidos que dependen de una decisión del propietario.
  add("clave-compartida", "Clave de scripts compartida con el Worker de imágenes (S2)", "aviso", "No se rota sin tu autorización (el V3 prohíbe cambiar credenciales existentes). Recomendación: claves separadas.");

  const eventos = (await env.DB.prepare("SELECT cuando, tipo, severidad, detalle, ip FROM security_events ORDER BY id DESC LIMIT 30").all()).results;
  return { controles: c, eventos, generado: new Date().toISOString() };
}

/** Revisión diaria: deja constancia y avisa (eventos de nivel error salen en la salud → WhatsApp). */
export async function revisionDiaria(env: Env) {
  const r = await informeSentinel(env);
  const graves = r.controles.filter((x) => x.estado === "grave");
  if (graves.length) await evento(env, `Sentinel: ${graves.map((g) => `${g.nombre}: ${g.detalle}`).join(" | ")}`.slice(0, 480), "aviso");
  await auditar(env, "sentinel-revision", { actor: "SENTINEL", detalle: r.controles.map((x) => `${x.id}=${x.estado}`).join(" ") });
}

export { eventoSeguridad };
