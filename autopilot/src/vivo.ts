// Datos en vivo del tablero en UNA consulta liviana (la página la pide cada 20 s) e informe del día para el CEO.
import { listaAgentes } from "./agentes";
import { actividadReciente, division } from "./grupo";
import { estadoPresupuesto, leerDetener } from "./sentinel";
import type { Env } from "./tipos";

type Fuentes = { resumen: () => Promise<unknown>; serie: () => Promise<unknown>; problemas: () => Promise<string[]>; usuario?: number; cache: <T>(clave: string, fn: () => Promise<T>) => Promise<T> };

export async function vivo(env: Env, f: Fuentes) {
  // Lo que cambia lento va en caché de 60 s; agentes, actividad y DETENER se leen en cada consulta.
  const lento = () => f.cache("c:vivo-lento", async () => {
    const [rel, pres, cuentas, bandeja, seguridad, historias] = await Promise.all([division(env, "relatos"), estadoPresupuesto(env),
    // Seguidores por día (14 días) para las líneas de tendencia.
    env.DB.prepare(`SELECT c.red, substr(c.momento, 1, 10) dia, c.seguidores FROM cuentas_hist c
      JOIN (SELECT red, substr(momento, 1, 10) d, MAX(momento) mx FROM cuentas_hist WHERE momento >= date('now', '-15 days') GROUP BY red, d) u ON u.red = c.red AND u.mx = c.momento ORDER BY dia`).all(),
    env.DB.prepare(`SELECT COUNT(DISTINCT p.video_id) n FROM publicaciones p WHERE p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AND p.cuando < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+7 days')
      AND p.estado NOT IN ('publicado','descartado') AND p.video_id NOT LIKE 'demo%' AND NOT EXISTS (SELECT 1 FROM approvals a WHERE a.video_id = p.video_id)`).first<number>("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM security_events WHERE severidad = 'alta' AND cuando >= datetime('now', '-1 day')").first<number>("n"),
    env.DB.prepare("SELECT id, titulo, estado, semana FROM historias ORDER BY semana").all(),
    ]);
    return { rel, pres, cuentas: cuentas.results, bandeja: bandeja || 0, seguridad: seguridad || 0, historias: historias.results };
  });
  const [resumen, serie, problemas, ag, actividad, det, L] = await Promise.all([f.resumen(), f.serie(), f.problemas(), listaAgentes(env), actividadReciente(env, 12), leerDetener(env), lento()]);
  const { rel, pres, cuentas, bandeja, seguridad, historias } = L;
  return {
    ahora: new Date().toISOString(), resumen, serie, crec: { cuentas }, agentes: ag.agentes, actividad, division: rel, pres,
    historias,
    barra: { detenido: Object.entries(det).some(([k, v]) => v === true && k !== "cambiado"), alertas: f.usuario ? (await notificaciones(env, f.usuario, problemas)).nuevos : problemas.length + (seguridad || 0), bandeja: bandeja || 0 },
    proyeccion: proyeccion(cuentas as { red: string; dia: string; seguidores: number | null }[], serie as { dia: string; red: string; vistas: number | null }[]),
  };
}

/** Lo que hizo el equipo en un día de Ecuador (por defecto, hoy): para revisar como CEO. */
export async function informeDia(env: Env, fecha: string | null) {
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(fecha || "") ? fecha! : new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  // Límites del día de Ecuador en UTC (las fechas de la base están en UTC).
  const desde = `${dia} 05:00:00`, hasta = new Date(Date.parse(`${dia}T05:00:00Z`) + 86400e3).toISOString().replace("T", " ").slice(0, 19);
  const [tareas, cambios, publicadas, eventos, informes, chats] = await Promise.all([
    env.DB.prepare(`SELECT t.id, t.agente_id, a.nombre, t.titulo, t.estado, t.calidad, t.revision, t.creada_por, t.terminada, substr(t.resultado, 1, 600) resultado
      FROM agent_tasks t JOIN agents a ON a.id = t.agente_id WHERE (t.terminada >= ?1 AND t.terminada < ?2) OR (t.creada >= ?1 AND t.creada < ?2) ORDER BY t.id`).bind(desde, hasta).all(),
    env.DB.prepare("SELECT cuando, actor, accion, detalle FROM audit_logs WHERE accion LIKE 'agente-red-%' AND cuando >= ? AND cuando < ? ORDER BY id").bind(desde, hasta).all(),
    env.DB.prepare(`SELECT p.red, p.publicado_en, v.titulo, v.tipo FROM publicaciones p JOIN videos v ON v.id = p.video_id
      WHERE p.estado = 'publicado' AND replace(substr(p.publicado_en, 1, 19), 'T', ' ') >= ? AND replace(substr(p.publicado_en, 1, 19), 'T', ' ') < ? AND v.id NOT LIKE 'demo%' ORDER BY p.publicado_en`).bind(desde, hasta).all(),
    env.DB.prepare("SELECT agente_id, COUNT(*) n FROM agent_events WHERE cuando >= ? AND cuando < ? GROUP BY agente_id").bind(desde, hasta).all(),
    env.DB.prepare("SELECT id, titulo, contenido, autor, creado FROM company_memory WHERE tipo = 'informe' AND creado >= ? AND creado < ? ORDER BY id DESC LIMIT 5").bind(desde, hasta).all(),
    env.DB.prepare("SELECT COUNT(*) n FROM agent_chats WHERE cuando >= ? AND cuando < ?").bind(desde, hasta).first<number>("n"),
  ]);
  return { dia, tareas: tareas.results, cambios: cambios.results, publicadas: publicadas.results, actividad: eventos.results, informes: informes.results, chats: chats || 0 };
}

