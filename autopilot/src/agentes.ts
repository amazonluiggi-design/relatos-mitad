// Agentes de RELATOS AI GROUP.
// Trabajan como rutinas de Claude Code en la nube (suscripción del propietario) y hablan con el panel por esta API.
// Permisos mínimos: leen datos, toman/terminan tareas, escriben memoria, recomendaciones y experimentos.
// NO pueden publicar, gastar, tocar el botón DETENER, la configuración, usuarios ni sesiones.
import { auditar, eventoSeguridad, type Sesion } from "./auth";
import { detenido, estadoPresupuesto, leerDetener } from "./sentinel";
import type { Env } from "./tipos";

const ESTADOS_VISIBLES = ["disponible", "investigando", "analizando", "escribiendo", "produciendo", "renderizando", "revisando", "coordinando", "pausa", "error"];
const texto = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const json = (d: unknown, status = 200) => Response.json(d, { status });

async function marcar(env: Env, agente: string, estado: string, mensaje: string, tarea: number | null = null) {
  const e = ESTADOS_VISIBLES.includes(estado) ? estado : "coordinando";
  await env.DB.batch([
    env.DB.prepare("UPDATE agents SET estado = ?, tarea_actual = ?, desde = datetime('now') WHERE id = ?").bind(e, e === "disponible" ? null : tarea, agente),
    env.DB.prepare("INSERT INTO agent_events (agente_id, tarea_id, estado, mensaje) VALUES (?, ?, ?, ?)").bind(agente, tarea, e, mensaje.slice(0, 500)),
  ]);
}

/** Todo lo que un agente necesita saber para trabajar, en un solo pedido (solo lectura). */
async function contexto(env: Env, division: string, crecimiento: () => Promise<unknown>) {
  const [agentes, tareas, memoria, experimentos, recomendaciones, presupuesto, det] = await Promise.all([
    env.DB.prepare("SELECT id, nombre, cargo, departamento, division_id, estado, activo FROM agents ORDER BY division_id IS NOT NULL, id").all(),
    env.DB.prepare("SELECT id, agente_id, titulo, descripcion, prioridad, estado, depende_de, creada_por, creada, calidad, revision FROM agent_tasks WHERE (division_id = ? OR division_id IS NULL) AND (estado IN ('pendiente','en-curso','en-revision','bloqueada') OR terminada >= datetime('now', '-3 days')) ORDER BY id").bind(division).all(),
    env.DB.prepare("SELECT id, tipo, titulo, substr(contenido, 1, 1500) contenido, autor, confianza, creado FROM company_memory WHERE division_id = ? OR division_id IS NULL ORDER BY id DESC LIMIT 15").bind(division).all(),
    env.DB.prepare("SELECT * FROM experiments WHERE division_id = ?").bind(division).all(),
    env.DB.prepare("SELECT id, prioridad, area, quien, titulo, detalle, estado FROM recomendaciones WHERE division_id = ? AND estado != 'descartado' ORDER BY id DESC LIMIT 20").bind(division).all(),
    estadoPresupuesto(env), leerDetener(env),
  ]);
  return {
    ahora: new Date().toISOString(), division, detener: det,
    presupuesto: { usado: presupuesto.usado, total: presupuesto.limites.total, proyeccion: presupuesto.proyeccion },
    agentes: agentes.results, tareas: tareas.results, memoria: memoria.results, experimentos: experimentos.results, recomendaciones: recomendaciones.results,
    datos: division === "relatos" ? await crecimiento() : null,
  };
}

