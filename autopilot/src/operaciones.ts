// Operación de redes por los agentes: cambiar horas, mejorar textos y retener videos — en Facebook, YouTube y el panel.
// Límites en código (no dependen de la IA): DETENER, solo lo que aún no salió, nunca a menos de 30 min, máximo 28 días
// (límite de Facebook), cupo diario de cambios, y cada acción queda en eventos + auditoría con el motivo.
import { auditar } from "./auth";
import { tokenYouTube } from "./redes";
import { detenido } from "./sentinel";
import { evento, type Env, type Pub } from "./tipos";

const G = "https://graph.facebook.com/v23.0";
const YT = "https://www.googleapis.com/youtube/v3/videos";
const CUPO_DIARIO = 30; // cambios por día entre todos los agentes
const PERMISOS: Record<string, string[]> = { reprogramar: ["pam", "michael", "oscar"], texto: ["kelly", "pam", "michael"], retener: ["dwight", "michael", "sentinel"] };

const json = (d: unknown, status = 200) => Response.json(d, { status });
type Res = { ok: boolean; error?: string; detalle?: string };

async function cupo(env: Env) {
  const n = await env.DB.prepare("SELECT COUNT(*) n FROM audit_logs WHERE accion LIKE 'agente-red-%' AND cuando >= datetime('now', '-1 day')").first<number>("n");
  return (n || 0) < CUPO_DIARIO;
}

/** YouTube: los campos de estado se reemplazan completos → se leen y se conservan los que no cambian. */
async function ytEstado(env: Env, id: string, cambio: Record<string, unknown>, quitarPublishAt = false) {
  const H = { Authorization: `Bearer ${await tokenYouTube(env)}`, "Content-Type": "application/json" };
  const v = (await (await fetch(`${YT}?part=status&id=${id}`, { headers: H })).json()) as { items?: { status: Record<string, unknown> }[] };
  const st = v.items?.[0]?.status;
  if (!st) throw new Error("YouTube no encontró el video");
  if (st.privacyStatus !== "private" || (!st.publishAt && !quitarPublishAt)) throw new Error("en YouTube ya no está programado (ya salió o es público)");
  const escribibles = ["privacyStatus", "publishAt", "embeddable", "license", "publicStatsViewable", "selfDeclaredMadeForKids", "containsSyntheticMedia"];
  const nuevo: Record<string, unknown> = Object.fromEntries(Object.entries(st).filter(([k]) => escribibles.includes(k)));
  Object.assign(nuevo, cambio);
  if (quitarPublishAt) delete nuevo.publishAt;
  const r = (await (await fetch(`${YT}?part=status`, { method: "PUT", headers: H, body: JSON.stringify({ id, status: nuevo }) })).json()) as { error?: { message: string } };
  if (r.error) throw new Error("YouTube: " + r.error.message);
}

async function ytTitulo(env: Env, id: string, titulo: string) {
  const H = { Authorization: `Bearer ${await tokenYouTube(env)}`, "Content-Type": "application/json" };
  const v = (await (await fetch(`${YT}?part=snippet,status&id=${id}`, { headers: H })).json()) as { items?: { snippet: Record<string, unknown>; status: { privacyStatus: string } }[] };
  const it = v.items?.[0];
  if (!it) throw new Error("YouTube no encontró el video");
  if (it.status.privacyStatus !== "private") throw new Error("en YouTube ya es público: no se cambia el título de algo publicado");
  const s = it.snippet;
  const r = (await (await fetch(`${YT}?part=snippet`, { method: "PUT", headers: H,
    body: JSON.stringify({ id, snippet: { title: titulo, description: s.description, categoryId: s.categoryId, tags: s.tags, defaultLanguage: s.defaultLanguage, defaultAudioLanguage: s.defaultAudioLanguage } }) })).json()) as { error?: { message: string } };
  if (r.error) throw new Error("YouTube: " + r.error.message);
}

