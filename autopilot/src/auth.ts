// Sesión del panel: un solo administrador con contraseña (PBKDF2) y cookie firmada (HMAC).
import type { Env } from "./tipos";

const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const desdeB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const enc = new TextEncoder();

export async function hashContrasena(clave: string, sal: Uint8Array) {
  const k = await crypto.subtle.importKey("raw", enc.encode(clave), "PBKDF2", false, ["deriveBits"]);
  return b64(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: sal, iterations: 100000, hash: "SHA-256" }, k, 256));
}

async function firmar(env: Env, datos: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(env.SESION_SECRETO), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", k, enc.encode(datos))).replace(/=+$/, "");
}

// Comparación en tiempo constante.
const iguales = (a: string, b: string) => {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
};

export async function sesionValida(env: Env, req: Request) {
  const c = /(?:^|;\s*)sesion=([^;]+)/.exec(req.headers.get("cookie") || "")?.[1];
  if (!c) return false;
  const [vence, firma] = decodeURIComponent(c).split(".");
  if (!vence || !firma || Date.now() > +vence) return false;
  return iguales(firma, await firmar(env, vence));
}

export async function login(env: Env, req: Request) {
  const ip = req.headers.get("cf-connecting-ip") || "x";
  const llave = `login-fallos:${ip}`;
  const fallos = +((await env.KV.get(llave)) || 0);
  if (fallos >= 8) return Response.json({ error: "Demasiados intentos. Espera 15 minutos." }, { status: 429 });
  const { clave } = (await req.json().catch(() => ({}))) as { clave?: string };
  const [sal, hash] = env.PANEL_HASH.split(":");
  const ok = typeof clave === "string" && clave.length < 200 && iguales(await hashContrasena(clave, desdeB64(sal)), hash);
  if (!ok) {
    await env.KV.put(llave, String(fallos + 1), { expirationTtl: 900 });
    return Response.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }
  return crearSesion(env);
}

export async function crearSesion(env: Env) {
  const vence = String(Date.now() + 30 * 86400000);
  const cookie = `sesion=${encodeURIComponent(`${vence}.${await firmar(env, vence)}`)}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 86400}`;
  return Response.json({ ok: true }, { headers: { "Set-Cookie": cookie } });
}

export const salir = () =>
  Response.json({ ok: true }, { headers: { "Set-Cookie": "sesion=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" } });
