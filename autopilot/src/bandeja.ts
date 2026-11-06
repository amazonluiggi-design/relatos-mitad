// Bandeja de revisión (fase 10). Informativa: registra quién vio, pidió cambios o bloqueó qué y cuándo.
import { auditar, type Sesion } from "./auth";
import type { Env } from "./tipos";

export async function bandeja(env: Env) {
  const filas = (await env.DB.prepare(`SELECT v.id video_id, v.titulo, v.tipo, v.historia_id, v.archivo, v.miniatura, v.calidad, v.duracion, v.division_id,
      p.red, p.cuando, p.estado, p.texto,
      (SELECT decision || '|' || por || '|' || cuando FROM approvals a WHERE a.video_id = v.id ORDER BY id DESC LIMIT 1) ultima
    FROM publicaciones p JOIN videos v ON v.id = p.video_id
    WHERE p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AND p.cuando < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+7 days')
      AND p.estado NOT IN ('publicado', 'descartado') AND v.id NOT LIKE 'demo%' ORDER BY p.cuando`).all()).results as Record<string, unknown>[];
  const porVideo = new Map<string, Record<string, unknown>>();
  for (const f of filas) {
    const v = porVideo.get(f.video_id as string) ?? { ...f, redes: [] as unknown[] };
    (v.redes as unknown[]).push({ red: f.red, cuando: f.cuando, estado: f.estado, texto: f.texto });
    porVideo.set(f.video_id as string, v);
  }
  return [...porVideo.values()];
}

export async function decidir(env: Env, ses: Sesion, videoId: string, cuerpo: { decision?: string; nota?: string }) {
  const decision = String(cuerpo.decision || "");
  if (!["visto", "cambios", "bloqueado", "desbloqueado"].includes(decision)) return { error: "decisión no válida" };
  const v = await env.DB.prepare("SELECT id, titulo, division_id FROM videos WHERE id = ?").bind(videoId).first<{ id: string; titulo: string; division_id: string }>();
  if (!v) return { error: "video no existe" };
  const nota = typeof cuerpo.nota === "string" ? cuerpo.nota.slice(0, 2000) : null;
  await env.DB.prepare("INSERT INTO approvals (division_id, video_id, decision, nota, user_id, por) VALUES (?, ?, ?, ?, ?, ?)").bind(v.division_id, v.id, decision, nota, ses.user.id, ses.user.correo).run();
  if (decision === "bloqueado") await env.DB.prepare("UPDATE videos SET calidad = 'bloqueado', calidad_notas = ? WHERE id = ?").bind(`Bloqueado por el propietario: ${nota || "sin nota"}`, v.id).run();
  if (decision === "desbloqueado") await env.DB.prepare("UPDATE videos SET calidad = 'aprobado', calidad_notas = NULL WHERE id = ?").bind(v.id).run();
  if (decision === "cambios") await env.DB.prepare("INSERT INTO agent_tasks (division_id, agente_id, titulo, descripcion, prioridad, creada_por) VALUES (?, 'michael', ?, ?, 'alta', 'propietario')")
    .bind(v.division_id, `Cambios pedidos por el propietario: ${v.titulo}`.slice(0, 200), `Video ${v.id}. Nota del propietario: ${nota || "(sin nota)"}. Asigna a quien corresponda (Ryan guion, Kelly textos, Jim montaje) y deja el plan de corrección.`).run();
  await auditar(env, `bandeja-${decision}`, { user_id: ses.user.id, actor: ses.user.correo, division: v.division_id, detalle: `${v.id}${nota ? " · " + nota : ""}` });
  return { ok: true };
}