/* ───── Notificaciones de la campana (lo "visto" se guarda en KV por usuario: vale en cualquier dispositivo) ───── */
export async function notificaciones(env: Env, userId: number, problemas: string[]) {
  const visto = (await env.KV.get(`notif-visto:${userId}`)) || "1970-01-01 00:00:00";
  const vistosProb = new Set(JSON.parse((await env.KV.get(`notif-prob:${userId}`)) || "[]") as string[]);
  const items = (await env.DB.prepare(`SELECT * FROM (
      SELECT cuando, CASE nivel WHEN 'error' THEN 'error' ELSE 'aviso' END tipo, mensaje texto FROM eventos
        WHERE (nivel IN ('error','aviso') OR mensaje LIKE '%cambió la hora%' OR mensaje LIKE '%mejoró el texto%' OR mensaje LIKE '%retuvo%') AND cuando >= datetime('now', '-7 days')
      UNION ALL SELECT t.terminada, 'tarea', a.nombre || ' terminó: ' || t.titulo || CASE WHEN t.calidad IS NOT NULL THEN ' (' || t.calidad || '/100)' ELSE '' END
        FROM agent_tasks t JOIN agents a ON a.id = t.agente_id WHERE t.estado = 'hecha' AND t.terminada >= datetime('now', '-7 days')
      UNION ALL SELECT cuando, 'seguridad', tipo || ': ' || detalle FROM security_events WHERE severidad = 'alta' AND cuando >= datetime('now', '-7 days')
    ) ORDER BY cuando DESC LIMIT 30`).all<{ cuando: string; tipo: string; texto: string }>()).results;
  const nuevos = items.filter((i) => i.cuando > visto).length + problemas.filter((p) => !vistosProb.has(p)).length;
  return { visto, nuevos, problemas: problemas.map((p) => ({ texto: p, nuevo: !vistosProb.has(p) })), items: items.map((i) => ({ ...i, nuevo: i.cuando > visto })) };
}

export async function marcarVisto(env: Env, userId: number, problemas: string[]) {
  await env.KV.put(`notif-visto:${userId}`, new Date().toISOString().replace("T", " ").slice(0, 19));
  await env.KV.put(`notif-prob:${userId}`, JSON.stringify(problemas));
}

/** "Si seguimos así": tendencia lineal de los últimos 14 días por red (estimación de Oscar, no una promesa). */
export function proyeccion(cuentas: { red: string; dia: string; seguidores: number | null }[], serie: { dia: string; red: string; vistas: number | null }[]) {
  return ["facebook", "youtube", "tiktok"].map((red) => {
    const pts = cuentas.filter((c) => c.red === red && c.seguidores != null).slice(-14).map((c, i) => [i, c.seguidores as number]);
    const n = pts.length;
    let pendiente = 0;
    if (n >= 3) {
      const mx = pts.reduce((a, p) => a + p[0], 0) / n, my = pts.reduce((a, p) => a + p[1], 0) / n;
      const num = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0), den = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0);
      pendiente = den ? num / den : 0;
    }
    const s = serie.filter((x) => x.red === red).map((x) => x.vistas || 0);
    const dias = s.slice(1).map((v, i) => Math.max(0, v - s[i]));
    const vistasSemana = dias.slice(-7).reduce((a, b) => a + b, 0);
    const actual = n ? pts[n - 1][1] : null;
    return { red, actual, seguidores_semana: Math.round(pendiente * 7), en_4_semanas: actual == null ? null : Math.round(actual + pendiente * 28),
      vistas_semana: vistasSemana, dias: n, confianza: n >= 10 ? "media" : "baja" };
  });
}
