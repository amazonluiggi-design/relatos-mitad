// ANDY — investigación de la página de Facebook (SOLO LECTURA, API Graph oficial).
// Junta: datos de la página, métricas de página disponibles, historial completo de publicaciones (qué audiencia se formó),
// y rendimiento de nuestros videos. Las métricas que Meta ya no entrega se anotan como "no disponible".
// Uso: node scripts/diagnostico-fb.mjs  → informes/fb-diagnostico-<fecha>.json
import fs from "node:fs";
import os from "node:os";
const { id: PAGE, token: T } = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/facebook-pagina.json", "utf8"));
const G = "https://graph.facebook.com/v23.0";
const get = async (ruta, params = {}) => {
  const u = new URL(G + ruta); u.searchParams.set("access_token", T);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const r = await fetch(u); const j = await r.json();
  return j.error ? { error: j.error.message } : j;
};
const salida = { generado: new Date().toISOString(), pagina: {}, metricas_pagina: {}, no_disponibles: [], historial: {}, videos: [] };

// 1) La página.
const campos = ["name", "category", "followers_count", "fan_count", "link", "about", "description", "verification_status", "is_published", "has_transitioned_to_new_page_experience", "were_here_count", "talking_about_count", "username", "website"];
for (const c of campos) { const r = await get(`/${PAGE}`, { fields: c }); if (r.error) salida.no_disponibles.push(`pagina.${c}: ${r.error.slice(0, 80)}`); else Object.assign(salida.pagina, r); }

// 2) Métricas de página (Meta retiró muchas en 2025; se prueba cada una por separado).
const metricas = ["page_follows", "page_daily_follows", "page_daily_follows_unique", "page_daily_unfollows_unique", "page_impressions_unique", "page_impressions", "page_posts_impressions_unique", "page_media_view", "page_views_total", "page_video_views", "page_video_views_organic", "page_video_complete_views_30s", "page_post_engagements", "page_total_actions", "page_fans_country", "page_fans_city", "page_fans_gender_age", "page_fan_adds_unique", "page_fan_removes_unique"];
const hasta = Math.floor(Date.now() / 1000), desde = hasta - 89 * 86400;
for (const m of metricas) {
  const r = await get(`/${PAGE}/insights`, { metric: m, period: "day", since: String(desde), until: String(hasta) });
  if (r.error || !r.data?.length) { salida.no_disponibles.push(`${m}: ${(r.error || "sin datos").slice(0, 90)}`); continue; }
  const valores = r.data[0].values.map((v) => ({ dia: v.end_time.slice(0, 10), valor: v.value }));
  const num = valores.filter((v) => typeof v.valor === "number");
  salida.metricas_pagina[m] = {
    ultimo_7: num.slice(-7).reduce((a, v) => a + v.valor, 0), ultimo_28: num.slice(-28).reduce((a, v) => a + v.valor, 0), ultimo_90: num.reduce((a, v) => a + v.valor, 0),
    serie: num.length ? valores.slice(-90) : valores.slice(-1), // los desgloses (país, edad) solo el último valor
  };
}

// 3) Historial de publicaciones (todas): qué publicaba la página antes y cuánto respondía su audiencia.
const posts = [];
let url = `/${PAGE}/posts`, params = { fields: "created_time,message,status_type,permalink_url,shares,reactions.summary(true).limit(0),comments.summary(true).limit(0)", limit: "100" };
for (let i = 0; i < 60; i++) {
  const r = await get(url, params);
  if (r.error) { salida.no_disponibles.push(`posts: ${r.error.slice(0, 90)}`); break; }
  posts.push(...r.data);
  if (!r.paging?.next) break;
  const n = new URL(r.paging.next); url = n.pathname.replace(/^\/v[\d.]+/, ""); params = Object.fromEntries(n.searchParams); delete params.access_token;
}
const porAnio = {};
for (const p of posts) {
  const a = p.created_time.slice(0, 4);
  const x = (porAnio[a] ??= { publicaciones: 0, reacciones: 0, comentarios: 0, compartidos: 0, tipos: {}, ejemplos: [] });
  x.publicaciones++; x.reacciones += p.reactions?.summary?.total_count || 0; x.comentarios += p.comments?.summary?.total_count || 0; x.compartidos += p.shares?.count || 0;
  x.tipos[p.status_type || "?"] = (x.tipos[p.status_type || "?"] || 0) + 1;
  if (x.ejemplos.length < 6 && p.message) x.ejemplos.push(p.message.replace(/\s+/g, " ").slice(0, 110));
}
for (const x of Object.values(porAnio)) x.reacciones_por_post = +(x.reacciones / x.publicaciones).toFixed(1);
const ultima_antes = posts.filter((p) => p.created_time < "2026-10-26").sort((a, b) => b.created_time.localeCompare(a.created_time))[0];
salida.historial = { total: posts.length, primera: posts.at(-1)?.created_time, ultima_antes_de_relatos: ultima_antes?.created_time, ultima_antes_texto: ultima_antes?.message?.slice(0, 140), por_anio: porAnio };

// 4) Nuestros videos: métricas por video (reels y largos).
const vids = [];
url = `/${PAGE}/videos`; params = { fields: "created_time,title,description,length,permalink_url,is_crossposting_eligible", limit: "50" };
for (let i = 0; i < 5; i++) {
  const r = await get(url, params); if (r.error) { salida.no_disponibles.push(`videos: ${r.error.slice(0, 90)}`); break; }
  vids.push(...r.data.filter((v) => v.created_time >= "2026-10-20"));
  if (!r.paging?.next || r.data.at(-1)?.created_time < "2026-10-20") break;
  const n = new URL(r.paging.next); url = n.pathname.replace(/^\/v[\d.]+/, ""); params = Object.fromEntries(n.searchParams); delete params.access_token;
}
for (const v of vids) {
  const r = await get(`/${v.id}/video_insights`, { metric: "total_video_views,total_video_views_unique,total_video_avg_time_watched,total_video_complete_views,total_video_impressions,total_video_impressions_unique,fb_reels_total_plays,fb_reels_replay_count,post_video_avg_time_watched,post_video_followers,post_video_social_actions,blue_reels_play_count,post_impressions_unique" });
  const m = {}; for (const d of r.data || []) m[d.name] = d.values?.[0]?.value;
  salida.videos.push({ id: v.id, fecha: v.created_time, titulo: (v.title || v.description || "").slice(0, 80), duracion: v.length, ...m, error: r.error });
}

fs.mkdirSync("informes", { recursive: true });
const f = `informes/fb-diagnostico-${new Date().toISOString().slice(0, 10)}.json`;
fs.writeFileSync(f, JSON.stringify(salida, null, 1));
console.log("guardado", f);
console.log("página:", JSON.stringify(salida.pagina).slice(0, 400));
console.log("métricas disponibles:", Object.keys(salida.metricas_pagina).join(", ") || "ninguna");
console.log("no disponibles:", salida.no_disponibles.length);
console.log("publicaciones históricas:", posts.length, "· videos nuestros:", vids.length);
