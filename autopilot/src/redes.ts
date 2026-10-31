// Conexiones oficiales: TikTok (publicar + estado), YouTube y Facebook (estado + estadísticas).
import { type Env, type Pub, evento, guardarCuenta, guardarMetrica } from "./tipos";

const ahoraIso = () => new Date().toISOString();
async function actualizar(env: Env, p: Pub, cambios: Partial<Pub>) {
  const campos = Object.keys(cambios);
  if (!campos.length) return;
  await env.DB.prepare(`UPDATE publicaciones SET ${campos.map((c) => `${c} = ?`).join(", ")}, actualizado = datetime('now') WHERE id = ?`)
    .bind(...campos.map((c) => (cambios as Record<string, unknown>)[c] ?? null), p.id).run();
  Object.assign(p, cambios);
}

/* ───────────── TikTok ───────────── */
const TT = "https://open.tiktokapis.com/v2";
type TokenTT = { client_key: string; client_secret: string; access_token: string; refresh_token: string; expires_in: number; obtenido: number };

async function tokenTikTok(env: Env) {
  const t = JSON.parse((await env.KV.get("tiktok-token"))!) as TokenTT;
  if (Date.now() < t.obtenido + (t.expires_in - 900) * 1000) return t.access_token;
  const n = (await (await fetch(`${TT}/oauth/token/`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_key: t.client_key, client_secret: t.client_secret, grant_type: "refresh_token", refresh_token: t.refresh_token }),
  })).json()) as Partial<TokenTT>;
  if (!n.access_token) {
    await evento(env, "No se pudo renovar la conexión con TikTok. Hay que volver a autorizar.", "error", "tiktok");
    throw new Error("token TikTok");
  }
  await env.KV.put("tiktok-token", JSON.stringify({ ...t, ...n, obtenido: Date.now() }));
  return n.access_token!;
}

export async function publicarTikTok(env: Env, p: Pub, archivo: string) {
  const obj = await env.VIDEOS.head(archivo);
  if (!obj) throw new Error("falta el archivo " + archivo);
  // TikTok: trozos de 5 a 64 MB; el último absorbe el resto (hasta 128 MB).
  const TROZO = 32 * 1024 * 1024;
  const trozos = obj.size <= 64 * 1024 * 1024 ? 1 : Math.floor(obj.size / TROZO);
  const tamTrozo = trozos === 1 ? obj.size : TROZO;
  const tok = await tokenTikTok(env);
  const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json; charset=UTF-8" };
  // Ajustes que el creador eligió al aprobar el video en el panel (sin valores por defecto impuestos).
  const op = JSON.parse(p.opciones || "{}") as { comentarios?: boolean; duo?: boolean; stitch?: boolean; marca?: boolean; patrocinado?: boolean };
  if (!p.privacidad) throw new Error("falta la aprobación del creador");
  const privacidad = p.privacidad;
  const ini = (await (await fetch(`${TT}/post/publish/video/init/`, { method: "POST", headers: H, body: JSON.stringify({
    post_info: { title: (p.texto || "").slice(0, 2200), privacy_level: privacidad, disable_comment: !op.comentarios, disable_duet: !op.duo, disable_stitch: !op.stitch,
      brand_content_toggle: !!op.patrocinado, brand_organic_toggle: !!op.marca, is_aigc: true },
    source_info: { source: "FILE_UPLOAD", video_size: obj.size, chunk_size: tamTrozo, total_chunk_count: trozos },
  }) })).json()) as { data?: { publish_id: string; upload_url: string }; error?: { code: string; message: string } };
  if (ini.error?.code !== "ok" || !ini.data) throw new Error(`init ${ini.error?.code}: ${ini.error?.message}`);
  for (let i = 0; i < trozos; i++) {
    const ini0 = i * tamTrozo;
    const fin = i === trozos - 1 ? obj.size - 1 : ini0 + tamTrozo - 1;
    const parte = await env.VIDEOS.get(archivo, { range: { offset: ini0, length: fin - ini0 + 1 } });
    const up = await fetch(ini.data.upload_url, {
      method: "PUT",
      headers: { "Content-Type": "video/mp4", "Content-Length": String(fin - ini0 + 1), "Content-Range": `bytes ${ini0}-${fin}/${obj.size}` },
      body: parte!.body,
    });
    if (!up.ok) throw new Error(`subida trozo ${i + 1}/${trozos} ${up.status}: ${(await up.text()).slice(0, 200)}`);
  }
  await actualizar(env, p, { estado: "enviado", externo_id: ini.data.publish_id, privacidad });
  await evento(env, `Reel enviado a TikTok (${privacidad === "SELF_ONLY" ? "privado" : "público"}): ${p.video_id}`, "info", "tiktok");
}

