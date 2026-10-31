// Conexión y aprobación de publicaciones de TikTok desde el panel, según las guías de Content Posting de TikTok:
// el creador ve su cuenta, elige la privacidad (sin valor por defecto), las interacciones y la divulgación comercial
// de cada video, y da su consentimiento antes de que se publique.
import { type Env, evento } from "./tipos";

const TT = "https://open.tiktokapis.com/v2";
const WEB = "https://relatos-web.probador-worker.workers.dev";
const REGRESO = WEB + "/tiktok/regreso";
const ALCANCE = "user.info.basic,user.info.stats,video.list,video.upload,video.publish";

type Token = { client_key: string; client_secret: string; access_token: string; refresh_token: string; expires_in: number; obtenido: number };
export type OpcionesTT = { comentarios: boolean; duo: boolean; stitch: boolean; marca: boolean; patrocinado: boolean };

async function token(env: Env) {
  const t = JSON.parse((await env.KV.get("tiktok-token"))!) as Token;
  if (Date.now() < t.obtenido + (t.expires_in - 900) * 1000) return t.access_token;
  const n = (await (await fetch(`${TT}/oauth/token/`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: t.client_key, client_secret: t.client_secret, grant_type: "refresh_token", refresh_token: t.refresh_token }) })).json()) as Partial<Token>;
  if (!n.access_token) throw new Error("token TikTok");
  await env.KV.put("tiktok-token", JSON.stringify({ ...t, ...n, obtenido: Date.now() }));
  return n.access_token;
}

/** URL de "Continuar con TikTok" (Login Kit). */
export async function urlConectar(env: Env) {
  const t = JSON.parse((await env.KV.get("tiktok-token"))!) as Token;
  const estado = crypto.randomUUID().replace(/-/g, "");
  await env.KV.put("tiktok-estado", estado, { expirationTtl: 900 });
  return `https://www.tiktok.com/v2/auth/authorize/?client_key=${t.client_key}&scope=${ALCANCE}&response_type=code&redirect_uri=${encodeURIComponent(REGRESO)}&state=${estado}`;
}

/** Canjea el código que dejó la página de regreso y guarda la nueva conexión. */
export async function canjear(env: Env) {
  const r = (await (await fetch(WEB + "/tiktok/codigo", { headers: { "x-clave": env.CLAVE } })).json()) as { code?: string; state?: string };
  if (!r.code) return { ok: false, error: "No llegó la autorización de TikTok. Vuelve a intentarlo." };
  if (r.state !== (await env.KV.get("tiktok-estado"))) return { ok: false, error: "La autorización no corresponde a esta sesión." };
  const t = JSON.parse((await env.KV.get("tiktok-token"))!) as Token;
  const n = (await (await fetch(`${TT}/oauth/token/`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: t.client_key, client_secret: t.client_secret, code: r.code, grant_type: "authorization_code", redirect_uri: REGRESO }) })).json()) as Partial<Token> & { error_description?: string };
  if (!n.access_token) return { ok: false, error: n.error_description || "TikTok no entregó el permiso." };
  await env.KV.put("tiktok-token", JSON.stringify({ ...t, ...n, obtenido: Date.now() }));
  await env.KV.delete("tiktok-estado");
  await evento(env, "Cuenta de TikTok conectada desde el panel.", "info", "tiktok");
  return { ok: true };
}

/** Datos del creador que exige la pantalla de publicación (creator_info). */
export async function creador(env: Env) {
  const r = (await (await fetch(`${TT}/post/publish/creator_info/query/`, { method: "POST",
    headers: { Authorization: `Bearer ${await token(env)}`, "Content-Type": "application/json; charset=UTF-8" } })).json()) as
    { data?: { creator_avatar_url: string; creator_username: string; creator_nickname: string; privacy_level_options: string[]; comment_disabled: boolean; duet_disabled: boolean; stitch_disabled: boolean; max_video_post_duration_sec: number };
      error?: { code: string; message: string } };
  if (r.error && r.error.code !== "ok") return { error: r.error.code === "spam_risk_too_many_posts" ? "Tu cuenta llegó al límite de publicaciones por hoy. Inténtalo más tarde." : r.error.message };
  return r.data;
}

/** El creador aprueba una publicación con sus ajustes; el cron la publica a su hora. */
export async function aprobar(env: Env, id: string, b: { texto: string; privacidad: string } & OpcionesTT) {
  const p = await env.DB.prepare("SELECT p.*, v.duracion FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE p.id = ? AND p.red = 'tiktok'").bind(id).first<{ estado: string; duracion: number }>();
  if (!p) return { ok: false, error: "No existe esa publicación." };
  if (!["por-aprobar", "por-programar", "pendiente", "fallido"].includes(p.estado)) return { ok: false, error: "Esta publicación ya se envió." };
  const c = await creador(env);
  if (!c || "error" in c) return { ok: false, error: c?.error || "No se pudo leer tu cuenta de TikTok." };
  if (!c.privacy_level_options.includes(b.privacidad)) return { ok: false, error: "Elige quién puede ver el video." };
  if (b.patrocinado && b.privacidad === "SELF_ONLY") return { ok: false, error: "El contenido de marca no puede ser privado." };
  if (p.duracion > c.max_video_post_duration_sec) return { ok: false, error: `Tu cuenta permite videos de hasta ${c.max_video_post_duration_sec} s.` };
  const op: OpcionesTT = { comentarios: !!b.comentarios && !c.comment_disabled, duo: !!b.duo && !c.duet_disabled, stitch: !!b.stitch && !c.stitch_disabled, marca: !!b.marca, patrocinado: !!b.patrocinado };
  await env.DB.prepare("UPDATE publicaciones SET estado = 'pendiente', intentos = 0, error = NULL, texto = ?, privacidad = ?, opciones = ?, actualizado = datetime('now') WHERE id = ?")
    .bind(b.texto.slice(0, 2200), b.privacidad, JSON.stringify(op), id).run();
  await evento(env, `Aprobado para TikTok: ${id.replace(":tiktok", "")}`, "info", "tiktok");
  return { ok: true };
}
