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
  const iniciar = async (privacidad: string) => (await (await fetch(`${TT}/post/publish/video/init/`, { method: "POST", headers: H, body: JSON.stringify({
    post_info: { title: (p.texto || "").slice(0, 2200), privacy_level: privacidad, disable_comment: false, disable_duet: false, disable_stitch: false, is_aigc: true },
    source_info: { source: "FILE_UPLOAD", video_size: obj.size, chunk_size: tamTrozo, total_chunk_count: trozos },
  }) })).json()) as { data?: { publish_id: string; upload_url: string }; error?: { code: string; message: string } };
  let privacidad = "PUBLIC_TO_EVERYONE";
  let ini = await iniciar(privacidad);
  if (ini.error?.code !== "ok") {
    await evento(env, `TikTok no permitió publicar en público (${ini.error?.code}); se publica en privado hasta que aprueben la app.`, "aviso", "tiktok");
    privacidad = "SELF_ONLY";
    ini = await iniciar(privacidad);
  }
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
  const r = (await (await fetch(`${TT}/user/info/?fields=follower_count,video_count,likes_count`, { headers: { Authorization: `Bearer ${tok}` } })).json()) as
    { data?: { user?: { follower_count?: number; video_count?: number } }; error?: { code: string } };
  const u = r.data?.user;
  if (u?.follower_count !== undefined) await guardarCuenta(env, "tiktok", u.follower_count, null, u.video_count ?? null);
  // Vistas por video (permiso video.list). Se cruzan por el id del post guardado en la URL.
  const conId = pubs.map((p) => ({ p, id: /\/video\/(\d+)/.exec(p.url || "")?.[1] })).filter((x) => x.id);
  if (!conId.length) return;
  const l = (await (await fetch(`${TT}/video/query/?fields=id,view_count,like_count,comment_count,share_count`, {
    method: "POST", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" },
    body: JSON.stringify({ filters: { video_ids: conId.slice(0, 20).map((x) => x.id) } }),
  })).json()) as { data?: { videos?: { id: string; view_count: number; like_count: number; comment_count: number; share_count: number }[] } };
  for (const v of l.data?.videos || []) {
    const p = conId.find((x) => x.id === v.id)?.p;
    if (p) await guardarMetrica(env, p.id, { vistas: v.view_count, me_gusta: v.like_count, comentarios: v.comment_count, compartidos: v.share_count });
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
    // Vistas: requiere el permiso read_insights; si falta se avisa una sola vez.
    const ins = (await (await fetch(`${G}/${p.externo_id}/video_insights?metric=total_video_views,total_video_reactions_by_type_total&access_token=${env.FB_TOKEN}`)).json()) as
      { data?: { name: string; values: { value: number | Record<string, number> }[] }[]; error?: { message: string } };
    if (ins.error) {
      if (!(await env.KV.get("fb-aviso-insights"))) {
        await env.KV.put("fb-aviso-insights", "1", { expirationTtl: 86400 * 7 });
        await evento(env, "Para ver las vistas de Facebook falta el permiso read_insights en la app de Meta.", "aviso", "facebook");
      }
      continue;
    }
    const val = (n: string) => ins.data?.find((d) => d.name === n)?.values?.[0]?.value;
    const reac = val("total_video_reactions_by_type_total");
    await guardarMetrica(env, p.id, { vistas: (val("total_video_views") as number) ?? null, me_gusta: reac && typeof reac === "object" ? Object.values(reac).reduce((a, b) => a + b, 0) : null });
  }
}
