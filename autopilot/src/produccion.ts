// Producción de videos pedida por los agentes. Michael o Jim mandan un guion ya aprobado por Dwight;
// la fábrica en la nube (scripts/producir.mjs en GitHub Actions) lo convierte en voz, imágenes, render y programación.
// Topes: letras de voz (créditos ElevenLabs), escenas (imágenes ≈ $0,03 c/u), pedidos abiertos y por semana.
import type { Env } from "./tipos";

const MOVS = ["acercar", "alejar", "derecha", "izquierda", "abajo", "arriba", "subir"];
const MAX_LETRAS = 6000;
const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type Escena = { id: string; texto: string; img: string; mov: string };
type Reel = { id: string; gancho: string; escenas: string[]; cierre: string; cuando: string; texto: string; titulo_yt: string };

/** Valida y normaliza el guion. Devuelve el guion limpio o el motivo del rechazo (que el agente lee y corrige). */
export function validarGuion(g: Record<string, unknown>, ahora = Date.now()): { guion?: Record<string, unknown>; error?: string } {
  const id = s(g.id, 40);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || id.length < 3) return { error: "id: slug en minúsculas con guiones (ej. tesoro-lima)" };
  const titulo = s(g.titulo, 120), estilo = s(g.estilo, 600);
  if (titulo.length < 5) return { error: "titulo" };
  if (estilo.length < 20) return { error: "estilo: sufijo de prompt en inglés para todas las imágenes (cine, luz, sin texto)" };
  if (!Array.isArray(g.escenas) || g.escenas.length < 3 || g.escenas.length > 60) return { error: "escenas: entre 3 y 60" };
  const escenas: Escena[] = [];
  for (const e of g.escenas as Record<string, unknown>[]) {
    const x = { id: s(e?.id, 8), texto: s(e?.texto, 400), img: s(e?.img, 600), mov: MOVS.includes(String(e?.mov)) ? String(e.mov) : "acercar" };
    if (!/^[a-z][0-9]{1,2}$/.test(x.id)) return { error: `escena ${x.id || "?"}: id = letra de sección + número (g1, c2…)` };
    if (escenas.some((y) => y.id === x.id)) return { error: `escena ${x.id} repetida` };
    // Antes se cortaba en silencio a 400 letras (frase a medias). Una imagen quieta más de ~16 s hace que la gente se vaya.
    const largoTexto = String(e?.texto ?? "").trim().length;
    if (largoTexto > 240) return { error: `escena ${x.id}: ${largoTexto} letras de narración; máximo 240 por escena (una idea = una imagen: pártela en dos escenas)` };
    if (x.texto.length < 10 || x.img.length < 15) return { error: `escena ${x.id}: falta texto (narración) o img (prompt en inglés)` };
    escenas.push(x);
  }
  const letras = escenas.reduce((a, e) => a + e.texto.length, 0);
  if (letras > MAX_LETRAS) return { error: `la narración tiene ${letras} letras; máximo ${MAX_LETRAS} (créditos de voz)` };
  const ids = new Set(escenas.map((e) => e.id));
  const fecha = (v: unknown, que: string) => {
    const t = Date.parse(s(v, 40));
    if (!/[+-]\d\d:\d\d$|Z$/.test(s(v, 40)) || isNaN(t)) return `${que}: fecha ISO con zona (ej. 2026-11-20T19:30:00-05:00)`;
    if (t < ahora + 4 * 3600e3) return `${que}: al menos 4 h en el futuro (voz + render tardan)`;
    if (t > ahora + 45 * 86400e3) return `${que}: máximo 45 días adelante`;
    return "";
  };
  if (!Array.isArray(g.reels) || g.reels.length > 12) return { error: "reels: lista de 0 a 12" };
  const reels: Reel[] = [];
  for (const [i, r] of (g.reels as Record<string, unknown>[]).entries()) {
    const x = { id: `reel${i + 1}`, gancho: s(r?.gancho, 90), escenas: Array.isArray(r?.escenas) ? (r.escenas as unknown[]).map(String) : [], cierre: s(r?.cierre, 60) || "Historia completa en el canal",
      cuando: s(r?.cuando, 40), texto: s(r?.texto, 2000), titulo_yt: s(r?.titulo_yt, 100) };
    if (x.gancho.length < 5 || x.texto.length < 20 || x.titulo_yt.length < 5) return { error: `reel ${i + 1}: falta gancho, texto (descripción FB) o titulo_yt` };
    if (x.escenas.length < 2 || x.escenas.length > 8 || x.escenas.some((e) => !ids.has(e))) return { error: `reel ${i + 1}: de 2 a 8 escenas que existan en el guion` };
    // Lo que hace que un reel retenga se exige aquí, no solo en el manual.
    const palabras = x.gancho.split(/\s+/).length;
    if (palabras > 9) return { error: `reel ${i + 1}: el gancho en pantalla tiene ${palabras} palabras; máximo 9 (se lee en 2 segundos)` };
    const dura = x.escenas.reduce((a, id) => a + (escenas.find((y) => y.id === id)?.texto.length || 0), 0);
    if (dura < 130 || dura > 700) return { error: `reel ${i + 1}: su narración suma ${dura} letras (~${Math.round(dura / 14)} s); un reel va de 130 a 700 letras (10 a 50 s)` };
    if (reels.some((y) => y.gancho.toLowerCase() === x.gancho.toLowerCase())) return { error: `reel ${i + 1}: repite el gancho de otro reel; cada reel necesita el suyo` };
    const f = fecha(x.cuando, `reel ${i + 1}`); if (f) return { error: f };
    reels.push(x);
  }
  let largo: Record<string, unknown> | null = null;
  if (g.largo) {
    const l = g.largo as Record<string, unknown>;
    largo = { cuando: s(l.cuando, 40), texto: s(l.texto, 3000), titulo_yt: s(l.titulo_yt, 100), descripcion_yt: s(l.descripcion_yt, 4000),
      etiquetas: Array.isArray(l.etiquetas) ? (l.etiquetas as unknown[]).map((x) => s(x, 40)).filter(Boolean).slice(0, 15) : [] };
    const f = fecha(largo.cuando, "largo"); if (f) return { error: f };
    if (String(largo.texto).length < 20 || String(largo.titulo_yt).length < 5 || String(largo.descripcion_yt).length < 50) return { error: "largo: falta texto, titulo_yt o descripcion_yt" };
    if (letras < 1500) return { error: "largo: una historia larga necesita al menos 1.500 letras de narración" };
  }
  if (!largo && !reels.length) return { error: "nada que publicar: pon largo y/o reels" };
  const m = (g.miniatura || {}) as Record<string, unknown>;
  const miniatura = { cara: ids.has(String(m.cara)) ? String(m.cara) : escenas[0].id, fondo: ids.has(String(m.fondo)) ? String(m.fondo) : escenas[1].id,
    linea1: s(m.linea1, 14).toUpperCase() || titulo.split(" ")[0].toUpperCase(), linea2: s(m.linea2, 14).toUpperCase(), dato: s(m.dato, 40).toUpperCase() };
  const c = (g.cartel || {}) as Record<string, unknown>;
  const cartel = ids.has(String(c.en)) ? { en: String(c.en), titulo: s(c.titulo, 40).toUpperCase() || titulo.toUpperCase(), sub: s(c.sub, 60) } : null;
  const capitulos = Object.fromEntries(Object.entries((g.capitulos || {}) as Record<string, unknown>).filter(([k]) => ids.has(k)).map(([k, v]) => [k, s(v, 40)]).slice(0, 12));
  return { guion: { id, titulo, estilo, escenas, reels, largo, miniatura, cartel, capitulos, letras } };
}