async function fbNoPublicado(env: Env, id: string) {
  const v = (await (await fetch(`${G}/${id}?fields=published&access_token=${env.FB_TOKEN}`)).json()) as { published?: boolean; error?: { message: string } };
  if (v.error) throw new Error("Facebook: " + v.error.message);
  if (v.published) throw new Error("en Facebook ya salió");
}
async function fbPost(env: Env, id: string, campos: Record<string, string>) {
  await fbNoPublicado(env, id);
  const r = (await (await fetch(`${G}/${id}`, { method: "POST", body: new URLSearchParams({ ...campos, access_token: env.FB_TOKEN }) })).json()) as { error?: { message: string } };
  if (r.error) throw new Error("Facebook: " + r.error.message);
}

/** Cambia la hora de UNA publicación (id "<video>:<red>"). */
export async function reprogramar(env: Env, p: Pub, cuando: string): Promise<Res> {
  const t = Date.parse(cuando);
  if (!Number.isFinite(t)) return { ok: false, error: "hora no válida (usa ISO, ej. 2026-11-08T00:30:00Z)" };
  if (t < Date.now() + 30 * 60e3) return { ok: false, error: "no se programa a menos de 30 minutos" };
  if (t > Date.now() + 28 * 86400e3) return { ok: false, error: "máximo 28 días (límite de Facebook)" };
  const iso = new Date(t).toISOString();
  if (p.red === "facebook" || p.red === "youtube") {
    // Lo que aún no está subido toma la hora de publicaciones/<historia>.mjs (lo programa el diario): no se puede mover desde aquí.
    if (p.estado !== "programado" || !p.externo_id) return { ok: false, error: `aún no está subido a ${p.red} (lo programa el diario con la hora del calendario); se puede mover cuando esté programado` };
    if (p.red === "facebook") await fbPost(env, p.externo_id, { scheduled_publish_time: String(Math.floor(t / 1000)) });
    else await ytEstado(env, p.externo_id, { privacyStatus: "private", publishAt: iso });
  } else if (p.red === "tiktok") {
    if (p.estado === "programado") return { ok: false, error: "TikTok ya programado en TikTok Studio: no se puede mover por API" };
    if (!["pendiente", "por-programar", "por-aprobar"].includes(p.estado)) return { ok: false, error: `estado ${p.estado}: no se mueve` };
  }
  await env.DB.prepare("UPDATE publicaciones SET cuando = ?, actualizado = datetime('now') WHERE id = ?").bind(iso, p.id).run();
  return { ok: true, detalle: `${p.cuando} → ${iso}` };
}

/** Cambia el texto (YouTube: título ≤ 100; Facebook: descripción; TikTok pendiente: texto del panel). */
export async function cambiarTexto(env: Env, p: Pub, texto: string): Promise<Res> {
  const limpio = texto.trim();
  if (limpio.length < 5) return { ok: false, error: "texto demasiado corto" };
  if (p.red === "youtube") {
    if (limpio.length > 100) return { ok: false, error: "en YouTube el título tiene máximo 100 caracteres" };
    if (!p.externo_id || p.estado !== "programado") return { ok: false, error: "aún no está subido a YouTube" };
    await ytTitulo(env, p.externo_id, limpio);
  } else if (p.red === "facebook") {
    if (limpio.length > 5000) return { ok: false, error: "texto demasiado largo" };
    if (!p.externo_id || p.estado !== "programado") return { ok: false, error: "aún no está subido a Facebook" };
    await fbPost(env, p.externo_id, { description: limpio });
  } else if (!["pendiente", "por-programar", "por-aprobar"].includes(p.estado)) return { ok: false, error: "TikTok ya programado: el texto no se cambia por API" };
  await env.DB.prepare("UPDATE publicaciones SET texto = ?, actualizado = datetime('now') WHERE id = ?").bind(limpio, p.id).run();
  return { ok: true };
}

