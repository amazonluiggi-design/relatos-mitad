// Chat del propietario con cada agente (oficina virtual). Respuesta al instante con Workers AI en la voz del agente,
// usando SOLO datos reales del panel. Si el mensaje es una orden de trabajo, el agente la convierte en tarea real
// (la ejecuta el equipo en la siguiente jornada de Claude Code). Cada mensaje se anota en el presupuesto.
import { auditar, type Sesion } from "./auth";
import { proximaJornada } from "./agentes";
import { registrarGasto, verificarGasto } from "./sentinel";
import type { Env } from "./tipos";
import { informeDia } from "./vivo";

const MODELO = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const COSTO = 0.002; // USD estimado por respuesta (precio de lista de Workers AI, con margen)

const CARACTER: Record<string, string> = {
  michael: "Director general. Seguro, cercano y ejecutivo. Habla de prioridades, de quién hace qué y de resultados.",
  sentinel: "Jefe de seguridad. Sereno, preciso y un poco reservado. Habla de riesgos y controles.",
  andy: "Investigador. Curioso y entusiasta con los datos y las fuentes. Cuenta lo que encontró.",
  oscar: "Analista. Metódico; habla con medianas y muestras y separa hipótesis de hechos.",
  ryan: "Guionista. Creativo y apasionado por las leyendas; propone ganchos y giros.",
  kelly: "Marketing. Enérgica y práctica; piensa en títulos, ganchos y en qué red funciona qué.",
  jim: "Producción audiovisual. Técnico y tranquilo; habla de escenas, ritmo, render y recursos.",
  dwight: "Control de calidad. Exigente y directo; puntúa y señala errores concretos.",
  pam: "Distribución. Organizada y amable; habla de horarios, agenda y orden de publicación.",
  angela: "Finanzas. Prudente y clara con los números del presupuesto.",
};

export async function historial(env: Env, id: string) {
  return (await env.DB.prepare("SELECT id, rol, texto, tarea_id, cuando FROM agent_chats WHERE agente_id = ? ORDER BY id DESC LIMIT 40").bind(id).all()).results.reverse();
}

/** Para la ventana de chat: mensajes + lo que el agente va haciendo (sus eventos), y su estado actual. */
export async function conversacion(env: Env, id: string) {
  const [mensajes, actividad, ahora] = await Promise.all([historial(env, id),
    // Lo suyo + las órdenes que Michael le pasó ("Asignó a <id>: …"), para ver que le llegó.
    env.DB.prepare("SELECT id, cuando, estado, mensaje, agente_id FROM agent_events WHERE agente_id = ?1 OR (agente_id = 'michael' AND ?1 != 'michael' AND mensaje LIKE 'Asignó a ' || ?1 || ':%') ORDER BY id DESC LIMIT 15").bind(id).all(),
    env.DB.prepare("SELECT a.estado, t.titulo tarea FROM agents a LEFT JOIN agent_tasks t ON t.id = a.tarea_actual WHERE a.id = ?").bind(id).first()]);
  return { mensajes, actividad: actividad.results.reverse(), ahora };
}

/** Lo que el agente sabe para contestar: su trabajo real y las cifras clave. */
async function contexto(env: Env, id: string) {
  const [yo, tareas, eventos, cuentas, agenda, equipo, hoy] = await Promise.all([
    env.DB.prepare("SELECT a.nombre, a.cargo, a.estado, t.titulo tarea FROM agents a LEFT JOIN agent_tasks t ON t.id = a.tarea_actual WHERE a.id = ?").bind(id).first<{ nombre: string; cargo: string; estado: string; tarea: string | null }>(),
    env.DB.prepare("SELECT id, titulo, estado, calidad, creada_por, substr(resultado, 1, 500) resultado FROM agent_tasks WHERE agente_id = ? ORDER BY id DESC LIMIT 5").bind(id).all(),
    env.DB.prepare("SELECT cuando, mensaje FROM agent_events WHERE agente_id = ? ORDER BY id DESC LIMIT 6").bind(id).all(),
    env.DB.prepare("SELECT c.red, c.seguidores, c.vistas_totales FROM cuentas_hist c JOIN (SELECT red, MAX(momento) mx FROM cuentas_hist GROUP BY red) u ON u.red = c.red AND u.mx = c.momento").all(),
    env.DB.prepare(`SELECT p.red, p.cuando, v.titulo FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      AND p.estado NOT IN ('publicado','descartado','retenido') ORDER BY p.cuando LIMIT 6`).all(),
    id === "michael" ? env.DB.prepare("SELECT a.nombre, a.estado, (SELECT COUNT(*) FROM agent_tasks WHERE agente_id = a.id AND estado IN ('pendiente','en-curso','en-revision')) abiertas FROM agents a WHERE a.activo = 1").all() : null,
    informeDia(env, null),
  ]);
  // Lo hecho HOY por el equipo (para "¿qué hicieron hoy?").
  const lo_de_hoy = { tareas: hoy.tareas.map((t) => ({ agente: t.nombre, titulo: t.titulo, estado: t.estado, calidad: t.calidad })),
    cambios_en_redes: hoy.cambios.map((x) => `${x.actor}: ${String(x.detalle).slice(0, 140)}`), publicadas_hoy: hoy.publicadas.map((p) => `${p.red}: ${p.titulo}`) };
  return { yo, lo_de_hoy, tareas: tareas.results, eventos: eventos.results, cuentas: cuentas.results, proximas_publicaciones: agenda.results, equipo: equipo?.results ?? null,
    hora_ecuador: new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 16).replace("T", " "), proxima_jornada: proximaJornada() };
}