/** POST /api/agentes/produccion (Michael o Jim). */
export async function pedirProduccion(env: Env, agente: string, division: string, cuerpo: Record<string, unknown>) {
  if (!["michael", "jim"].includes(agente)) return { status: 403, error: "Solo Michael o Jim piden producciones." };
  if (division !== "relatos") return { status: 400, error: "La fábrica de video es de la división relatos." };
  const tarea = await env.DB.prepare("SELECT id, estado, calidad FROM agent_tasks WHERE id = ?").bind(Number(cuerpo.tarea_id) || 0).first<{ estado: string; calidad: number | null }>();
  if (!tarea || tarea.estado !== "hecha" || (tarea.calidad ?? 0) < 85) return { status: 400, error: "tarea_id: la tarea del guion debe estar aprobada por Dwight (hecha, calidad >= 85)." };
  const v = validarGuion((cuerpo.guion || {}) as Record<string, unknown>);
  if (v.error) return { status: 400, error: `Guion no válido: ${v.error}` };
  const g = v.guion!;
  const [existe, abiertas, semana] = await Promise.all([
    env.DB.prepare("SELECT (SELECT COUNT(*) FROM producciones WHERE id = ?1) + (SELECT COUNT(*) FROM historias WHERE id = ?1) n").bind(g.id).first<number>("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM producciones WHERE estado IN ('pedida','produciendo','renderizando')").first<number>("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM producciones WHERE creada >= datetime('now', '-7 days')").first<number>("n"),
  ]);
  if (existe) return { status: 409, error: `Ya existe una historia o producción con id ${g.id}.` };
  if ((abiertas || 0) >= 2) return { status: 429, error: "Ya hay 2 producciones en curso: espera a que terminen." };
  if ((semana || 0) >= 4) return { status: 429, error: "Tope de 4 producciones por semana." };
  await env.DB.prepare("INSERT INTO producciones (id, division_id, guion, tarea_id, pedida_por) VALUES (?, 'relatos', ?, ?, ?)").bind(g.id, JSON.stringify(g), Number(cuerpo.tarea_id), agente).run();
  return { status: 200, ok: true, id: g.id, letras: g.letras, aviso: "La fábrica lo toma en menos de 1 h; voz + imágenes + render tardan 1-3 h. Sigue el estado en el contexto (producciones)." };
}

