// RELATOS GAMING MEDIA: marca, creadores autorizados y RIGHTS MANAGER.
// La regla de monetización vive aquí, en código: un recurso es apto para publicación monetizada solo si TODOS sus
// titulares tienen estado "comercial", ninguno está vencido, y el titular base (Rockstar) también es "comercial".
import { auditar, type Sesion } from "./auth";
import type { Env } from "./tipos";

const ESTADOS = ["pendiente", "autorizado", "no-comercial", "comercial", "restricciones", "rechazado", "vencido"];
const TIPOS = ["gameplay-propio", "clip-creador", "musica", "imagen", "marca", "material-oficial"];
const t = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : null);
const vencido = (v: string | null) => !!v && Date.parse(v) < Date.now();

/** ¿Puede este recurso ir a una publicación monetizada? Devuelve el motivo si no. */
export async function aptoMonetizado(env: Env, recurso: string) {
  const filas = (await env.DB.prepare("SELECT recurso, titular, estado, vence FROM rights_permissions WHERE division_id = 'gaming' AND recurso IN (?, 'base-gta')").bind(recurso).all<{ recurso: string; titular: string; estado: string; vence: string | null }>()).results;
  if (!filas.some((f) => f.recurso === recurso)) return { apto: false, motivo: "El recurso no tiene titulares registrados." };
  if (!filas.some((f) => f.recurso === "base-gta")) return { apto: false, motivo: "Falta el registro del titular base (Rockstar)." };
  const malos = filas.filter((f) => f.estado !== "comercial" || vencido(f.vence));
  return malos.length ? { apto: false, motivo: malos.map((f) => `${f.titular}: ${vencido(f.vence) ? "vencido" : f.estado}`).join(" · ") } : { apto: true, motivo: "Todos los titulares con autorización comercial vigente." };
}

export async function datosGaming(env: Env) {
  const marca = JSON.parse((await env.DB.prepare("SELECT valor FROM config WHERE clave = 'gaming-marca'").first<string>("valor")) || "{}");
  const creadores = (await env.DB.prepare("SELECT * FROM creators WHERE division_id = 'gaming' ORDER BY id DESC").all()).results;
  const derechos = (await env.DB.prepare("SELECT r.*, c.nombre creador FROM rights_permissions r LEFT JOIN creators c ON c.id = r.creator_id WHERE r.division_id = 'gaming' ORDER BY r.recurso = 'base-gta' DESC, r.id DESC").all()).results;
  const recursos = [...new Set((derechos as { recurso: string }[]).map((d) => d.recurso).filter((r) => r !== "base-gta"))];
  const aptitud = Object.fromEntries(await Promise.all(recursos.map(async (r) => [r, await aptoMonetizado(env, r)])));
  const memoria = (await env.DB.prepare("SELECT id, tipo, titulo, contenido, autor, fuentes, confianza, creado FROM company_memory WHERE division_id = 'gaming' ORDER BY id DESC LIMIT 20").all()).results;
  return { marca, creadores, derechos, aptitud, memoria, estados: ESTADOS, tipos: TIPOS };
}

export async function guardarMarca(env: Env, ses: Sesion, cuerpo: Record<string, unknown>) {
  const actual = JSON.parse((await env.DB.prepare("SELECT valor FROM config WHERE clave = 'gaming-marca'").first<string>("valor")) || "{}");
  const redes = (cuerpo.redes ?? {}) as Record<string, unknown>;
  const nueva = { ...actual, nombre: t(cuerpo.nombre, 80) || actual.nombre || null,
    redes: { facebook: t(redes.facebook, 200) ?? actual.redes?.facebook ?? null, youtube: t(redes.youtube, 200) ?? actual.redes?.youtube ?? null, tiktok: t(redes.tiktok, 200) ?? actual.redes?.tiktok ?? null } };
  await env.DB.prepare("UPDATE config SET valor = ? WHERE clave = 'gaming-marca'").bind(JSON.stringify(nueva)).run();
  await auditar(env, "gaming-marca", { user_id: ses.user.id, actor: ses.user.correo, division: "gaming", detalle: nueva.nombre || "" });
  return nueva;
}

