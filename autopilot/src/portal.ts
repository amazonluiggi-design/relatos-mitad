// Entrada desde el portal de empresas (luiggi-empresas.web.app) sin contraseña.
// El portal firma un PASE (JWT EdDSA/Ed25519, 60 s, un solo uso). Aquí solo existe la llave PÚBLICA:
// aunque alguien leyera este Worker, no podría fabricar pases.
import { crearSesion } from "./auth";
import type { Env } from "./tipos";

const LLAVE_PUBLICA = "MCowBQYDK2VwAyEAuQZsBJH7RyBfL+fMP+90pkteJfrHULBwf2gQ6z3oAA8=";
const EMISOR = "portal-luiggi";

const b64url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

/** Verifica el pase y lo marca como usado. Devuelve el correo, o null si no sirve. */
export async function leerPase(env: Env, pase: string, audiencia: string): Promise<string | null> {
  const partes = pase.split(".");
  if (partes.length !== 3 || pase.length > 4000) return null;
  try {
    const cab = JSON.parse(new TextDecoder().decode(b64url(partes[0])));
    if (cab.alg !== "EdDSA") return null;
    const llave = await crypto.subtle.importKey("spki", b64url(LLAVE_PUBLICA), { name: "Ed25519" }, false, ["verify"]);
    const ok = await crypto.subtle.verify("Ed25519", llave, b64url(partes[2]), new TextEncoder().encode(`${partes[0]}.${partes[1]}`));
    if (!ok) return null;
    const d = JSON.parse(new TextDecoder().decode(b64url(partes[1]))) as { iss?: string; aud?: string | string[]; sub?: string; exp?: number; iat?: number; jti?: string };
    const ahora = Date.now() / 1000;
    const aud = Array.isArray(d.aud) ? d.aud : [d.aud];
    if (d.iss !== EMISOR || !aud.includes(audiencia) || !d.exp || d.exp < ahora || !d.iat || ahora - d.iat > 65 || !d.jti || !d.sub) return null;
    // Solo el dueño del portal.
    if (d.sub.toLowerCase() !== env.PORTAL_CORREO.toLowerCase()) return null;
    // Un solo uso (KV recuerda el id 2 minutos; el pase vence a los 60 s).
    const llaveUso = `pase:${d.jti}`;
    if (await env.KV.get(llaveUso)) return null;
    await env.KV.put(llaveUso, "1", { expirationTtl: 120 });
    return d.sub;
  } catch {
    return null;
  }
}

/** POST /api/portal { pase } → cookie de sesión del panel. */
export async function entrarDesdePortal(env: Env, req: Request) {
  const { pase } = (await req.json().catch(() => ({}))) as { pase?: string };
  const correo = typeof pase === "string" ? await leerPase(env, pase, "relatos") : null;
  if (!correo) return Response.json({ error: "El pase venció o ya se usó. Vuelve a abrir Relatos desde el portal." }, { status: 401 });
  return crearSesion(env);
}