/** Retiene un video: TikTok no lo publica y YouTube lo deja en privado sin fecha. Facebook programado → aviso al dueño. */
export async function retener(env: Env, videoId: string, motivo: string): Promise<Res> {
  const v = await env.DB.prepare("SELECT id FROM videos WHERE id = ?").bind(videoId).first();
  if (!v) return { ok: false, error: "video no existe" };
  await env.DB.prepare("UPDATE videos SET calidad = 'bloqueado', calidad_notas = ? WHERE id = ?").bind(`Retenido por agentes: ${motivo}`, videoId).run();
  const pubs = (await env.DB.prepare("SELECT * FROM publicaciones WHERE video_id = ? AND estado IN ('programado','pendiente','por-programar','por-aprobar')").bind(videoId).all<Pub>()).results;
  const notas: string[] = [];
  for (const p of pubs) {
    try {
      if (p.red === "facebook" && p.estado === "programado") { notas.push("Facebook: sigue programado — el dueño debe cancelarlo en Meta Business Suite"); continue; }
      if (p.red === "youtube" && p.externo_id && p.estado === "programado") { await ytEstado(env, p.externo_id, { privacyStatus: "private" }, true); notas.push("YouTube: queda privado sin fecha"); }
      if (p.red === "tiktok") notas.push("TikTok: no se publicará");
      // Solo se marca retenido lo que de verdad quedó frenado en su red.
      await env.DB.prepare("UPDATE publicaciones SET estado = 'retenido' WHERE id = ?").bind(p.id).run();
    } catch (e) { notas.push(`${p.red}: NO se pudo retener (${String(e).slice(0, 120)})`); }
  }
  return { ok: true, detalle: notas.join(" · ") || "sin publicaciones pendientes" };
}

/** Rutas /api/agentes/red/* (ya autenticado como agente). */
export async function apiRed(env: Env, agente: string, division: string, ruta: string, cuerpo: Record<string, unknown>) {
  const accion = ruta.split("/")[3] as "reprogramar" | "texto" | "retener";
  if (!PERMISOS[accion]) return json({ error: "acción desconocida" }, 404);
  if (!PERMISOS[accion].includes(agente)) return json({ error: `${agente} no puede ${accion} (pueden: ${PERMISOS[accion].join(", ")})` }, 403);
  if (await detenido(env, division, "publicaciones")) return json({ error: "DETENER EMPRESA: publicaciones paradas." }, 423);
  if (!(await cupo(env))) return json({ error: `Cupo diario de ${CUPO_DIARIO} cambios agotado.` }, 429);
  const motivo = typeof cuerpo.motivo === "string" ? cuerpo.motivo.trim().slice(0, 400) : "";
  if (motivo.length < 10) return json({ error: "Explica el motivo con datos (mínimo 10 letras): queda registrado para el dueño." }, 400);
  let r: Res;
  try {
    if (accion === "retener") r = await retener(env, String(cuerpo.video_id || ""), motivo);
    else {
      const p = await env.DB.prepare("SELECT * FROM publicaciones WHERE id = ? AND division_id = ?").bind(String(cuerpo.pub_id || ""), division).first<Pub>();
      if (!p) return json({ error: "publicación no existe (usa el id \"<video>:<red>\")" }, 404);
      r = accion === "reprogramar" ? await reprogramar(env, p, String(cuerpo.cuando || "")) : await cambiarTexto(env, p, String(cuerpo.texto || ""));
    }
  } catch (e) { r = { ok: false, error: String(e).replace(/^Error: /, "").slice(0, 300) }; }
  const objeto = String(cuerpo.pub_id || cuerpo.video_id || "");
  if (r.ok) {
    const QUE = { reprogramar: "cambió la hora de", texto: "mejoró el texto de", retener: "retuvo" };
    await evento(env, `${agente[0].toUpperCase() + agente.slice(1)} ${QUE[accion]} ${objeto}: ${motivo}${r.detalle ? ` (${r.detalle})` : ""}`.slice(0, 500), accion === "retener" ? "aviso" : "info");
    await env.DB.prepare("INSERT INTO agent_events (agente_id, estado, mensaje) VALUES (?, 'coordinando', ?)").bind(agente, `🛠 ${QUE[accion]} ${objeto}`).run();
  }
  await auditar(env, `agente-red-${accion}`, { actor: agente, division, detalle: `${objeto} · ${r.ok ? "ok" : "rechazado: " + r.error} · ${motivo}` });
  return json(r, r.ok ? 200 : 400);
}
