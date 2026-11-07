// Panel general de RELATOS AI GROUP: cifras consolidadas por división, solo con datos reales.
// Lo que aún no existe (agentes, costos) se devuelve como null para que el panel diga "no instalado", nunca un cero inventado.
import { estadoPresupuesto } from "./sentinel";
import type { Env } from "./tipos";

export async function division(env: Env, id: string) {
  const pubs = await env.DB.prepare(`SELECT
      SUM(estado IN ('publicado','privado') AND COALESCE(publicado_en, cuando) >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 days')) publicados_7d,
      SUM(estado IN ('pendiente','programado','enviado')) agenda,
      SUM(estado IN ('por-aprobar','por-programar')) por_revisar,
      SUM(estado = 'fallido') fallidos
    FROM publicaciones WHERE division_id = ? AND video_id NOT LIKE 'demo%'`).bind(id).first<Record<string, number | null>>();
  const produccion = await env.DB.prepare("SELECT COUNT(*) n FROM historias WHERE division_id = ? AND estado NOT IN ('listo','publicado')").bind(id).first<number>("n");
  const listas = await env.DB.prepare("SELECT COUNT(*) n FROM historias WHERE division_id = ? AND estado = 'listo'").bind(id).first<number>("n");
  const errores = await env.DB.prepare("SELECT COUNT(*) n FROM eventos WHERE division_id = ? AND nivel = 'error' AND cuando >= datetime('now', '-1 day')").bind(id).first<number>("n");
  const cuentas = (await env.DB.prepare(`SELECT c.red, c.seguidores FROM cuentas_hist c JOIN (SELECT red, MAX(momento) mx FROM cuentas_hist GROUP BY red) u ON u.red = c.red AND u.mx = c.momento`).all<{ red: string; seguidores: number }>()).results;
  const proxima = await env.DB.prepare(`SELECT p.cuando, v.titulo, p.red FROM publicaciones p JOIN videos v ON v.id = p.video_id
      WHERE p.division_id = ? AND p.estado IN ('pendiente','programado') AND p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') ORDER BY p.cuando LIMIT 1`).bind(id).first();
  return {
    publicados_7d: pubs?.publicados_7d ?? 0, agenda: pubs?.agenda ?? 0, por_revisar: pubs?.por_revisar ?? 0, fallidos: pubs?.fallidos ?? 0,
    en_produccion: produccion ?? 0, listas: listas ?? 0, errores_24h: errores ?? 0, proxima: proxima ?? null,
    // Las cuentas conectadas hoy (cuentas_hist) son las de Relatos; Gaming aún no tiene redes.
    redes: id === "relatos" ? cuentas : [],
  };
}

/** Actividad mezclada (sistema, personas y agentes), lo más nuevo primero. */
export async function actividadReciente(env: Env, limite = 30) {
  return (await env.DB.prepare(`SELECT * FROM (
      SELECT cuando, 'sistema' tipo, nivel, division_id division, mensaje texto FROM eventos
      UNION ALL SELECT cuando, 'persona' tipo, 'info' nivel, division_id division,
        CASE accion WHEN 'mfa-activado' THEN 'Activaste la verificación en dos pasos' WHEN 'DETENER' THEN 'Activaste DETENER: ' || detalle WHEN 'reanudar' THEN 'Reanudaste: ' || detalle
          WHEN 'instruccion-agente' THEN 'Diste una instrucción a ' || detalle WHEN 'restauracion-probada' THEN 'Respaldo restaurado con éxito en la prueba'
          ELSE replace(accion, '-', ' ') || CASE WHEN detalle != '' THEN ' · ' || detalle ELSE '' END END texto
        FROM audit_logs WHERE accion NOT IN ('login', 'logout', 'contraseña-correcta', 'sentinel-revision', 'propietario-creado', 'cierre-global')
      UNION ALL SELECT e.cuando, 'agente' tipo, CASE e.estado WHEN 'error' THEN 'error' ELSE 'info' END nivel, COALESCE(a.division_id, 'grupo') division, a.nombre || ' · ' || e.mensaje texto FROM agent_events e JOIN agents a ON a.id = e.agente_id
    ) ORDER BY cuando DESC LIMIT ?`).bind(limite).all()).results;
}

export async function resumenGrupo(env: Env, alertasRelatos: string[]) {
  const divisiones = (await env.DB.prepare("SELECT id, nombre, descripcion, estado FROM divisions ORDER BY id = 'relatos' DESC, creada, id").all<{ id: string; nombre: string; descripcion: string; estado: string }>()).results;
  const pausa = (await env.DB.prepare("SELECT valor FROM config WHERE clave = 'pausa'").first<string>("valor")) === "1";
  const datos = await Promise.all(divisiones.map(async (d) => ({ ...d, ...(await division(env, d.id)), pausa: d.id === "relatos" ? pausa : null })));
  const org = await env.DB.prepare("SELECT nombre, presupuesto_mensual FROM organizations WHERE id = 'grupo'").first<{ nombre: string; presupuesto_mensual: number }>();
  // Actividad: eventos del sistema + acciones de personas, mezclados por fecha.
  const actividad = await actividadReciente(env);
  const seguridad = await env.DB.prepare(`SELECT COUNT(*) total, SUM(severidad = 'alta') altas, SUM(severidad = 'media') medias FROM security_events WHERE cuando >= datetime('now', '-1 day')`).first<{ total: number; altas: number | null; medias: number | null }>();
  return {
    org: org?.nombre ?? "RELATOS AI GROUP",
    presupuesto: await (async () => { const p = await estadoPresupuesto(env); return { mensual: p.limites.total, usado: p.usado as number | null, proyeccion: p.proyeccion, estimado: p.estimado }; })(),
    agentes: await env.DB.prepare("SELECT SUM(estado NOT IN ('disponible','pausa','no-activado')) activos, COUNT(*) total FROM agents WHERE activo = 1").first<{ activos: number; total: number }>(),
    tareas: await env.DB.prepare("SELECT SUM(estado = 'pendiente') pendientes, SUM(estado = 'en-curso') en_curso, SUM(estado = 'en-revision') en_revision FROM agent_tasks").first(),
    divisiones: datos,
    alertas: alertasRelatos.map((t) => ({ division: "relatos", texto: t })),
    seguridad_24h: { total: seguridad?.total ?? 0, altas: seguridad?.altas ?? 0, medias: seguridad?.medias ?? 0 },
    actividad,
  };
}