/** API de los agentes: /api/agentes/... con cabecera x-agente (clave) y x-agente-id (quién habla). */
export async function apiAgentes(env: Env, req: Request, ruta: string, crecimiento: () => Promise<unknown>) {
  const agente = (req.headers.get("x-agente-id") || "").toLowerCase();
  const fila = await env.DB.prepare("SELECT id, division_id, activo FROM agents WHERE id = ?").bind(agente).first<{ id: string; division_id: string | null; activo: number }>();
  if (!fila || !fila.activo) return json({ error: "agente desconocido o no activado" }, 403);
  const division = fila.division_id ?? (new URL(req.url).searchParams.get("division") || "relatos");
  if (!["relatos", "gaming"].includes(division)) return json({ error: "división" }, 400);
  // Un agente de una división no ve ni toca la otra.
  if (fila.division_id && fila.division_id !== division) return json({ error: "otra división" }, 403);

  if (ruta === "/agentes/contexto" && req.method === "GET") return json(await contexto(env, division, crecimiento));

  if (await detenido(env, division, "agentes")) {
    if (req.method !== "GET") return json({ error: "DETENER EMPRESA: los agentes están parados. No hagas nada más." }, 423);
  }
  const cuerpo = req.method === "POST" ? ((await req.json().catch(() => ({}))) as Record<string, unknown>) : {};

  // Tomar la siguiente tarea propia (o una concreta). Respeta dependencias.
  if (ruta === "/agentes/tareas/tomar" && req.method === "POST") {
    const id = Number(cuerpo.id) || null;
    const t = await env.DB.prepare(`SELECT * FROM agent_tasks t WHERE estado = 'pendiente' AND agente_id = ? ${id ? "AND id = ?" : ""}
        AND (depende_de IS NULL OR EXISTS (SELECT 1 FROM agent_tasks d WHERE d.id = t.depende_de AND d.estado = 'hecha'))
        ORDER BY CASE prioridad WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, id LIMIT 1`).bind(...(id ? [agente, id] : [agente])).first<{ id: number; titulo: string }>();
    if (!t) return json({ tarea: null });
    const r = await env.DB.prepare("UPDATE agent_tasks SET estado = 'en-curso', tomada = datetime('now') WHERE id = ? AND estado = 'pendiente'").bind(t.id).run();
    if (!r.meta.changes) return json({ tarea: null });
    await marcar(env, agente, texto(cuerpo.estado, 20) || "coordinando", `Empieza: ${t.titulo}`, t.id);
    return json({ tarea: await env.DB.prepare("SELECT * FROM agent_tasks WHERE id = ?").bind(t.id).first() });
  }

  // Avance visible (alimenta la oficina): { estado, mensaje }
  const ev = /^\/agentes\/tareas\/(\d+)\/evento$/.exec(ruta);
  if (ev && req.method === "POST") {
    await marcar(env, agente, texto(cuerpo.estado, 20), texto(cuerpo.mensaje, 500) || "trabajando", +ev[1]);
    return json({ ok: true });
  }

  // Entrega: va a revisión de Dwight (salvo que la entregue el propio Dwight o Michael verifique).
  const fin = /^\/agentes\/tareas\/(\d+)\/terminar$/.exec(ruta);
  if (fin && req.method === "POST") {
    const t = await env.DB.prepare("SELECT id, agente_id, estado, titulo FROM agent_tasks WHERE id = ?").bind(+fin[1]).first<{ id: number; agente_id: string; estado: string; titulo: string }>();
    if (!t || t.agente_id !== agente || t.estado !== "en-curso") return json({ error: "no es tu tarea en curso" }, 409);
    const error = texto(cuerpo.error, 1000);
    const resultado = texto(cuerpo.resultado, 60000);
    if (!error && resultado.length < 50) return json({ error: "Entrega vacía: un resultado necesita contenido verificable." }, 400);
    const estado = error ? "error" : ["dwight", "michael", "sentinel"].includes(agente) ? "hecha" : "en-revision";
    await env.DB.prepare("UPDATE agent_tasks SET estado = ?, resultado = ?, error = ?, terminada = datetime('now') WHERE id = ?").bind(estado, resultado || null, error || null, t.id).run();
    await marcar(env, agente, error ? "error" : "disponible", error ? `Error en "${t.titulo}": ${error.slice(0, 200)}` : `Entregó: ${t.titulo}`, t.id);
    return json({ ok: true, estado });
  }

  // Revisión de Dwight (o Michael): puntuación 0-100; < 85 vuelve al autor.
  const rev = /^\/agentes\/tareas\/(\d+)\/revisar$/.exec(ruta);
  if (rev && req.method === "POST") {
    if (!["dwight", "michael"].includes(agente)) return json({ error: "solo Dwight o Michael revisan" }, 403);
    const nota = Math.max(0, Math.min(100, Math.round(Number(cuerpo.calidad))));
    const t = await env.DB.prepare("SELECT id, agente_id, titulo, estado FROM agent_tasks WHERE id = ?").bind(+rev[1]).first<{ id: number; agente_id: string; titulo: string; estado: string }>();
    if (!t || t.estado !== "en-revision") return json({ error: "no está en revisión" }, 409);
    if (t.agente_id === agente) return json({ error: "nadie revisa su propio trabajo" }, 403);
    const aprobada = nota >= 85;
    await env.DB.prepare("UPDATE agent_tasks SET estado = ?, calidad = ?, revision = ? WHERE id = ?").bind(aprobada ? "hecha" : "pendiente", nota, texto(cuerpo.comentario, 3000), t.id).run();
    await marcar(env, agente, "revisando", `${aprobada ? "Aprobó" : "Devolvió"} (${nota}/100): ${t.titulo}`, t.id);
    await marcar(env, agente, "disponible", "Revisión terminada");
    return json({ ok: true, aprobada });
  }

  // Delegar: Michael (y cualquier agente, para pedir ayuda) crea tareas en su división.
  if (ruta === "/agentes/tareas" && req.method === "POST") {
    const destino = texto(cuerpo.agente_id, 20).toLowerCase();
    const d = await env.DB.prepare("SELECT division_id, activo FROM agents WHERE id = ?").bind(destino).first<{ division_id: string | null; activo: number }>();
    if (!d || !d.activo) return json({ error: "agente destino no existe o no está activado" }, 400);
    if (d.division_id && d.division_id !== division) return json({ error: "no se delega a otra división" }, 403);
    const abiertas = await env.DB.prepare("SELECT COUNT(*) n FROM agent_tasks WHERE estado IN ('pendiente','en-curso') AND division_id = ?").bind(division).first<number>("n");
    if ((abiertas || 0) >= 25) return json({ error: "Hay 25 tareas abiertas: termina las actuales antes de crear más." }, 429);
    const titulo = texto(cuerpo.titulo, 200);
    if (titulo.length < 5) return json({ error: "título" }, 400);
    const r = await env.DB.prepare("INSERT INTO agent_tasks (division_id, agente_id, titulo, descripcion, prioridad, depende_de, creada_por) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .bind(division, destino, titulo, texto(cuerpo.descripcion, 6000), ["alta", "media", "baja"].includes(String(cuerpo.prioridad)) ? cuerpo.prioridad : "media", Number(cuerpo.depende_de) || null, agente).run();
    await marcar(env, agente, "coordinando", `Asignó a ${destino}: ${titulo}`);
    return json({ ok: true, id: r.meta.last_row_id });
  }

  // Memoria empresarial (informes, aprendizajes, decisiones…). Se filtra cualquier cosa con forma de secreto.
  if (ruta === "/agentes/memoria" && req.method === "POST") {
    const contenido = texto(cuerpo.contenido, 60000);
    if (/(sk-ant-|EAA[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30}|ghp_[A-Za-z0-9]{30}|-----BEGIN)/.test(contenido)) {
      await eventoSeguridad(env, "secreto-en-memoria", "alta", `${agente} intentó guardar algo con forma de credencial`, null);
      return json({ error: "Sentinel: la memoria no puede contener credenciales." }, 403);
    }
    const tipo = ["informe", "aprendizaje", "decision", "nicho", "tendencia", "diagnostico"].includes(String(cuerpo.tipo)) ? String(cuerpo.tipo) : "informe";
    const r = await env.DB.prepare("INSERT INTO company_memory (division_id, tipo, titulo, contenido, autor, fuentes, confianza, tarea_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .bind(division, tipo, texto(cuerpo.titulo, 200) || "Sin título", contenido, agente, cuerpo.fuentes ? JSON.stringify(cuerpo.fuentes).slice(0, 8000) : null, ["alta", "media", "baja"].includes(String(cuerpo.confianza)) ? cuerpo.confianza : null, Number(cuerpo.tarea_id) || null).run();
    return json({ ok: true, id: r.meta.last_row_id });
  }

  if (ruta === "/agentes/recomendaciones" && req.method === "POST") {
    await env.DB.prepare("INSERT INTO recomendaciones (prioridad, area, quien, titulo, detalle, division_id) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(["alta", "media", "baja"].includes(String(cuerpo.prioridad)) ? cuerpo.prioridad : "media", texto(cuerpo.area, 40) || "estrategia", cuerpo.quien === "usuario" ? "usuario" : "claude", texto(cuerpo.titulo, 200), texto(cuerpo.detalle, 2000), division).run();
    return json({ ok: true });
  }

  const exp = /^\/agentes\/experimentos\/([A-Za-z0-9-]+)$/.exec(ruta);
  if (exp && req.method === "POST") {
    const campos = ["estado", "inicio", "fin", "resultado", "conclusion"].filter((k) => typeof cuerpo[k] === "string");
    if (!campos.length) return json({ error: "nada que cambiar" }, 400);
    if (cuerpo.estado === "terminado" && !texto(cuerpo.resultado, 10)) return json({ error: "Un experimento no se cierra sin resultado con datos." }, 400);
    const r = await env.DB.prepare(`UPDATE experiments SET ${campos.map((k) => `${k} = ?`).join(", ")} WHERE id = ? AND division_id = ?`).bind(...campos.map((k) => texto(cuerpo[k], 6000)), exp[1], division).run();
    return json({ ok: !!r.meta.changes });
  }

  return json({ error: "ruta de agentes no existe" }, 404);
}

/* ───────────── Para el panel del propietario ───────────── */
export async function listaAgentes(env: Env) {
  const agentes = (await env.DB.prepare(`SELECT a.*, t.titulo tarea_titulo,
      (SELECT COUNT(*) FROM agent_tasks WHERE agente_id = a.id AND estado = 'hecha') hechas,
      (SELECT COUNT(*) FROM agent_tasks WHERE agente_id = a.id AND estado IN ('pendiente','en-curso','en-revision')) abiertas,
      (SELECT mensaje FROM agent_events WHERE agente_id = a.id ORDER BY id DESC LIMIT 1) ultimo
    FROM agents a LEFT JOIN agent_tasks t ON t.id = a.tarea_actual ORDER BY a.activo DESC, a.division_id IS NOT NULL, a.id`).all()).results;
  const tareas = (await env.DB.prepare("SELECT id, division_id, agente_id, titulo, prioridad, estado, creada_por, creada, terminada, calidad FROM agent_tasks ORDER BY CASE estado WHEN 'en-curso' THEN 0 WHEN 'en-revision' THEN 1 WHEN 'pendiente' THEN 2 ELSE 3 END, id DESC LIMIT 60").all()).results;
  const memoria = (await env.DB.prepare("SELECT id, division_id, tipo, titulo, autor, confianza, creado FROM company_memory ORDER BY id DESC LIMIT 30").all()).results;
  const experimentos = (await env.DB.prepare("SELECT * FROM experiments ORDER BY creado DESC").all()).results;
  return { agentes, tareas, memoria, experimentos };
}

export async function fichaAgente(env: Env, id: string) {
  const a = await env.DB.prepare("SELECT * FROM agents WHERE id = ?").bind(id).first();
  if (!a) return null;
  const tareas = (await env.DB.prepare("SELECT id, titulo, estado, prioridad, creada_por, creada, tomada, terminada, calidad, revision, error FROM agent_tasks WHERE agente_id = ? ORDER BY id DESC LIMIT 30").bind(id).all()).results;
  const eventos = (await env.DB.prepare("SELECT cuando, estado, mensaje, tarea_id FROM agent_events WHERE agente_id = ? ORDER BY id DESC LIMIT 40").bind(id).all()).results;
  return { agente: a, tareas, eventos };
}

export async function verTarea(env: Env, id: number) {
  return env.DB.prepare("SELECT * FROM agent_tasks WHERE id = ?").bind(id).first();
}
export async function verMemoria(env: Env, id: number) {
  return env.DB.prepare("SELECT * FROM company_memory WHERE id = ?").bind(id).first();
}

/** Próxima jornada de agentes (cron "0 12-23,0-3 * * *" UTC = cada hora de 07:00 a 22:00 en Ecuador), como texto. */
export function proximaJornada(ahora = Date.now()) {
  const ec = new Date(ahora - 5 * 3600e3);
  let h = ec.getUTCHours() + 1, dia = "hoy";
  if (h > 22) { h = 7; dia = "mañana"; } else if (h < 7) h = 7;
  return `${dia} a las ${String(h).padStart(2, "0")}:00`;
}

/** El propietario da una instrucción directa a un agente desde su ficha. */
export async function instruccion(env: Env, ses: Sesion, id: string, cuerpo: { titulo?: string; descripcion?: string; prioridad?: string }) {
  const a = await env.DB.prepare("SELECT division_id, activo, nombre FROM agents WHERE id = ?").bind(id).first<{ division_id: string | null; activo: number; nombre: string }>();
  if (!a) return json({ error: "no existe" }, 404);
  if (!a.activo) return json({ error: `${a.nombre} todavía no está activado.` }, 409);
  const titulo = texto(cuerpo.titulo, 200).trim();
  if (titulo.length < 5) return json({ error: "Escribe la instrucción (mínimo 5 letras)." }, 400);
  const r = await env.DB.prepare("INSERT INTO agent_tasks (division_id, agente_id, titulo, descripcion, prioridad, creada_por) VALUES (?, ?, ?, ?, ?, 'propietario')")
    .bind(a.division_id ?? "relatos", id, titulo, texto(cuerpo.descripcion, 6000), ["alta", "media", "baja"].includes(String(cuerpo.prioridad)) ? cuerpo.prioridad : "alta").run();
  await auditar(env, "instruccion-agente", { user_id: ses.user.id, actor: ses.user.correo, division: a.division_id, detalle: `${id}: ${titulo}` });
  // Acuse inmediato (automático, sin IA): cuándo la empieza. Jornadas cada hora en punto, de 07:00 a 22:00 de Ecuador.
  const prox = proximaJornada();
  await env.DB.prepare("INSERT INTO agent_events (agente_id, tarea_id, estado, mensaje) VALUES (?, ?, ?, ?)")
    .bind(id, r.meta.last_row_id, "pendiente", `📥 Recibí tu instrucción: «${titulo.slice(0, 120)}». La empiezo en la próxima jornada (${prox}).`).run();
  return json({ ok: true, id: r.meta.last_row_id, proxima: prox });
}
