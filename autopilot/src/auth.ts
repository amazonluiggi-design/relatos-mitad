// Acceso a RELATOS AI GROUP: correo + contraseña (PBKDF2) + MFA (TOTP) con sesiones guardadas en D1 (revocables).
// La cookie solo lleva un número aleatorio de 32 bytes; en la base se guarda su SHA-256.
import { renderSVG } from "uqr";
import { cifrar, descifrar, nuevoSecreto, verificarTotp } from "./totp";
import type { Env } from "./tipos";

const enc = new TextEncoder();
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const desdeB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const b64url = (b: Uint8Array) => b64(b).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const sha256 = async (s: string) => b64(await crypto.subtle.digest("SHA-256", enc.encode(s)));

const COOKIE = "__Host-grupo";
const INACTIVIDAD_MS = 12 * 3600e3;   // sin uso 12 h → hay que volver a entrar
const MAXIMO_MS = 7 * 86400e3;        // como máximo 7 días aunque se use
const PASO_MFA_MS = 5 * 60e3;         // tiempo para escribir el código tras la contraseña
const ITER = 100000;                  // máximo que permite PBKDF2 en Workers

export type Usuario = { id: number; correo: string; nombre: string | null; rol: string; totp_activo: number };
export type Sesion = { id: string; user: Usuario; nivel: "mfa" | "completa"; origen: string };

// Comparación en tiempo constante.
const iguales = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export async function hashContrasena(clave: string, sal: Uint8Array, iter = ITER) {
  const k = await crypto.subtle.importKey("raw", enc.encode(clave), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: sal, iterations: iter, hash: "SHA-256" }, k, 256));
}

/** Acepta "pbkdf2$iter$sal$hash" y el formato heredado del panel "sal:hash". */
async function claveCorrecta(clave: string, guardado: string) {
  if (typeof clave !== "string" || clave.length > 200) return false;
  const m = /^pbkdf2\$(\d+)\$([^$]+)\$(.+)$/.exec(guardado);
  const [iter, sal, hash] = m ? [+m[1], m[2], m[3]] : [ITER, ...guardado.split(":")];
  return iguales(await hashContrasena(clave, desdeB64(sal), iter), hash);
}

const fechaSql = (t: string) => Date.parse(t.replace(" ", "T") + "Z");
const ipDe = (req: Request) => req.headers.get("cf-connecting-ip") || "x";

