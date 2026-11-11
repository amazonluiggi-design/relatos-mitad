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
  const norm = (t: string) => (t || "").normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase().slice(0, 45);
  for (const p of pubs.filter((x) => x.estado === "publicado" || x.externo_id)) {
    let v = p.externo_id ? videos.find((x) => x.id === p.externo_id) : undefined;
    if (!v && p.texto) v = videos.find((x) => norm(x.video_description || x.title || "") === norm(p.texto!) && !pubs.some((q) => q.externo_id === x.id));
    if (!v) continue;
    if (p.externo_id !== v.id) await actualizar(env, p, { externo_id: v.id, url: v.share_url || `https://www.tiktok.com/@relatosdelamitad/video/${v.id}`, publicado_en: new Date(v.create_time * 1000).toISOString() });
    await guardarMetrica(env, p.id, { vistas: v.view_count, me_gusta: v.like_count, comentarios: v.comment_count, compartidos: v.share_count });
  }
}

/* ───────────── YouTube ───────────── */
export async function tokenYouTube(env: Env) {
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
        await alPublicarYouTube(env, H, p).catch((e) => evento(env, `Comentario/lista de ${p.video_id} no se pudo: ${String(e).slice(0, 150)}`, "aviso", "youtube"));
      } else if (v.status.privacyStatus === "private" && !v.status.publishAt && new Date(p.cuando).getTime() < Date.now() - 600000 && p.estado !== "privado") {
        await actualizar(env, p, { estado: "privado", error: "YouTube lo dejó privado (app sin auditoría)", url: `https://youtu.be/${v.id}` });
        await evento(env, `YouTube dejó en privado ${p.video_id}: la app aún no tiene la auditoría de Google.`, "aviso", "youtube");
      }
    }
  }
}

// Listas de reproducción por historia (los títulos deben coincidir con los creados por scripts/yt-listas.mjs).
const LISTAS_YT: Record<string, string[]> = {
  cantuna: ["Leyendas de Quito", "Tesoros perdidos de Ecuador"], llanganates: ["Tesoros perdidos de Ecuador"],
  "dama-tapada": ["Leyendas de Guayaquil y la Costa"], "padre-almeida": ["Leyendas de Quito"], "caja-ronca": ["Leyendas de Quito"],
  "isla-plata": ["Tesoros perdidos de Ecuador", "Leyendas de Guayaquil y la Costa"], "el-dorado": ["Tesoros perdidos de Ecuador"], tayos: ["Tesoros perdidos de Ecuador"],
};

