// Relatos Autopilot: publicador en la nube.
// KV: "agenda" = lista de publicaciones; "tiktok-token" = tokens; "pausa" = interruptor global; "log" = últimos eventos.
// R2: archivos de video. Cada 5 min publica en TikTok lo que ya venció y revisa el estado de lo enviado.
interface Env { KV: KVNamespace; VIDEOS: R2Bucket; CLAVE: string }

type Pub = {
  id: string; red: "tiktok"; archivo: string; texto: string; cuando: string;
  estado: "pendiente" | "enviado" | "publicado" | "fallido"; publish_id?: string; privacidad?: string; error?: string; intentos?: number;
};
type Token = { client_key: string; client_secret: string; access_token: string; refresh_token: string; expires_in: number; obtenido: number };

const TT = "https://open.tiktokapis.com/v2";

async function registrar(env: Env, msg: string) {
  const log: string[] = JSON.parse((await env.KV.get("log")) || "[]");
  log.unshift(`${new Date().toISOString()} ${msg}`);
  await env.KV.put("log", JSON.stringify(log.slice(0, 200)));
}

async function tokenTikTok(env: Env): Promise<string> {
  const t = JSON.parse((await env.KV.get("tiktok-token"))!) as Token;
  if (Date.now() < t.obtenido + (t.expires_in - 900) * 1000) return t.access_token;
  const r = await fetch(`${TT}/oauth/token/`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: t.client_key, client_secret: t.client_secret, grant_type: "refresh_token", refresh_token: t.refresh_token }),
  });
  const n = (await r.json()) as Partial<Token>;
  if (!n.access_token) throw new Error("no se pudo renovar el token de TikTok: " + JSON.stringify(n).slice(0, 200));
  await env.KV.put("tiktok-token", JSON.stringify({ ...t, ...n, obtenido: Date.now() }));
  await registrar(env, "token de TikTok renovado");
  return n.access_token!;
}

async function publicarTikTok(env: Env, p: Pub) {
  const obj = await env.VIDEOS.get(p.archivo);
  if (!obj) throw new Error("no está el archivo " + p.archivo);
  const tok = await tokenTikTok(env);
  const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json; charset=UTF-8" };
  const iniciar = async (privacidad: string) => (await (await fetch(`${TT}/post/publish/video/init/`, { method: "POST", headers: H, body: JSON.stringify({
    post_info: { title: p.texto.slice(0, 2200), privacy_level: privacidad, disable_comment: false, disable_duet: false, disable_stitch: false, is_aigc: true },
    source_info: { source: "FILE_UPLOAD", video_size: obj.size, chunk_size: obj.size, total_chunk_count: 1 },
  }) })).json()) as { data?: { publish_id: string; upload_url: string }; error?: { code: string; message: string } };
  let privacidad = "PUBLIC_TO_EVERYONE";
  let ini = await iniciar(privacidad);
  if (ini.error?.code !== "ok") {
    await registrar(env, `${p.id}: TikTok no permitió público (${ini.error?.code}), se publica privado`);
    privacidad = "SELF_ONLY";
    ini = await iniciar(privacidad);
  }
  if (ini.error?.code !== "ok" || !ini.data) throw new Error(`init: ${ini.error?.code} ${ini.error?.message}`);
  const up = await fetch(ini.data.upload_url, {
    method: "PUT",
    headers: { "Content-Type": "video/mp4", "Content-Length": String(obj.size), "Content-Range": `bytes 0-${obj.size - 1}/${obj.size}` },
    body: obj.body,
  });
  if (!up.ok) throw new Error(`subida ${up.status}: ${(await up.text()).slice(0, 200)}`);
  p.estado = "enviado"; p.publish_id = ini.data.publish_id; p.privacidad = privacidad;
}

async function revisarTikTok(env: Env, p: Pub) {
  const tok = await tokenTikTok(env);
  const r = (await (await fetch(`${TT}/post/publish/status/fetch/`, { method: "POST",
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json; charset=UTF-8" }, body: JSON.stringify({ publish_id: p.publish_id }) })).json()) as { data?: { status: string; fail_reason?: string } };
  if (r.data?.status === "PUBLISH_COMPLETE") { p.estado = "publicado"; await registrar(env, `${p.id}: publicado en TikTok (${p.privacidad})`); }
  if (r.data?.status === "FAILED") { p.estado = "fallido"; p.error = r.data.fail_reason; await registrar(env, `${p.id}: TikTok rechazó: ${p.error}`); }
}

async function ciclo(env: Env) {
  if ((await env.KV.get("pausa")) === "1") return;
  const agenda: Pub[] = JSON.parse((await env.KV.get("agenda")) || "[]");
  const ahora = Date.now();
  let cambio = false;
  for (const p of agenda) {
    try {
      if (p.estado === "pendiente" && new Date(p.cuando).getTime() <= ahora) {
        // Marca antes de enviar para no duplicar si dos ciclos se cruzan.
        p.intentos = (p.intentos || 0) + 1;
        if (p.intentos > 3) { p.estado = "fallido"; p.error = p.error || "demasiados intentos"; cambio = true; continue; }
        await env.KV.put("agenda", JSON.stringify(agenda));
        await publicarTikTok(env, p);
        await registrar(env, `${p.id}: enviado a TikTok (${p.privacidad})`);
        cambio = true;
      } else if (p.estado === "enviado") {
        await revisarTikTok(env, p);
        cambio = true;
      }
    } catch (e) {
      p.error = String(e).slice(0, 300);
      await registrar(env, `${p.id}: ERROR ${p.error}`);
      cambio = true;
    }
  }
  if (cambio) await env.KV.put("agenda", JSON.stringify(agenda));
}

export default {
  async scheduled(_: ScheduledController, env: Env, ctx: ExecutionContext) { ctx.waitUntil(ciclo(env)); },
  async fetch(req: Request, env: Env) {
    if (req.headers.get("x-clave") !== env.CLAVE) return new Response("no", { status: 403 });
    const u = new URL(req.url);
    if (u.pathname === "/estado") return Response.json({ pausa: (await env.KV.get("pausa")) === "1", agenda: JSON.parse((await env.KV.get("agenda")) || "[]"), log: JSON.parse((await env.KV.get("log")) || "[]").slice(0, 30) });
    if (u.pathname === "/ciclo" && req.method === "POST") { await ciclo(env); return Response.json({ ok: true }); }
    return new Response("no", { status: 404 });
  },
};