export async function revisarTikTok(env: Env, p: Pub) {
  const tok = await tokenTikTok(env);
  const r = (await (await fetch(`${TT}/post/publish/status/fetch/`, { method: "POST",
    headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json; charset=UTF-8" }, body: JSON.stringify({ publish_id: p.externo_id }) })).json()) as
    { data?: { status: string; fail_reason?: string; publicaly_available_post_id?: string[] } };
  const s = r.data?.status;
  if (s === "PUBLISH_COMPLETE") {
    const postId = r.data?.publicaly_available_post_id?.[0];
    await actualizar(env, p, {
      estado: p.privacidad === "SELF_ONLY" ? "privado" : "publicado", publicado_en: ahoraIso(),
      url: postId ? `https://www.tiktok.com/@relatosdelamitad/video/${postId}` : "https://www.tiktok.com/@relatosdelamitad",
    });
    await evento(env, `Publicado en TikTok: ${p.video_id}`, "info", "tiktok");
  } else if (s === "FAILED") {
    await actualizar(env, p, { estado: "fallido", error: r.data?.fail_reason || "falló" });
    await evento(env, `TikTok rechazó ${p.video_id}: ${r.data?.fail_reason}`, "error", "tiktok");
  }
}

export async function sincronizarTikTok(env: Env, pubs: Pub[]) {
  const tok = await tokenTikTok(env);
  const H = { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" };
  const r = (await (await fetch(`${TT}/user/info/?fields=follower_count,video_count,likes_count`, { headers: H })).json()) as
    { data?: { user?: { follower_count?: number; video_count?: number; likes_count?: number } } };
  const u = r.data?.user;
  // Lista de videos de la cuenta (permiso video.list): incluye los programados en TikTok Studio.
  type V = { id: string; video_description?: string; title?: string; create_time: number; view_count: number; like_count: number; comment_count: number; share_count: number; share_url?: string };
  const videos: V[] = [];
  let cursor: number | undefined;
  for (let i = 0; i < 5; i++) {
    const l = (await (await fetch(`${TT}/video/list/?fields=id,title,video_description,create_time,view_count,like_count,comment_count,share_count,share_url`, {
      method: "POST", headers: H, body: JSON.stringify({ max_count: 20, ...(cursor ? { cursor } : {}) }),
    })).json()) as { data?: { videos?: V[]; cursor?: number; has_more?: boolean }; error?: { code: string; message: string } };
    if (l.error && l.error.code !== "ok") throw new Error(`video/list: ${l.error.code} ${l.error.message}`);
    videos.push(...(l.data?.videos || []));
    if (!l.data?.has_more) break;
    cursor = l.data.cursor;
  }
  const vistasTotales = videos.reduce((a, v) => a + (v.view_count || 0), 0);
  if (u?.follower_count !== undefined) await guardarCuenta(env, "tiktok", u.follower_count, vistasTotales, u.video_count ?? videos.length);
  // Une cada publicación con su video por el inicio del texto (los de TikTok Studio no traen id).
  const norm = (t: string) => (t || "").normalize("NFKD").replace(/[^p{L}p{N}]+/gu, " ").trim().toLowerCase().slice(0, 45);
  for (const p of pubs.filter((x) => x.estado === "publicado" || x.externo_id)) {
    let v = p.externo_id ? videos.find((x) => x.id === p.externo_id) : undefined;
    if (!v && p.texto) v = videos.find((x) => norm(x.video_description || x.title || "") === norm(p.texto!) && !pubs.some((q) => q.externo_id === x.id));
    if (!v) continue;
    if (p.externo_id !== v.id) await actualizar(env, p, { externo_id: v.id, url: v.share_url || `https://www.tiktok.com/@relatosdelamitad/video/${v.id}`, publicado_en: new Date(v.create_time * 1000).toISOString() });
    await guardarMetrica(env, p.id, { vistas: v.view_count, me_gusta: v.like_count, comentarios: v.comment_count, compartidos: v.share_count });
  }
}

/* ───────────── YouTube ───────────── */
async function tokenYouTube(env: Env) {
  const cache = await env.KV.get("yt-access");
  if (cache) return cache;
  const refresh = await env.KV.get("yt-refresh");
  const r = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST",
    body: new URLSearchParams({ client_id: env.YT_CLIENTE, client_secret: env.YT_SECRETO, refresh_token: refresh || "", grant_type: "refresh_token" }) })).json()) as
    { access_token?: string; expires_in?: number; error?: string };
  if (!r.access_token) {
    await evento(env, `La conexión con YouTube caducó (${r.error}). Hay que volver a autorizar.`, "error", "youtube");
    throw new Error("token YouTube");
  }
  await env.KV.put("yt-access", r.access_token, { expirationTtl: Math.max(60, (r.expires_in || 3600) - 300) });
  return r.access_token;
}

export async function sincronizarYouTube(env: Env, pubs: Pub[]) {
  const H = { Authorization: `Bearer ${await tokenYouTube(env)}` };
  const canal = (await (await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", { headers: H })).json()) as
    { items?: { statistics: { subscriberCount: string; viewCount: string; videoCount: string } }[] };
  const st = canal.items?.[0]?.statistics;
  if (st) await guardarCuenta(env, "youtube", +st.subscriberCount, +st.viewCount, +st.videoCount);
  const ids = pubs.filter((p) => p.externo_id).map((p) => p.externo_id);
  for (let i = 0; i < ids.length; i += 50) {
    const r = (await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,status&id=${ids.slice(i, i + 50).join(",")}`, { headers: H })).json()) as
      { items?: { id: string; status: { privacyStatus: string; uploadStatus: string; publishAt?: string; rejectionReason?: string }; statistics: Record<string, string> }[] };
    for (const v of r.items || []) {
      const p = pubs.find((x) => x.externo_id === v.id)!;
      const s = v.statistics;
      await guardarMetrica(env, p.id, { vistas: +s.viewCount || 0, me_gusta: +s.likeCount || 0, comentarios: +s.commentCount || 0 });
      if (v.status.privacyStatus === "public" && p.estado !== "publicado") {
        await actualizar(env, p, { estado: "publicado", publicado_en: ahoraIso(), url: `https://youtu.be/${v.id}` });
        await evento(env, `Publicado en YouTube: ${p.video_id}`, "info", "youtube");
      } else if (v.status.privacyStatus === "private" && !v.status.publishAt && new Date(p.cuando).getTime() < Date.now() - 600000 && p.estado !== "privado") {
        await actualizar(env, p, { estado: "privado", error: "YouTube lo dejó privado (app sin auditoría)", url: `https://youtu.be/${v.id}` });
        await evento(env, `YouTube dejó en privado ${p.video_id}: la app aún no tiene la auditoría de Google.`, "aviso", "youtube");
      }
    }
  }
}

/* ───────────── Facebook ───────────── */
const G = "https://graph.facebook.com/v23.0";

export async function sincronizarFacebook(env: Env, pubs: Pub[]) {
  const pg = (await (await fetch(`${G}/${env.FB_PAGINA}?fields=followers_count,fan_count&access_token=${env.FB_TOKEN}`)).json()) as { followers_count?: number; error?: { message: string } };
  if (pg.error) { await evento(env, `Facebook: ${pg.error.message}`, "error", "facebook"); return; }
  await guardarCuenta(env, "facebook", pg.followers_count ?? null, null, null);
  for (const p of pubs.filter((x) => x.externo_id)) {
    const v = (await (await fetch(`${G}/${p.externo_id}?fields=published,permalink_url,status&access_token=${env.FB_TOKEN}`)).json()) as
      { published?: boolean; permalink_url?: string; status?: { video_status?: string }; error?: { message: string } };
    if (v.error) continue;
    if (v.published && p.estado !== "publicado") {
      await actualizar(env, p, { estado: "publicado", publicado_en: ahoraIso(), url: v.permalink_url ? `https://www.facebook.com${v.permalink_url}` : null });
      await evento(env, `Publicado en Facebook: ${p.video_id}`, "info", "facebook");
    }
    if (v.status?.video_status === "error" && p.estado !== "fallido") {
      await actualizar(env, p, { estado: "fallido", error: "Facebook no pudo procesar el video" });
      await evento(env, `Facebook no pudo procesar ${p.video_id}`, "error", "facebook");
    }
    if (!v.published) continue;
    // Reels: "views" del video + reproducciones y tiempo medio de visualización (permiso read_insights).
    const d = (await (await fetch(`${G}/${p.externo_id}?fields=views,likes.summary(true).limit(0),comments.summary(true).limit(0)&access_token=${env.FB_TOKEN}`)).json()) as
      { views?: number; likes?: { summary?: { total_count: number } }; comments?: { summary?: { total_count: number } } };
    const ins = (await (await fetch(`${G}/${p.externo_id}/video_insights?metric=fb_reels_total_plays,post_video_avg_time_watched,fb_reels_replay_count&access_token=${env.FB_TOKEN}`)).json()) as
      { data?: { name: string; values: { value: number }[] }[] };
    const val = (n: string) => ins.data?.find((x) => x.name === n)?.values?.[0]?.value;
    const vistas = Math.max(d.views ?? 0, val("fb_reels_total_plays") ?? 0);
    await guardarMetrica(env, p.id, { vistas, me_gusta: d.likes?.summary?.total_count ?? null, comentarios: d.comments?.summary?.total_count ?? null,
      extra: { seg_medio: val("post_video_avg_time_watched") != null ? Math.round(val("post_video_avg_time_watched")! / 100) / 10 : null, repeticiones: val("fb_reels_replay_count") ?? null } });
  }
}