export async function auditar(env: Env, accion: string, o: { user_id?: number | null; actor?: string; division?: string | null; detalle?: string; ip?: string | null } = {}) {
  await env.DB.prepare("INSERT INTO audit_logs (user_id, actor, accion, division_id, detalle, ip) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(o.user_id ?? null, o.actor ?? "sistema", accion, o.division ?? null, (o.detalle ?? "").slice(0, 500), o.ip ?? null).run();
}

export async function eventoSeguridad(env: Env, tipo: string, severidad: "baja" | "media" | "alta", detalle: string, ip: string | null = null) {
  await env.DB.prepare("INSERT INTO security_events (tipo, severidad, detalle, ip) VALUES (?, ?, ?, ?)").bind(tipo, severidad, detalle.slice(0, 500), ip).run();
}

/** Primer arranque: crea al propietario con el correo del portal y la contraseña que ya tenía el panel. */
async function asegurarPropietario(env: Env) {
  const hay = await env.DB.prepare("SELECT COUNT(*) n FROM users").first<number>("n");
  if (hay) return;
  await env.DB.prepare("INSERT OR IGNORE INTO users (org_id, correo, nombre, rol, clave_hash) VALUES ('grupo', ?, 'Luiggi Alexander Delgado Mera', 'propietario', ?)")
    .bind(env.PORTAL_CORREO, env.PANEL_HASH).run();
  await auditar(env, "propietario-creado", { actor: "sistema", detalle: "Usuario propietario creado con la contraseña existente del panel" });
}

async function crearSesion(env: Env, req: Request, userId: number, nivel: "mfa" | "completa", origen: string, extra: Record<string, unknown> = {}) {
  const token = b64url(crypto.getRandomValues(new Uint8Array(32)));
  const vence = new Date(Date.now() + (nivel === "mfa" ? PASO_MFA_MS : MAXIMO_MS)).toISOString();
  await env.DB.prepare("INSERT INTO sessions (id, user_id, nivel, origen, vence, ip, agente) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(await sha256(token), userId, nivel, origen, vence, ipDe(req), (req.headers.get("user-agent") || "").slice(0, 120)).run();
  const maxAge = nivel === "mfa" ? PASO_MFA_MS / 1000 : MAXIMO_MS / 1000;
  return Response.json({ ok: true, ...extra }, { headers: { "Set-Cookie": `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}` } });
}

/** Lee la sesión de la cookie. Por defecto exige nivel "completa". */
export async function leerSesion(env: Env, req: Request, nivel: "completa" | "cualquiera" = "completa"): Promise<Sesion | null> {
  const token = new RegExp(`(?:^|;\\s*)${COOKIE.replace(/[$]/g, "\\$")}=([A-Za-z0-9_-]{20,64})`).exec(req.headers.get("cookie") || "")?.[1];
  if (!token) return null;
  const id = await sha256(token);
  const s = await env.DB.prepare(`SELECT s.id, s.nivel, s.origen, s.vence, s.ultima, s.revocada, u.id uid, u.correo, u.nombre, u.rol, u.totp_activo, u.activo
      FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`).bind(id)
    .first<{ id: string; nivel: "mfa" | "completa"; origen: string; vence: string; ultima: string; revocada: number; uid: number; correo: string; nombre: string; rol: string; totp_activo: number; activo: number }>();
  if (!s || s.revocada || !s.activo || Date.parse(s.vence) < Date.now()) return null;
  if (s.nivel === "completa" && fechaSql(s.ultima) < Date.now() - INACTIVIDAD_MS) return null;
  if (nivel === "completa" && s.nivel !== "completa") return null;
  // Marca de actividad cada 5 minutos como mucho (no escribir en cada petición).
  if (fechaSql(s.ultima) < Date.now() - 5 * 60e3) await env.DB.prepare("UPDATE sessions SET ultima = datetime('now') WHERE id = ?").bind(id).run();
  return { id: s.id, nivel: s.nivel, origen: s.origen, user: { id: s.uid, correo: s.correo, nombre: s.nombre, rol: s.rol, totp_activo: s.totp_activo } };
}

/** POST /api/login { correo, clave } → sesión de un paso (falta el código MFA). */
export async function login(env: Env, req: Request) {
  const ip = ipDe(req);
  const llave = `login-fallos:${ip}`;
  const fallosIp = +((await env.KV.get(llave)) || 0);
  if (fallosIp >= 8) {
    await eventoSeguridad(env, "ip-bloqueada", "media", "Más de 8 intentos fallidos en 15 minutos", ip);
    return Response.json({ error: "Demasiados intentos desde esta conexión. Espera 15 minutos." }, { status: 429 });
  }
  await asegurarPropietario(env);
  const { correo, clave } = (await req.json().catch(() => ({}))) as { correo?: string; clave?: string };
  const u = typeof correo === "string" && correo.length < 200
    ? await env.DB.prepare("SELECT id, correo, clave_hash, fallos, bloqueado_hasta, activo, totp_activo FROM users WHERE correo = ?").bind(correo.trim())
        .first<{ id: number; correo: string; clave_hash: string; fallos: number; bloqueado_hasta: string | null; activo: number; totp_activo: number }>()
    : null;
  if (u?.bloqueado_hasta && Date.parse(u.bloqueado_hasta) > Date.now())
    return Response.json({ error: "Cuenta bloqueada temporalmente por intentos fallidos. Espera 15 minutos." }, { status: 429 });
  // Se calcula el hash aunque el correo no exista, para no revelar qué correos existen por el tiempo de respuesta.
  const ok = await claveCorrecta(String(clave ?? ""), u?.clave_hash ?? env.PANEL_HASH) && !!u && !!u.activo;
  if (!ok) {
    await env.KV.put(llave, String(fallosIp + 1), { expirationTtl: 900 });
    if (u) {
      const fallos = u.fallos + 1;
      await env.DB.prepare("UPDATE users SET fallos = ?, bloqueado_hasta = ? WHERE id = ?")
        .bind(fallos >= 5 ? 0 : fallos, fallos >= 5 ? new Date(Date.now() + 15 * 60e3).toISOString() : null, u.id).run();
      if (fallos >= 5) await eventoSeguridad(env, "cuenta-bloqueada", "alta", `5 contraseñas incorrectas seguidas para ${u.correo}`, ip);
    }
    await eventoSeguridad(env, "login-fallido", "baja", `Intento fallido${u ? "" : " con un correo que no existe"}`, ip);
    return Response.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
  }
  await env.DB.prepare("UPDATE users SET fallos = 0, bloqueado_hasta = NULL WHERE id = ?").bind(u.id).run();
  await auditar(env, "contraseña-correcta", { user_id: u.id, actor: u.correo, ip });
  return crearSesion(env, req, u.id, "mfa", "clave", { paso: u.totp_activo ? "codigo" : "enrolar" });
}

/** Rutas /api/mfa/*: alta del autenticador y verificación del código (o de un código de recuperación). */
export async function mfa(env: Env, req: Request, ruta: string) {
  const s = await leerSesion(env, req, "cualquiera");
  if (!s || s.nivel !== "mfa") return Response.json({ error: "La sesión venció. Vuelve a escribir la contraseña." }, { status: 401 });
  const ip = ipDe(req);
  const u = await env.DB.prepare("SELECT id, correo, totp_cifrado, totp_activo, totp_ultimo_paso, recuperacion FROM users WHERE id = ?").bind(s.user.id)
    .first<{ id: number; correo: string; totp_cifrado: string | null; totp_activo: number; totp_ultimo_paso: number; recuperacion: string | null }>();
  if (!u) return Response.json({ error: "usuario" }, { status: 401 });

  // Paso 1 de la configuración: secreto nuevo (todavía inactivo) + QR.
  if (ruta === "/mfa/enrolar" && req.method === "GET") {
    if (u.totp_activo) return Response.json({ error: "El autenticador ya está activo." }, { status: 409 });
    let secreto = u.totp_cifrado ? await descifrar(env.CIFRADO_CLAVE, u.totp_cifrado) : null;
    if (!secreto) {
      secreto = nuevoSecreto();
      await env.DB.prepare("UPDATE users SET totp_cifrado = ? WHERE id = ?").bind(await cifrar(env.CIFRADO_CLAVE, secreto), u.id).run();
    }
    const otpauth = `otpauth://totp/${encodeURIComponent("RELATOS AI GROUP:" + u.correo)}?secret=${secreto}&issuer=${encodeURIComponent("RELATOS AI GROUP")}&algorithm=SHA1&digits=6&period=30`;
    return Response.json({ secreto: secreto.replace(/(.{4})/g, "$1 ").trim(), otpauth, qr: renderSVG(otpauth, { border: 2 }) });
  }

  if ((ruta === "/mfa/activar" || ruta === "/mfa/verificar") && req.method === "POST") {
    const llave = `mfa-fallos:${u.id}`;
    const fallos = +((await env.KV.get(llave)) || 0);
    if (fallos >= 6) return Response.json({ error: "Demasiados códigos incorrectos. Espera 15 minutos." }, { status: 429 });
    const { codigo } = (await req.json().catch(() => ({}))) as { codigo?: string };
    const limpio = String(codigo ?? "").replace(/[\s-]/g, "").toLowerCase();
    if (!u.totp_cifrado) return Response.json({ error: "Primero configura el autenticador." }, { status: 400 });
    if (ruta === "/mfa/activar" && u.totp_activo) return Response.json({ error: "Ya está activo." }, { status: 409 });
    if (ruta === "/mfa/verificar" && !u.totp_activo) return Response.json({ error: "Primero configura el autenticador." }, { status: 400 });

    const secreto = await descifrar(env.CIFRADO_CLAVE, u.totp_cifrado);
    const paso = await verificarTotp(secreto, limpio);
    let via = "totp";
    let recuperacion: string[] = u.recuperacion ? JSON.parse(u.recuperacion) : [];
    let valido = paso !== null && paso > u.totp_ultimo_paso;
    // Código de recuperación (solo para entrar, no para activar), de un solo uso.
    if (!valido && ruta === "/mfa/verificar" && /^[a-z0-9]{10}$/.test(limpio)) {
      const h = await sha256("rec:" + limpio);
      if (recuperacion.includes(h)) { valido = true; via = "recuperacion"; recuperacion = recuperacion.filter((x) => x !== h); }
    }
    if (!valido) {
      await env.KV.put(llave, String(fallos + 1), { expirationTtl: 900 });
      await eventoSeguridad(env, "mfa-fallido", fallos + 1 >= 3 ? "media" : "baja", `Código incorrecto para ${u.correo}`, ip);
      return Response.json({ error: "Código incorrecto o ya usado. Escribe el que muestra ahora tu app." }, { status: 401 });
    }
    await env.KV.delete(llave);
    if (paso !== null && via === "totp") await env.DB.prepare("UPDATE users SET totp_ultimo_paso = ? WHERE id = ?").bind(paso, u.id).run();

    let codigos: string[] | undefined;
    if (ruta === "/mfa/activar") {
      codigos = Array.from({ length: 10 }, () => Array.from(crypto.getRandomValues(new Uint8Array(10)), (b) => "abcdefghjkmnpqrstuvwxyz23456789"[b % 31]).join(""));
      recuperacion = await Promise.all(codigos.map((c) => sha256("rec:" + c)));
      await env.DB.prepare("UPDATE users SET totp_activo = 1 WHERE id = ?").bind(u.id).run();
      await auditar(env, "mfa-activado", { user_id: u.id, actor: u.correo, ip });
    }
    await env.DB.prepare("UPDATE users SET recuperacion = ? WHERE id = ?").bind(JSON.stringify(recuperacion), u.id).run();
    if (via === "recuperacion") await eventoSeguridad(env, "codigo-recuperacion", "media", `Entrada con código de recuperación (quedan ${recuperacion.length})`, ip);
    // Al completar el MFA se cambia el token (la sesión de un paso deja de servir).
    await env.DB.prepare("UPDATE sessions SET revocada = 1 WHERE id = ?").bind(s.id).run();
    await auditar(env, "login", { user_id: u.id, actor: u.correo, ip, detalle: via === "recuperacion" ? "con código de recuperación" : "con autenticador" });
    return crearSesion(env, req, u.id, "completa", "clave", codigos ? { codigos } : {});
  }
  return Response.json({ error: "ruta" }, { status: 404 });
}

/** Entrada desde el portal de empresas (pase Ed25519 ya verificado). */
export async function sesionPortal(env: Env, req: Request, correo: string) {
  await asegurarPropietario(env);
  const u = await env.DB.prepare("SELECT id FROM users WHERE correo = ? AND activo = 1").bind(correo).first<number>("id");
  if (!u) return Response.json({ error: "usuario" }, { status: 401 });
  await auditar(env, "login", { user_id: u, actor: correo, ip: ipDe(req), detalle: "desde el portal de empresas" });
  return crearSesion(env, req, u, "completa", "portal");
}

export async function salir(env: Env, req: Request) {
  const s = await leerSesion(env, req, "cualquiera");
  if (s) {
    await env.DB.prepare("UPDATE sessions SET revocada = 1 WHERE id = ?").bind(s.id).run();
    await auditar(env, "logout", { user_id: s.user.id, actor: s.user.correo, ip: ipDe(req) });
  }
  return Response.json({ ok: true }, { headers: { "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` } });
}

/** Cierra todas las sesiones del usuario (incluida la actual). */
export async function salirDeTodo(env: Env, req: Request, s: Sesion) {
  const r = await env.DB.prepare("UPDATE sessions SET revocada = 1 WHERE user_id = ? AND revocada = 0").bind(s.user.id).run();
  await auditar(env, "cierre-global", { user_id: s.user.id, actor: s.user.correo, ip: ipDe(req), detalle: `${r.meta.changes} sesiones cerradas` });
  return Response.json({ ok: true, cerradas: r.meta.changes }, { headers: { "Set-Cookie": `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0` } });
}

export async function misSesiones(env: Env, s: Sesion) {
  return (await env.DB.prepare(`SELECT substr(id, 1, 8) ref, origen, creada, ultima, ip, agente, id = ? actual FROM sessions
      WHERE user_id = ? AND revocada = 0 AND nivel = 'completa' AND vence > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ORDER BY ultima DESC LIMIT 20`).bind(s.id, s.user.id).all()).results;
}