export const listaProducciones = async (env: Env) =>
  (await env.DB.prepare("SELECT id, estado, detalle, pedida_por, creada, actualizada FROM producciones ORDER BY creada DESC LIMIT 10").all()).results;

/** Rutas de la fábrica (solo con la clave de scripts): tomar el siguiente pedido y reportar su estado. */
export async function fabricaProduccion(env: Env, req: Request, ruta: string) {
  if (ruta === "/fabrica/produccion/pendientes" && req.method === "GET")
    return Response.json({ n: await env.DB.prepare("SELECT COUNT(*) n FROM producciones WHERE estado = 'pedida'").first<number>("n") });
  if (ruta === "/fabrica/produccion/siguiente" && req.method === "POST") {
    const p = await env.DB.prepare("SELECT id, guion FROM producciones WHERE estado = 'pedida' ORDER BY creada LIMIT 1").first<{ id: string; guion: string }>();
    if (!p) return Response.json({ produccion: null });
    const r = await env.DB.prepare("UPDATE producciones SET estado = 'produciendo', actualizada = datetime('now') WHERE id = ? AND estado = 'pedida'").bind(p.id).run();
    return Response.json({ produccion: r.meta.changes ? { id: p.id, guion: JSON.parse(p.guion) } : null });
  }
  const m = /^\/fabrica\/produccion\/([a-z0-9-]+)$/.exec(ruta);
  if (m && req.method === "POST") {
    const b = (await req.json()) as { estado?: string; detalle?: string };
    if (!["produciendo", "renderizando", "lista", "error"].includes(String(b.estado))) return Response.json({ error: "estado" }, { status: 400 });
    const r = await env.DB.prepare("UPDATE producciones SET estado = ?, detalle = ?, actualizada = datetime('now') WHERE id = ?").bind(b.estado, s(b.detalle, 1000) || null, m[1]).run();
    if (r.meta.changes) {
      const quien = b.estado === "error" ? "error" : b.estado === "lista" ? "disponible" : "produciendo";
      await env.DB.prepare("INSERT INTO agent_events (agente_id, estado, mensaje) VALUES ('jim', ?, ?)")
        .bind(quien, `🎬 Producción ${m[1]}: ${b.estado}${b.detalle ? ` — ${s(b.detalle, 200)}` : ""}`).run();
    }
    return Response.json({ ok: !!r.meta.changes });
  }
  return null;
}