export async function enviar(env: Env, ses: Sesion, id: string, texto: string) {
  const limpio = (texto || "").trim().slice(0, 1500);
  if (!limpio) return { error: "Escribe un mensaje." };
  const a = await env.DB.prepare("SELECT nombre, activo FROM agents WHERE id = ?").bind(id).first<{ nombre: string; activo: number }>();
  if (!a) return { error: "no existe" };
  if (!a.activo) return { error: `${a.nombre} todavía no está activado.` };
  const permiso = await verificarGasto(env, "workers-ai", COSTO, "relatos");
  if (!permiso.ok) return { error: `No puedo responder ahora: ${permiso.motivo}` };

  await env.DB.prepare("INSERT INTO agent_chats (agente_id, rol, texto) VALUES (?, 'dueño', ?)").bind(id, limpio).run();
  const previos = await historial(env, id);
  const ctx = await contexto(env, id);
  const sistema = `Eres ${ctx.yo?.nombre}, ${ctx.yo?.cargo} en RELATOS AI MEDIA AGENCY (canal "Relatos de la Mitad": leyendas, misterios y tesoros de Ecuador y Latinoamérica, en Facebook, YouTube y TikTok).
Hablas con Luiggi, el dueño y CEO, por el chat de la oficina. Tu forma de ser: ${CARACTER[id] || "profesional y cercano"}.
Cómo respondes:
- Como una persona real del equipo: natural, cálido, en español de Ecuador, de tú, con 1 a 4 frases. Sin listas largas ni formato técnico.
- Solo usas cifras y hechos de DATOS. Si algo no está en DATOS, dices que lo revisas y no inventas.
- Eres un agente de inteligencia artificial del equipo. No lo anuncias en cada mensaje, pero si Luiggi te pregunta, lo dices con honestidad.
- Puedes investigar, analizar, escribir guiones y textos, revisar calidad, mover horarios y textos de publicaciones ya programadas y retener videos. No subes videos nuevos ni gastas dinero.
- Escribe la línea TAREA SOLO si Luiggi te pide de forma explícita un trabajo nuevo (haz, prepara, escribe, revisa, cambia, analiza, investiga…). Entonces confírmalo con tus palabras, di cuándo lo haces (${ctx.proxima_jornada}) y en la ÚLTIMA línea escribe exactamente: TAREA: <título corto de la tarea>
- Si saluda, pregunta cómo van las cosas o conversa, responde con DATOS y NO escribas TAREA ni prometas trabajos que no te pidió.
DATOS (reales, JSON): ${JSON.stringify(ctx)}`;
  const mensajes = [{ role: "system", content: sistema },
    ...previos.slice(-14).map((m) => ({ role: (m as { rol: string }).rol === "dueño" ? "user" : "assistant", content: String((m as { texto: string }).texto) }))];
  let respuesta = "";
  try {
    const r = (await env.AI.run(MODELO as Parameters<Ai["run"]>[0], { messages: mensajes, max_tokens: 450, temperature: 0.6 } as never)) as { response?: string };
    respuesta = (r.response || "").trim();
  } catch (e) {
    return { error: `No pude responder: ${String(e).slice(0, 160)}` };
  }
  if (!respuesta) return { error: "No pude responder, intenta de nuevo." };
  await registrarGasto(env, { proveedor: "workers-ai", concepto: `Chat con ${a.nombre}`, monto: COSTO, tipo: "estimado", unidades: 1, unidad: "mensaje", agente: id, division: "relatos" });

  // ¿Pidió un trabajo? → tarea real para la jornada.
  let tareaId: number | null = null;
  const m = /^\s*TAREA:\s*(.{5,200})\s*$/im.exec(respuesta);
  if (m) {
    respuesta = respuesta.replace(m[0], "").trim();
    const t = await env.DB.prepare("INSERT INTO agent_tasks (division_id, agente_id, titulo, descripcion, prioridad, creada_por) VALUES ('relatos', ?, ?, ?, 'alta', 'propietario')")
      .bind(id, m[1].trim(), `Pedido por Luiggi en el chat: «${limpio}»`).run();
    tareaId = t.meta.last_row_id as number;
    await env.DB.prepare("INSERT INTO agent_events (agente_id, tarea_id, estado, mensaje) VALUES (?, ?, 'pendiente', ?)").bind(id, tareaId, `📥 Anotó del chat: «${m[1].trim().slice(0, 120)}» (${proximaJornada()})`).run();
    await auditar(env, "instruccion-agente", { user_id: ses.user.id, actor: ses.user.correo, division: "relatos", detalle: `${id} (chat): ${m[1].trim()}` });
  }
  const ins = await env.DB.prepare("INSERT INTO agent_chats (agente_id, rol, texto, tarea_id) VALUES (?, 'agente', ?, ?)").bind(id, respuesta, tareaId).run();
  return { ok: true, mensaje: { id: ins.meta.last_row_id, rol: "agente", texto: respuesta, tarea_id: tareaId, cuando: new Date().toISOString().replace("T", " ").slice(0, 19) } };
}