export async function guardarCreador(env: Env, ses: Sesion, c: Record<string, unknown>) {
  const nombre = t(c.nombre, 120);
  if (!nombre) return { error: "El nombre del creador es obligatorio." };
  const plataformas = Array.isArray(c.plataformas) ? JSON.stringify(c.plataformas.filter((p) => ["youtube", "tiktok", "facebook"].includes(String(p)))) : null;
  const vals = [nombre, t(c.canal, 300), t(c.contacto, 200), t(c.propietario_grabacion, 200), t(c.fecha_autorizacion, 20), plataformas, c.uso_comercial ? 1 : 0, c.publicidad_patrocinios ? 1 : 0, t(c.modificaciones), t(c.atribucion), t(c.territorios, 200), t(c.vence, 20), t(c.pruebas, 1000), t(c.restricciones, 1000)];
  const id = Number(c.id) || null;
  const r = id
    ? await env.DB.prepare("UPDATE creators SET nombre=?, canal=?, contacto=?, propietario_grabacion=?, fecha_autorizacion=?, plataformas=?, uso_comercial=?, publicidad_patrocinios=?, modificaciones=?, atribucion=?, territorios=?, vence=?, pruebas=?, restricciones=? WHERE id = ? AND division_id = 'gaming'").bind(...vals, id).run()
    : await env.DB.prepare("INSERT INTO creators (nombre, canal, contacto, propietario_grabacion, fecha_autorizacion, plataformas, uso_comercial, publicidad_patrocinios, modificaciones, atribucion, territorios, vence, pruebas, restricciones) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(...vals).run();
  await auditar(env, id ? "creador-editado" : "creador-registrado", { user_id: ses.user.id, actor: ses.user.correo, division: "gaming", detalle: nombre });
  return { ok: true, id: id ?? r.meta.last_row_id };
}

export async function guardarDerecho(env: Env, ses: Sesion, d: Record<string, unknown>) {
  const recurso = t(d.recurso, 300), titular = t(d.titular, 200);
  const estado = String(d.estado || "pendiente"), tipo = String(d.tipo || "");
  if (!recurso || !titular) return { error: "Recurso y titular son obligatorios." };
  if (!ESTADOS.includes(estado) || !TIPOS.includes(tipo)) return { error: "Estado o tipo no válido." };
  // Autorización comercial sin prueba ni base no se acepta: no se inventan permisos.
  if (estado === "comercial" && !t(d.pruebas, 1000) && !t(d.base, 1000)) return { error: "Para marcar uso COMERCIAL hace falta la prueba o la base de la autorización (contrato, correo, licencia)." };
  const creator = Number(d.creator_id) || null;
  const vals = [recurso, tipo, titular, creator, estado, t(d.plataformas, 200), t(d.vence, 20), t(d.base, 1000), t(d.pruebas, 1000), t(d.restricciones, 1000), ses.user.correo];
  const id = Number(d.id) || null;
  const r = id
    ? await env.DB.prepare("UPDATE rights_permissions SET recurso=?, tipo=?, titular=?, creator_id=?, estado=?, plataformas=?, vence=?, base=?, pruebas=?, restricciones=?, verificado_por=?, actualizado=datetime('now') WHERE id = ? AND division_id = 'gaming'").bind(...vals, id).run()
    : await env.DB.prepare("INSERT INTO rights_permissions (recurso, tipo, titular, creator_id, estado, plataformas, vence, base, pruebas, restricciones, verificado_por) VALUES (?,?,?,?,?,?,?,?,?,?,?)").bind(...vals).run();
  await auditar(env, "derecho-" + estado, { user_id: ses.user.id, actor: ses.user.correo, division: "gaming", detalle: `${recurso} · ${titular}` });
  return { ok: true, id: id ?? r.meta.last_row_id, apto: await aptoMonetizado(env, recurso) };
}