/** Al salir un video en YouTube: si es Short, comentario del canal que lleva a la historia completa; y en todo caso, a sus listas. */
async function alPublicarYouTube(env: Env, H: Record<string, string>, p: Pub) {
  const API = "https://www.googleapis.com/youtube/v3/";
  const m = /^(.*)-(reel\d+|parte\d+|largo|episodio\d+)$/.exec(p.video_id);
  if (!m) return;
  const [, h, tipo] = m;
  if (/^(reel|parte)/.test(tipo)) {
    const largo = await env.DB.prepare("SELECT externo_id, estado, cuando FROM publicaciones WHERE id = ?").bind(`${h}-largo:youtube`).first<{ externo_id: string | null; estado: string; cuando: string }>();
    let texto = "";
    if (largo?.externo_id && largo.estado === "publicado") texto = `🕯️ La historia completa de esta leyenda está aquí 👉 https://youtu.be/${largo.externo_id}
¿La conocías? Cuéntame en los comentarios 👇`;
    else if (largo && new Date(largo.cuando).getTime() > Date.now()) {
      const dia = new Date(largo.cuando).toLocaleDateString("es-EC", { timeZone: "America/Guayaquil", weekday: "long", day: "numeric", month: "long" });
      texto = `🕯️ La historia completa se estrena el ${dia} a las 19:00 en el canal. Suscríbete para no perdértela. ¿Tú qué crees que pasó? 👇`;
    }
    if (texto) {
      const r = await fetch(API + "commentThreads?part=snippet", { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ snippet: { videoId: p.externo_id, topLevelComment: { snippet: { textOriginal: texto } } } }) });
      if (!r.ok) throw new Error("comentario " + r.status + " " + (await r.text()).slice(0, 120));
    }
  }
  // Listas: la temática de la historia, y "Historias completas" para el largo.
  const titulos = [...(LISTAS_YT[h] || []), ...(tipo === "largo" ? ["Historias completas"] : [])];
  if (!titulos.length) return;
  let listas = JSON.parse((await env.KV.get("yt-listas")) || "null") as Record<string, string> | null;
  if (!listas) {
    const r = (await (await fetch(API + "playlists?part=snippet&mine=true&maxResults=50", { headers: H })).json()) as { items?: { id: string; snippet: { title: string } }[] };
    listas = Object.fromEntries((r.items || []).map((x) => [x.snippet.title, x.id]));
    await env.KV.put("yt-listas", JSON.stringify(listas), { expirationTtl: 7 * 86400 });
  }
  for (const t of titulos) {
    if (!listas[t]) continue;
    await fetch(API + "playlistItems?part=snippet", { method: "POST", headers: { ...H, "Content-Type": "application/json" }, body: JSON.stringify({ snippet: { playlistId: listas[t], resourceId: { kind: "youtube#video", videoId: p.externo_id } } }) });
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

/** Historia diaria de la página de Facebook: entre 20:15 y 20:40 (Ecuador) sube como historia el último reel publicado
 *  en las 12 horas anteriores. Las historias salen arriba para los seguidores, que casi no ven los reels. Una por día. */
export async function historiaFacebook(env: Env, ahora = new Date()) {
  const ec = new Date(ahora.getTime() - 5 * 3600e3), min = ec.getUTCHours() * 60 + ec.getUTCMinutes();
  if (min < 20 * 60 + 15 || min > 20 * 60 + 40) return;
  const clave = `fb-historia-${ec.toISOString().slice(0, 10)}`;
  if (await env.KV.get(clave)) return;
  const desde = new Date(ahora.getTime() - 12 * 3600e3).toISOString();
  const p = await env.DB.prepare(`SELECT video_id FROM publicaciones WHERE red = 'facebook' AND estado = 'publicado' AND video_id LIKE '%-reel%'
      AND cuando >= ? AND cuando <= ? ORDER BY cuando DESC LIMIT 1`).bind(desde, ahora.toISOString()).first<{ video_id: string }>();
  if (!p) { await env.KV.put(clave, "sin reel", { expirationTtl: 3 * 86400 }); return; }
  const m = /^(.*)-(reel\d+)$/.exec(p.video_id);
  const obj = m ? await env.VIDEOS.get(`${m[1]}/${m[2]}.mp4`) : null;
  if (!obj) { await evento(env, `Historia de Facebook: no encontré el video de ${p.video_id}`, "aviso", "facebook"); await env.KV.put(clave, "sin video", { expirationTtl: 3 * 86400 }); return; }
  const G = "https://graph.facebook.com/v23.0";
  try {
    const ini = (await (await fetch(`${G}/${env.FB_PAGINA}/video_stories`, { method: "POST", body: new URLSearchParams({ upload_phase: "start", access_token: env.FB_TOKEN }) })).json()) as { video_id?: string; upload_url?: string; error?: { message: string } };
    if (!ini.video_id || !ini.upload_url) throw new Error(ini.error?.message || "sin video_id");
    const datos = await obj.arrayBuffer();
    const up = (await (await fetch(ini.upload_url, { method: "POST", headers: { Authorization: `OAuth ${env.FB_TOKEN}`, offset: "0", file_size: String(datos.byteLength) }, body: datos })).json()) as { success?: boolean };
    if (!up.success) throw new Error("subida rechazada");
    const fin = (await (await fetch(`${G}/${env.FB_PAGINA}/video_stories`, { method: "POST", body: new URLSearchParams({ upload_phase: "finish", video_id: ini.video_id, access_token: env.FB_TOKEN }) })).json()) as { success?: boolean; post_id?: string; error?: { message: string } };
    if (!fin.success) throw new Error(fin.error?.message || "no terminó");
    await env.KV.put(clave, p.video_id, { expirationTtl: 3 * 86400 });
    await evento(env, `Historia de Facebook publicada: ${p.video_id}`, "info", "facebook");
  } catch (e) {
    await evento(env, `Historia de Facebook falló (${p.video_id}): ${String(e).slice(0, 200)}`, "error", "facebook");
    await env.KV.put(clave, "error", { expirationTtl: 3 * 86400 });
  }
}

/** Comentarios de YouTube y Facebook que el canal todavía no respondió (para el panel; caché de 10 minutos). */
export async function comentariosPendientes(env: Env) {
  const cache = await env.KV.get("comentarios-pendientes");
  if (cache) return JSON.parse(cache);
  const lista: { red: string; autor: string; texto: string; video: string; url: string; cuando: string }[] = [];
  try {
    const H = { Authorization: `Bearer ${await tokenYouTube(env)}` };
    const canal = "UCrMRLR-yxvwDd4DM10WPkQg";
    const r = (await (await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&allThreadsRelatedToChannelId=${canal}&maxResults=50`, { headers: H })).json()) as
      { items?: { id: string; snippet: { videoId: string; topLevelComment: { snippet: { authorDisplayName: string; authorChannelId?: { value: string }; textOriginal: string; publishedAt: string } } }; replies?: { comments: { snippet: { authorChannelId?: { value: string } } }[] } }[] };
    for (const t of r.items || []) {
      const c = t.snippet.topLevelComment.snippet;
      if (c.authorChannelId?.value === canal) continue;
      if ((t.replies?.comments || []).some((x) => x.snippet.authorChannelId?.value === canal)) continue;
      const v = await env.DB.prepare("SELECT v.titulo FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE p.red = 'youtube' AND p.externo_id = ?").bind(t.snippet.videoId).first<{ titulo: string }>();
      lista.push({ red: "youtube", autor: c.authorDisplayName, texto: c.textOriginal, video: v?.titulo || t.snippet.videoId, url: `https://www.youtube.com/watch?v=${t.snippet.videoId}&lc=${t.id}`, cuando: c.publishedAt });
    }
  } catch { /* sin conexión con YouTube: se muestra lo de Facebook */ }
  const fb = (await env.DB.prepare(`SELECT p.externo_id, v.titulo, p.url FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE p.red = 'facebook' AND p.estado = 'publicado' AND p.externo_id IS NOT NULL
      AND p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-30 days')`).all<{ externo_id: string; titulo: string; url: string | null }>()).results;
  for (const p of fb) {
    const r = (await (await fetch(`${G}/${p.externo_id}/comments?fields=id,from,message,created_time,comments{from}&limit=50&access_token=${env.FB_TOKEN}`)).json()) as
      { data?: { id: string; from?: { id: string; name: string }; message?: string; created_time: string; comments?: { data: { from?: { id: string } }[] } }[] };
    for (const c of r.data || []) {
      if (c.from?.id === env.FB_PAGINA) continue;
      if ((c.comments?.data || []).some((x) => x.from?.id === env.FB_PAGINA)) continue;
      lista.push({ red: "facebook", autor: c.from?.name || "Alguien", texto: c.message || "", video: p.titulo, url: p.url || `https://www.facebook.com/${p.externo_id}`, cuando: c.created_time });
    }
  }
  lista.sort((a, b) => b.cuando.localeCompare(a.cuando));
  await env.KV.put("comentarios-pendientes", JSON.stringify(lista), { expirationTtl: 600 });
  return lista;
}

/* ───────────── Tendencias (lo que está de moda afuera) ───────────── */
// Búsquedas del nicho en YouTube: UNA por día, rotando (search.list cuesta 100 de las 10.000 unidades diarias que también usan las subidas).
const BUSQUEDAS = ["tesoro perdido leyenda", "leyendas de Ecuador", "misterios sin resolver historia", "oro de los incas tesoro", "leyendas latinoamérica shorts", "tesoros perdidos shorts", "historia real misterio colonial"];
type Tendencias = { dia: string; google_ecuador: { tema: string; busquedas: string }[]; youtube_nicho: Record<string, { dia: string; videos: unknown[] }>; errores: string[] };

/** Temas de Google Trends (RSS público). Exportada aparte para probarla con un RSS de ejemplo. */
export const temasGoogle = (rss: string) => [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => ({
  tema: (/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/.exec(m[1])?.[1] || "").trim().slice(0, 80),
  busquedas: (/<ht:approx_traffic>([^<]*)</.exec(m[1])?.[1] || "").trim() })).filter((i) => i.tema).slice(0, 20);

/** Qué busca hoy la gente en Ecuador (Google Trends) y qué videos del nicho arrasaron en YouTube en los últimos 30 días.
 *  Se consulta como mucho una vez al día y se guarda; si una fuente falla, queda lo último guardado y el error a la vista. */
export async function tendencias(env: Env): Promise<Tendencias> {
  const hoy = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  const g: Tendencias = JSON.parse((await env.KV.get("tendencias")) || "null") || { dia: "", google_ecuador: [], youtube_nicho: {}, errores: [] };
  if (g.dia === hoy) return g;
  g.dia = hoy; g.errores = [];
  await env.KV.put("tendencias", JSON.stringify(g)); // marca primero: dos pedidos a la vez no gastan la cuota dos veces
  try {
    const items = temasGoogle(await (await fetch("https://trends.google.com/trending/rss?geo=EC", { headers: { "User-Agent": "Mozilla/5.0" } })).text());
    if (items.length) g.google_ecuador = items; else g.errores.push("Google Trends no devolvió temas hoy");
  } catch (e) { g.errores.push(`Google Trends: ${String(e).slice(0, 100)}`); }
  try {
    const q = BUSQUEDAS[Math.floor(Date.now() / 86400e3) % BUSQUEDAS.length];
    const H = { Authorization: `Bearer ${await tokenYouTube(env)}` };
    const YT = "https://www.googleapis.com/youtube/v3";
    const s = (await (await fetch(`${YT}/search?part=snippet&type=video&order=viewCount&maxResults=15&relevanceLanguage=es&publishedAfter=${new Date(Date.now() - 30 * 86400e3).toISOString()}&q=${encodeURIComponent(q)}`, { headers: H })).json()) as
      { items?: { id: { videoId: string } }[]; error?: { message: string } };
    if (s.error) throw new Error(s.error.message);
    const ids = (s.items || []).map((i) => i.id.videoId).filter(Boolean);
    const v = ids.length ? (await (await fetch(`${YT}/videos?part=snippet,statistics,contentDetails&id=${ids.join(",")}`, { headers: H })).json()) as
      { items?: { id: string; snippet: { title: string; channelTitle: string; publishedAt: string }; statistics: { viewCount?: string; likeCount?: string; commentCount?: string }; contentDetails: { duration: string } }[] } : { items: [] };
    g.youtube_nicho[q] = { dia: hoy, videos: (v.items || []).map((i) => ({ titulo: i.snippet.title.slice(0, 110), canal: i.snippet.channelTitle, publicado: i.snippet.publishedAt.slice(0, 10),
      vistas: +(i.statistics.viewCount || 0), me_gusta: +(i.statistics.likeCount || 0), comentarios: +(i.statistics.commentCount || 0), duracion: i.contentDetails.duration.replace("PT", "").toLowerCase(), url: `https://youtu.be/${i.id}` }))
      .sort((a, b) => b.vistas - a.vistas).slice(0, 10) };
    // Se conservan las búsquedas de los últimos 8 días (una vuelta completa de la rotación).
    const limite = new Date(Date.now() - 8 * 86400e3).toISOString().slice(0, 10);
    for (const k of Object.keys(g.youtube_nicho)) if (g.youtube_nicho[k].dia < limite) delete g.youtube_nicho[k];
  } catch (e) { g.errores.push(`YouTube: ${String(e).slice(0, 120)}`); }
  await env.KV.put("tendencias", JSON.stringify(g));
  return g;
}

/** Solo seguidores de las 3 redes (una consulta por red, ~2 s), para el botón "Actualizar ahora".
 *  Conserva las vistas y videos ya guardados de esa hora (las métricas por video siguen en el ciclo de 15 min). */
export async function actualizarSeguidores(env: Env) {
  const previo = async (red: string) => env.DB.prepare("SELECT vistas_totales, videos FROM cuentas_hist WHERE red = ? ORDER BY momento DESC LIMIT 1").bind(red).first<{ vistas_totales: number | null; videos: number | null }>();
  const tareas: Record<string, () => Promise<void>> = {
    youtube: async () => {
      const c = (await (await fetch("https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true", { headers: { Authorization: `Bearer ${await tokenYouTube(env)}` } })).json()) as { items?: { statistics: { subscriberCount: string; viewCount: string; videoCount: string } }[] };
      const s = c.items?.[0]?.statistics;
      if (s) await guardarCuenta(env, "youtube", +s.subscriberCount, +s.viewCount, +s.videoCount);
    },
    facebook: async () => {
      const p = (await (await fetch(`${G}/${env.FB_PAGINA}?fields=followers_count&access_token=${env.FB_TOKEN}`)).json()) as { followers_count?: number };
      const v = await previo("facebook");
      if (p.followers_count != null) await guardarCuenta(env, "facebook", p.followers_count, v?.vistas_totales ?? null, v?.videos ?? null);
    },
    tiktok: async () => {
      const r = (await (await fetch(`${TT}/user/info/?fields=follower_count,video_count`, { headers: { Authorization: `Bearer ${await tokenTikTok(env)}` } })).json()) as { data?: { user?: { follower_count?: number; video_count?: number } } };
      const u = r.data?.user, v = await previo("tiktok");
      if (u?.follower_count != null) await guardarCuenta(env, "tiktok", u.follower_count, v?.vistas_totales ?? null, u.video_count ?? v?.videos ?? null);
    },
  };
  const res = await Promise.allSettled(Object.values(tareas).map((f) => f()));
  return Object.fromEntries(Object.keys(tareas).map((k, i) => [k, res[i].status === "fulfilled" ? "ok" : String((res[i] as PromiseRejectedResult).reason).slice(0, 120)]));
}
