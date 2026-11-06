// Relatos Autopilot: panel privado + publicador y estadísticas en la nube (Cloudflare).
// Cron cada 5 min: publica en TikTok lo que venció y revisa estados. Cada hora (minuto 0-4): estadísticas de las 3 redes.
import { auditar, eventoSeguridad, leerSesion, login, mfa, misSesiones, salir, salirDeTodo } from "./auth";
import { resumenGrupo } from "./grupo";
import { datosGaming, guardarCreador, guardarDerecho, guardarMarca } from "./gaming";
import { apiAgentes, fichaAgente, instruccion, listaAgentes, verMemoria, verTarea } from "./agentes";
import { cambiarDetener, detenido, estadoPresupuesto, hacerRespaldo, informeSentinel, leerDetener, registrarGasto, revisionDiaria, suscripcionesDelMes, validarSql, verificarGasto } from "./sentinel";
import { pngResumen } from "./imagen";
import { entrarDesdePortal, leerPase } from "./portal";
import { publicarTikTok, revisarTikTok, sincronizarFacebook, sincronizarTikTok, sincronizarYouTube, historiaFacebook, comentariosPendientes } from "./redes";
import { type Env, type Pub, evento } from "./tipos";
import { aprobar, canjear, creador, urlConectar } from "./tiktok-ui";

async function pubs(env: Env, where = "1=1", ...args: unknown[]) {
  return (await env.DB.prepare(`SELECT * FROM publicaciones WHERE ${where} ORDER BY cuando`).bind(...args).all<Pub>()).results;
}

async function publicarPendientes(env: Env) {
  if ((await env.DB.prepare("SELECT valor FROM config WHERE clave = 'pausa'").first<string>("valor")) === "1") return;
  if (await detenido(env, "relatos", "publicaciones")) return;
  for (const p of await pubs(env, "red = 'tiktok' AND estado IN ('pendiente', 'enviado') AND cuando <= ?", new Date().toISOString())) {
    try {
      if (p.estado === "pendiente") {
        // Se cuenta el intento ANTES de enviar: si dos ciclos se cruzan, no se duplica.
        const r = await env.DB.prepare("UPDATE publicaciones SET intentos = intentos + 1 WHERE id = ? AND estado = 'pendiente' AND intentos = ?").bind(p.id, p.intentos).run();
        if (!r.meta.changes) continue;
        if (p.intentos >= 3) {
          await env.DB.prepare("UPDATE publicaciones SET estado = 'fallido' WHERE id = ?").bind(p.id).run();
          await evento(env, `Se dejó de intentar ${p.id} tras 3 fallos: ${p.error}`, "error", "tiktok");
          continue;
        }
        const v = await env.DB.prepare("SELECT archivo, calidad FROM videos WHERE id = ?").bind(p.video_id).first<{ archivo: string; calidad: string }>();
        if (v?.calidad === "bloqueado") { await evento(env, `No se publica ${p.id}: control de calidad bloqueado`, "aviso", "tiktok"); continue; }
        await publicarTikTok(env, p, v!.archivo);
      } else {
        await revisarTikTok(env, p);
      }
    } catch (e) {
      await env.DB.prepare("UPDATE publicaciones SET error = ? WHERE id = ?").bind(String(e).slice(0, 300), p.id).run();
      await evento(env, `Error con ${p.id}: ${String(e).slice(0, 200)}`, "error", "tiktok");
    }
  }
}

async function sincronizar(env: Env) {
  // TikTok programado a mano en TikTok Studio (app sin auditar): pasa a publicado al llegar su hora.
  await env.DB.prepare("UPDATE publicaciones SET estado = 'publicado', publicado_en = cuando WHERE red = 'tiktok' AND estado = 'programado' AND externo_id IS NULL AND cuando <= ?")
    .bind(new Date().toISOString()).run();
  const todas = await pubs(env, "estado != 'pendiente'");
  const tareas: [string, () => Promise<unknown>][] = [
    ["youtube", () => sincronizarYouTube(env, todas.filter((p) => p.red === "youtube"))],
    ["facebook", () => sincronizarFacebook(env, todas.filter((p) => p.red === "facebook"))],
    ["tiktok", () => sincronizarTikTok(env, todas.filter((p) => p.red === "tiktok"))],
  ];
  for (const [red, f] of tareas) {
    try { await f(); } catch (e) { await evento(env, `No se pudieron leer las estadísticas: ${String(e).slice(0, 200)}`, "error", red); }
  }
  // Una historia pasa a "publicada" cuando su video largo ya salió en alguna red.
  await env.DB.prepare(`UPDATE historias SET estado = 'publicado' WHERE estado = 'listo' AND id IN (
      SELECT v.historia_id FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE v.tipo = 'largo' AND p.estado = 'publicado')`).run();
  await env.KV.put("ultima-sync", new Date().toISOString());
}

/* ───────────── API del panel ───────────── */
async function resumen(env: Env) {
  const redes = ["facebook", "youtube", "tiktok"];
  const cuentas: Record<string, unknown> = {};
  for (const r of redes) {
    const ult = await env.DB.prepare("SELECT * FROM cuentas_hist WHERE red = ? ORDER BY momento DESC LIMIT 1").bind(r).first();
    const hace7 = await env.DB.prepare("SELECT seguidores FROM cuentas_hist WHERE red = ? AND momento <= datetime('now', '-7 days') ORDER BY momento DESC LIMIT 1").bind(r).first<number>("seguidores");
    const vistas = await env.DB.prepare(`SELECT SUM(m.vistas) v, SUM(m.me_gusta) l, SUM(m.comentarios) c FROM metricas m
      JOIN (SELECT pub_id, MAX(momento) mx FROM metricas GROUP BY pub_id) u ON u.pub_id = m.pub_id AND u.mx = m.momento
      JOIN publicaciones p ON p.id = m.pub_id WHERE p.red = ?`).bind(r).first<{ v: number; l: number; c: number }>();
    const cuenta = await env.DB.prepare("SELECT SUM(estado IN ('publicado','privado')) pub, SUM(estado IN ('pendiente','programado','enviado')) prox, SUM(estado = 'fallido') fal FROM publicaciones WHERE red = ?").bind(r).first();
    cuentas[r] = { ultimo: ult, seguidores_7d: hace7 ?? null, vistas: vistas?.v ?? null, me_gusta: vistas?.l ?? null, comentarios: vistas?.c ?? null, ...cuenta };
  }
  return {
    pausa: (await env.DB.prepare("SELECT valor FROM config WHERE clave = 'pausa'").first<string>("valor")) === "1",
    ultima_sync: await env.KV.get("ultima-sync"),
    cuentas,
    eventos: (await env.DB.prepare("SELECT * FROM eventos ORDER BY id DESC LIMIT 40").all()).results,
  };
}

async function listaPublicaciones(env: Env) {
  return (await env.DB.prepare(`SELECT p.*, v.titulo, v.tipo, v.historia_id, v.archivo, v.miniatura, v.calidad,
      (SELECT vistas FROM metricas WHERE pub_id = p.id ORDER BY momento DESC LIMIT 1) vistas,
      (SELECT me_gusta FROM metricas WHERE pub_id = p.id ORDER BY momento DESC LIMIT 1) me_gusta,
      (SELECT comentarios FROM metricas WHERE pub_id = p.id ORDER BY momento DESC LIMIT 1) comentarios
    FROM publicaciones p JOIN videos v ON v.id = p.video_id ORDER BY p.cuando`).all()).results;
}

async function serie(env: Env) {
  // Vistas acumuladas por día y red (último dato de cada publicación en cada día).
  return (await env.DB.prepare(`SELECT substr(m.momento, 1, 10) dia, p.red, SUM(m.vistas) vistas FROM metricas m
      JOIN (SELECT pub_id, substr(momento, 1, 10) d, MAX(momento) mx FROM metricas GROUP BY pub_id, d) u ON u.pub_id = m.pub_id AND u.mx = m.momento
      JOIN publicaciones p ON p.id = m.pub_id GROUP BY dia, p.red ORDER BY dia`).all()).results;
}

/** Datos para la vista de crecimiento: historial de cuentas y cada publicación con su ritmo de las últimas 24 h. */
async function crecimiento(env: Env) {
  const cuentas = (await env.DB.prepare(`SELECT c.red, substr(c.momento, 1, 10) dia, c.seguidores, c.vistas_totales FROM cuentas_hist c
      JOIN (SELECT red, substr(momento, 1, 10) d, MAX(momento) mx FROM cuentas_hist GROUP BY red, d) u ON u.red = c.red AND u.mx = c.momento ORDER BY dia`).all()).results;
  const pubs = (await env.DB.prepare(`SELECT p.id, p.red, p.estado, p.cuando, p.publicado_en, p.url, v.id video_id, v.titulo, v.gancho, v.tipo, v.historia_id, v.duracion,
      m.vistas, m.me_gusta, m.comentarios, m.compartidos, m.extra, m.momento,
      (SELECT vistas FROM metricas WHERE pub_id = p.id AND momento <= strftime('%Y-%m-%dT%H:00', 'now', '-24 hours') ORDER BY momento DESC LIMIT 1) vistas_24h
    FROM publicaciones p JOIN videos v ON v.id = p.video_id
    LEFT JOIN metricas m ON m.pub_id = p.id AND m.momento = (SELECT MAX(momento) FROM metricas WHERE pub_id = p.id)
    WHERE p.estado IN ('publicado', 'privado') AND v.id NOT LIKE 'demo%' ORDER BY p.cuando`).all()).results;
  const recomendaciones = (await env.DB.prepare("SELECT * FROM recomendaciones WHERE estado != 'descartado' ORDER BY estado = 'hecho', CASE prioridad WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END, id DESC").all()).results;
  // Lo que sale en los próximos 7 días (para ver huecos y el orden de las historias).
  const proximas = (await env.DB.prepare(`SELECT p.red, p.estado, p.cuando, v.id video_id, v.titulo, v.tipo, v.historia_id FROM publicaciones p JOIN videos v ON v.id = p.video_id
    WHERE p.cuando > strftime('%Y-%m-%dT%H:%M:%fZ', 'now') AND p.cuando < strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '+7 days') AND v.id NOT LIKE 'demo%' ORDER BY p.cuando`).all()).results;
  return { cuentas, pubs, recomendaciones, serie: await serie(env), proximas };
}

async function medio(env: Env, req: Request, clave: string) {
  const rango = req.headers.get("range");
  const obj = await env.VIDEOS.get(clave, rango ? { range: req.headers } : undefined);
  if (!obj) return new Response("no", { status: 404 });
  const h = new Headers({ "Content-Type": obj.httpMetadata?.contentType || "application/octet-stream", "Accept-Ranges": "bytes", "Cache-Control": "private, max-age=3600" });
  if (rango && obj.range && "offset" in obj.range) {
    const ini = obj.range.offset ?? 0, largo = obj.range.length ?? obj.size - ini;
    h.set("Content-Range", `bytes ${ini}-${ini + largo - 1}/${obj.size}`);
    h.set("Content-Length", String(largo));
    return new Response(obj.body, { status: 206, headers: h });
  }
  h.set("Content-Length", String(obj.size));
  return new Response(obj.body, { headers: h });
}

/** Cifras compactas para la tarjeta de Relatos en el portal de empresas. */
async function resumenPortal(env: Env) {
  const cuenta = async (red: string) => (await env.DB.prepare("SELECT seguidores FROM cuentas_hist WHERE red = ? ORDER BY momento DESC LIMIT 1").bind(red).first<number>("seguidores")) ?? 0;
  const vistas = await env.DB.prepare(`SELECT COALESCE(SUM(m.vistas), 0) v FROM metricas m
      JOIN (SELECT pub_id, MAX(momento) mx FROM metricas GROUP BY pub_id) u ON u.pub_id = m.pub_id AND u.mx = m.momento`).first<number>("v");
  const pubs = await env.DB.prepare(`SELECT SUM(estado IN ('publicado','privado')) publicados, SUM(estado IN ('pendiente','programado','enviado')) agenda,
      SUM(estado = 'fallido') fallidos FROM publicaciones`).first<{ publicados: number; agenda: number; fallidos: number }>();
  const proxima = await env.DB.prepare("SELECT p.cuando, v.titulo FROM publicaciones p JOIN videos v ON v.id = p.video_id WHERE p.estado IN ('pendiente','programado') ORDER BY p.cuando LIMIT 1").first<{ cuando: string; titulo: string }>();
  const errores24h = await env.DB.prepare("SELECT COUNT(*) n FROM eventos WHERE nivel = 'error' AND cuando >= datetime('now', '-1 day')").first<number>("n");
  return {
    seguidores: { facebook: await cuenta("facebook"), youtube: await cuenta("youtube"), tiktok: await cuenta("tiktok") },
    vistas: vistas ?? 0, publicados: pubs?.publicados ?? 0, enAgenda: pubs?.agenda ?? 0, fallidos: pubs?.fallidos ?? 0,
    proxima: proxima ?? null, errores24h: errores24h ?? 0,
    pausa: (await env.DB.prepare("SELECT valor FROM config WHERE clave = 'pausa'").first<string>("valor")) === "1",
  };
}

const REDES_N: Record<string, string> = { youtube: "YouTube", tiktok: "TikTok", facebook: "Facebook" };
const ORO = /oro|tesoro|plata|mapa|millonari|riquez/i;

/** Datos de salud y del día (hora de Ecuador) para el monitor de WhatsApp y la imagen del resumen. */
async function datosSalud(env: Env) {
  const problemas: string[] = [];
  const fechaUtc = (s: string) => new Date(s.includes("T") ? (s.endsWith("Z") ? s : s + "Z") : s.replace(" ", "T") + "Z");
  const hace = (h: number) => new Date(Date.now() - h * 3600e3).toISOString().replace("T", " ").slice(0, 19);
  // Última actualización de estadísticas por red: un error de esa red ANTERIOR a eso ya está resuelto.
  const ultimas = Object.fromEntries((await env.DB.prepare("SELECT red, MAX(momento) m FROM cuentas_hist GROUP BY red").all<{ red: string; m: string }>()).results.map((x) => [x.red, x.m]));
  const errores = (await env.DB.prepare("SELECT red, mensaje, cuando FROM eventos WHERE nivel = 'error' AND cuando >= ? ORDER BY cuando DESC").bind(hace(2)).all<{ red: string | null; mensaje: string; cuando: string }>()).results
    // Las estadísticas se guardan por hora en punto: un dato de la misma hora del error ya cuenta como arreglado.
    .filter((e) => !(e.red && ultimas[e.red] && fechaUtc(ultimas[e.red]).getTime() >= Math.floor(fechaUtc(e.cuando).getTime() / 3600e3) * 3600e3));
  // Errores que se repiten (un 520 suelto de una red no es un problema).
  const clave = (m: string) => m.replace(/\d+/g, "#").slice(0, 80);
  const veces: Record<string, number> = {};
  for (const e of errores) veces[clave(e.mensaje)] = (veces[clave(e.mensaje)] || 0) + 1;
  for (const e of errores) if (veces[clave(e.mensaje)] >= 2 && !problemas.some((p) => p.startsWith(e.mensaje.slice(0, 40)))) problemas.push(e.mensaje.slice(0, 160));
  for (const [red, m] of Object.entries(ultimas)) if (fechaUtc(m).getTime() < Date.now() - 4 * 3600e3)
    problemas.push(`Las estadísticas de ${REDES_N[red] || red} no se actualizan desde el ${fechaUtc(m).toLocaleString("es-EC", { timeZone: "America/Guayaquil", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}`);
  // Sentinel: respaldo atrasado y botón de emergencia activo.
  const resp = await env.DB.prepare("SELECT cuando FROM backups WHERE estado = 'ok' ORDER BY id DESC LIMIT 1").first<string>("cuando");
  if (resp && Date.now() - fechaUtc(resp).getTime() > 30 * 3600e3) problemas.push("El respaldo diario de la base lleva más de 30 horas sin hacerse");
  const det = await leerDetener(env);
  const parados = Object.entries(det).filter(([k, v]) => v === true && k !== "cambiado").map(([k]) => k);
  if (parados.length) problemas.push(`Botón DETENER activo: ${parados.join(", ")}`);
  const fallidas = (await env.DB.prepare("SELECT COUNT(*) n FROM publicaciones WHERE estado IN ('fallido', 'privado') AND video_id NOT LIKE 'demo%' AND cuando >= ?").bind(new Date(Date.now() - 24 * 3600e3).toISOString()).first<{ n: number }>())?.n || 0;
  if (fallidas) problemas.push(`${fallidas} publicación(es) fallaron o quedaron en privado en las últimas 24 h`);
  // TikTok se programa desde la laptop (Studio): avisar si en 3 días hay algo sin programar.
  const tt = await env.DB.prepare("SELECT COUNT(*) n FROM publicaciones WHERE red = 'tiktok' AND estado = 'por-programar' AND cuando > ? AND cuando < ?").bind(new Date().toISOString(), new Date(Date.now() + 3 * 86400e3).toISOString()).first<{ n: number }>();
  if (tt?.n) problemas.push(`TikTok: ${tt.n} video(s) de los próximos 3 días sin programar. Prende la laptop y pide "programa TikTok"`);

  // Vistas por día de Ecuador: lo acumulado a cada medianoche (05:00 UTC), por red.
  const hoyEc = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  const medianoche = (k: number) => new Date(new Date(`${hoyEc}T05:00:00Z`).getTime() - k * 86400e3).toISOString().slice(0, 16);
  const acumulado = async (hasta: string | null) => Object.fromEntries((await env.DB.prepare(`SELECT p.red, SUM((SELECT vistas FROM metricas WHERE pub_id = p.id ${hasta ? "AND momento <= ?1" : ""} ORDER BY momento DESC LIMIT 1)) n
      FROM publicaciones p WHERE p.video_id NOT LIKE 'demo%' GROUP BY p.red`).bind(...(hasta ? [hasta] : [])).all<{ red: string; n: number | null }>()).results.map((x) => [x.red, x.n || 0]));
  const cortes = [await acumulado(null)];
  for (let k = 0; k <= 8; k++) cortes.push(await acumulado(medianoche(k)));
  const dia = (i: number) => Object.fromEntries(["youtube", "tiktok", "facebook"].map((r) => [r, Math.max(0, (cortes[i][r] || 0) - (cortes[i + 1][r] || 0))])) as Record<string, number>;
  // Hasta las 4 de la madrugada el resumen cuenta el día que acaba de terminar (no el que recién empieza).
  const atras = new Date(Date.now() - 5 * 3600e3).getUTCHours() < 4 ? 1 : 0;
  const vistas_hoy = dia(atras);
  const historial = Array.from({ length: 7 }, (_, i) => ({ dia: medianoche(i + 1 + atras).slice(0, 10), ...dia(i + 1 + atras) })).reverse();
  const total = (x: Record<string, number>) => (x.youtube || 0) + (x.tiktok || 0) + (x.facebook || 0);
  const dias = historial.map(total).filter((n) => n > 0);
  const promedio = dias.length ? dias.reduce((a, b) => a + b, 0) / dias.length : 0;
  const hoy = total(vistas_hoy), razon = promedio ? hoy / promedio : 1;
  const calificacion = razon >= 1.3 ? { nivel: "excelente", texto: "🔥 Excelente día" } : razon >= 0.8 ? { nivel: "bueno", texto: "👍 Buen día" } : razon >= 0.5 ? { nivel: "normal", texto: "😐 Día normal" } : { nivel: "flojo", texto: "📉 Día flojo" };
  const comparacion = promedio ? `${razon >= 1 ? "+" : ""}${Math.round((razon - 1) * 100)} % frente al promedio de 7 días, que es de ${Math.round(promedio).toLocaleString("es-EC")}` : "primeros días de medición";

  const seg = Object.fromEntries((await env.DB.prepare("SELECT c.red, c.seguidores FROM cuentas_hist c JOIN (SELECT red, MAX(momento) mx FROM cuentas_hist GROUP BY red) u ON u.red = c.red AND u.mx = c.momento").all<{ red: string; seguidores: number }>()).results.map((x) => [x.red, x.seguidores]));
  const seg_7 = Object.fromEntries((await env.DB.prepare("SELECT c.red, c.seguidores FROM cuentas_hist c JOIN (SELECT red, MAX(momento) mx FROM cuentas_hist WHERE momento <= ? GROUP BY red) u ON u.red = c.red AND u.mx = c.momento").bind(medianoche(7)).all<{ red: string; seguidores: number }>()).results.map((x) => [x.red, x.seguidores]));
  const top = (await env.DB.prepare(`SELECT v.titulo, p.red, m.vistas - COALESCE((SELECT vistas FROM metricas WHERE pub_id = p.id AND momento <= strftime('%Y-%m-%dT%H:00', 'now', '-24 hours') ORDER BY momento DESC LIMIT 1), 0) ritmo
      FROM publicaciones p JOIN videos v ON v.id = p.video_id JOIN metricas m ON m.pub_id = p.id AND m.momento = (SELECT MAX(momento) FROM metricas WHERE pub_id = p.id)
      WHERE p.estado = 'publicado' AND v.id NOT LIKE 'demo%' ORDER BY ritmo DESC LIMIT 3`).all<{ titulo: string; red: string; ritmo: number }>()).results;
  const manana = (await env.DB.prepare(`SELECT v.titulo, p.cuando, COUNT(*) redes FROM publicaciones p JOIN videos v ON v.id = p.video_id
      WHERE p.cuando >= ? AND p.cuando < ? AND v.id NOT LIKE 'demo%' GROUP BY v.id ORDER BY p.cuando`).bind(new Date(Date.parse(`${hoyEc}T05:00:00Z`) + 86400e3).toISOString(), new Date(Date.parse(`${hoyEc}T05:00:00Z`) + 2 * 86400e3).toISOString()).all<{ titulo: string; cuando: string; redes: number }>()).results;

  // Recomendación del día: una sola frase, a partir de los datos.
  const lider = (["youtube", "tiktok", "facebook"] as const).reduce((a, r) => (vistas_hoy[r] > vistas_hoy[a] ? r : a), "youtube");
  let recomendacion: string;
  if (tt?.n) recomendacion = "Prende la laptop y pídeme \"programa TikTok\": hay videos de los próximos días sin programar.";
  else if (top[0] && ORO.test(top[0].titulo)) recomendacion = `El oro sigue mandando: "${top[0].titulo}" fue lo más visto. Las próximas historias de tesoros van por ese camino.`;
  else if (razon < 0.8) recomendacion = `Día por debajo del promedio; es normal entre picos virales. ${manana[0] ? `Mañana sale "${manana[0].titulo}".` : ""}`.trim();
  else recomendacion = `${REDES_N[lider]} fue la red más fuerte hoy. Seguimos con el mismo ritmo de publicaciones.`;
  if (vistas_hoy.facebook < 20) recomendacion += " En Facebook, compartir los reels en grupos sigue siendo lo que más ayuda.";

  return { problemas, resumen: { dia: medianoche(atras).slice(0, 10), vistas_hoy, total_hoy: hoy, promedio_7: Math.round(promedio), comparacion, calificacion, historial, seguidores: seg, seguidores_7: seg_7, top, mejor: top[0] || null, manana: manana.length, recomendacion } };
}

/** Salud del autopiloto para el monitor de avisos por WhatsApp (público: solo problemas resumidos y cifras públicas).
 *  503 si algo necesita atención; "resumen" trae las cifras del día para el mensaje de la noche. */
async function salud(env: Env) {
  const d = await datosSalud(env);
  return Response.json({ ok: !d.problemas.length, ...d, imagen: "https://relatos-autopilot.probador-worker.workers.dev/api/salud/imagen.png" }, { status: d.problemas.length ? 503 : 200, headers: { "Cache-Control": "no-store" } });
}

async function api(env: Env, req: Request, url: URL) {
  const ruta = url.pathname.slice(4);
  // CSRF: todo POST del navegador debe venir del mismo origen (los scripts usan x-clave y no tienen Origin).
  const mismoOrigen = req.headers.get("origin") === url.origin;
  if ((ruta === "/login" || ruta.startsWith("/mfa/") || ruta === "/salir") && req.method === "POST" && !mismoOrigen) return Response.json({ error: "origen" }, { status: 403 });
  if (ruta === "/login" && req.method === "POST") return login(env, req);
  if (ruta.startsWith("/mfa/")) return mfa(env, req, ruta);
  if (ruta === "/salir" && req.method === "POST") return salir(env, req);
  // Se anota la última visita (para saber si el monitor de avisos está consultando).
  if (ruta.startsWith("/salud") && req.method === "GET") await env.KV.put(ruta === "/salud" ? "visita-salud" : "visita-imagen", JSON.stringify({ cuando: new Date().toISOString(), agente: (req.headers.get("user-agent") || "").slice(0, 60) }), { expirationTtl: 7 * 86400 });
  if (ruta === "/salud" && req.method === "GET") return salud(env);
  if (ruta === "/salud/imagen.png" && req.method === "GET") {
    const png = await pngResumen((await datosSalud(env)).resumen);
    return new Response(png, { headers: { "Content-Type": "image/png", "Cache-Control": "public, max-age=600" } });
  }
  // Portal de empresas: entrada con pase (sin contraseña) y cifras para su tablero.
  if (ruta === "/portal" && req.method === "POST") return entrarDesdePortal(env, req);
  if (ruta === "/portal/resumen" && req.method === "GET") {
    const pase = /^Portal (.+)$/.exec(req.headers.get("authorization") || "")?.[1];
    if (!pase || !(await leerPase(env, pase, "relatos-stats"))) return Response.json({ error: "pase" }, { status: 401 });
    return Response.json(await resumenPortal(env));
  }
  // Agentes (rutinas de Claude Code): su propia clave y solo sus rutas.
  // Se limpian espacios, saltos de línea y comillas que suelen colarse al pegar la clave en un formulario.
  const claveAgente = req.headers.get("x-agente")?.trim().replace(/^["'<`]+|["'>`]+$/g, "") ?? null;
  if (claveAgente !== null) {
    if (!env.AGENTE_CLAVE || claveAgente !== env.AGENTE_CLAVE.trim()) {
      // Diagnóstico sin revelar la clave: largo y huella (8 primeros hex del SHA-256).
      const huella = async (s: string) => Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)))).slice(0, 4).map((b) => b.toString(16).padStart(2, "0")).join("");
      await eventoSeguridad(env, "agente-clave-invalida", "alta", `${req.method} ${ruta} · largo ${claveAgente.length} · huella ${await huella(claveAgente)}`, req.headers.get("cf-connecting-ip"));
      return Response.json({ error: "clave de agente" }, { status: 401 });
    }
    if (!ruta.startsWith("/agentes/")) return Response.json({ error: "los agentes solo usan /api/agentes/*" }, { status: 403 });
    return apiAgentes(env, req, ruta, () => crecimiento(env));
  }
  const deScript = req.headers.get("x-clave") === env.CLAVE;
  const ses = deScript ? null : await leerSesion(env, req);
  if (!deScript && !ses) return Response.json({ error: "sin sesión" }, { status: 401 });
  // Protección CSRF: las escrituras desde el navegador deben venir del mismo origen.
  if (req.method !== "GET" && !deScript && !mismoOrigen) {
    await eventoSeguridad(env, "origen-invalido", "media", `${req.method} ${ruta} desde ${req.headers.get("origin") || "sin origen"}`, req.headers.get("cf-connecting-ip"));
    return Response.json({ error: "origen" }, { status: 403 });
  }

  /* ── Grupo ── */
  if (ruta === "/yo" && ses) return Response.json({ correo: ses.user.correo, nombre: ses.user.nombre, rol: ses.user.rol, origen: ses.origen,
    divisiones: (await env.DB.prepare("SELECT id, nombre, descripcion, estado FROM divisions ORDER BY id = 'relatos' DESC, creada, id").all()).results });
  if (ruta === "/grupo/resumen") return Response.json(await resumenGrupo(env, (await datosSalud(env)).problemas));
  /* ── Sentinel, presupuesto y botón de emergencia (solo el propietario con sesión; los scripts no pueden) ── */
  /* ── Gaming: marca, creadores y derechos (solo el propietario) ── */
  if (ruta === "/gaming" && ses && req.method === "GET") return Response.json(await datosGaming(env));
  if (ses && req.method === "POST" && ["/gaming/marca", "/gaming/creadores", "/gaming/derechos"].includes(ruta)) {
    if (ses.user.rol !== "propietario") return Response.json({ error: "Solo el propietario" }, { status: 403 });
    const cuerpo = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const r = ruta === "/gaming/marca" ? await guardarMarca(env, ses, cuerpo) : ruta === "/gaming/creadores" ? await guardarCreador(env, ses, cuerpo) : await guardarDerecho(env, ses, cuerpo);
    return Response.json(r, { status: (r as { error?: string }).error ? 400 : 200 });
  }

  /* ── Agentes (vista del propietario) ── */
  if (ruta === "/agentes" && ses) return Response.json(await listaAgentes(env));
  const fa = /^\/agentes\/([a-z-]+)$/.exec(ruta);
  if (fa && ses && req.method === "GET") { const f = await fichaAgente(env, fa[1]); return f ? Response.json(f) : Response.json({ error: "no existe" }, { status: 404 }); }
  const ia = /^\/agentes\/([a-z-]+)\/instruccion$/.exec(ruta);
  if (ia && ses && req.method === "POST") return instruccion(env, ses, ia[1], await req.json());
  const vt = /^\/tareas\/(\d+)$/.exec(ruta);
  if (vt && ses) return Response.json((await verTarea(env, +vt[1])) ?? { error: "no existe" });
  const vm = /^\/memoria\/(\d+)$/.exec(ruta);
  if (vm && ses) return Response.json((await verMemoria(env, +vm[1])) ?? { error: "no existe" });
  if (ruta === "/sentinel" && ses) return Response.json(await informeSentinel(env));
  if (ruta === "/presupuesto" && ses) return Response.json(await estadoPresupuesto(env));
  if (ruta === "/detener" && ses && req.method === "GET") return Response.json(await leerDetener(env));
  if (ruta === "/detener" && req.method === "POST") {
    if (!ses || ses.user.rol !== "propietario") return Response.json({ error: "Solo el propietario" }, { status: 403 });
    const { ambito, valor } = (await req.json()) as { ambito: string; valor: boolean };
    try { return Response.json(await cambiarDetener(env, ambito, !!valor, ses.user, req.headers.get("cf-connecting-ip"))); }
    catch (e) { return Response.json({ error: String(e) }, { status: 400 }); }
  }
  if (ruta === "/respaldo/ahora" && req.method === "POST") return Response.json(await hacerRespaldo(env));
  if (ruta === "/sesiones" && ses) return Response.json(await misSesiones(env, ses));
  if (ruta === "/sesiones/cerrar-todas" && req.method === "POST" && ses) return salirDeTodo(env, req, ses);

  if (ruta === "/resumen") return Response.json(await resumen(env));
  if (ruta === "/publicaciones") return Response.json(await listaPublicaciones(env));
  if (ruta === "/serie") return Response.json(await serie(env));
  if (ruta === "/historias") return Response.json((await env.DB.prepare("SELECT h.*, (SELECT COUNT(*) FROM videos WHERE historia_id = h.id) videos FROM historias h ORDER BY creada DESC").all()).results);
  // Fábrica en la nube (GitHub Actions): sube archivos a R2 y registra en D1. Solo con la clave de scripts.
  if (ruta.startsWith("/fabrica/")) {
    if (!deScript) return Response.json({ error: "solo scripts" }, { status: 403 });
    const clave = url.searchParams.get("clave") || "";
    if (ruta === "/fabrica/archivo" && req.method === "PUT") {
      await env.VIDEOS.put(clave, req.body, { httpMetadata: { contentType: req.headers.get("content-type") || "application/octet-stream" } });
      return Response.json({ ok: true });
    }
    if (ruta === "/fabrica/multi" && req.method === "POST" && url.searchParams.get("accion") === "crear") {
      const m = await env.VIDEOS.createMultipartUpload(clave, { httpMetadata: { contentType: req.headers.get("content-type") || "video/mp4" } });
      return Response.json({ id: m.uploadId });
    }
    if (ruta === "/fabrica/multi" && req.method === "PUT") {
      const m = env.VIDEOS.resumeMultipartUpload(clave, url.searchParams.get("id")!);
      const parte = await m.uploadPart(+url.searchParams.get("n")!, req.body!);
      return Response.json(parte);
    }
    if (ruta === "/fabrica/multi" && req.method === "POST" && url.searchParams.get("accion") === "completar") {
      const m = env.VIDEOS.resumeMultipartUpload(clave, url.searchParams.get("id")!);
      await m.complete(((await req.json()) as { partes: R2UploadedPart[] }).partes);
      return Response.json({ ok: true });
    }
    if (ruta === "/fabrica/respaldos" && req.method === "GET") return Response.json((await env.DB.prepare("SELECT id, cuando, clave_r2, filas, bytes, restaurado_prueba FROM backups WHERE estado = 'ok' ORDER BY id DESC LIMIT 14").all()).results);
    if (ruta === "/fabrica/estado" && req.method === "GET") return Response.json({ detener: await leerDetener(env) });
    if (ruta === "/fabrica/gasto" && req.method === "POST") {
      const g = (await req.json()) as { proveedor: string; concepto: string; monto: number; tipo?: string; unidades?: number; unidad?: string; division?: string; agente?: string; ref?: string; previo?: boolean };
      if (typeof g.proveedor !== "string" || typeof g.concepto !== "string" || typeof g.monto !== "number") return Response.json({ ok: false, motivo: "datos" }, { status: 400 });
      const v = await verificarGasto(env, g.proveedor, g.previo ? g.monto : 0, g.division ?? null);
      if (!v.ok) { await evento(env, `Gasto bloqueado (${g.proveedor}, ${g.monto}): ${v.motivo}`, "aviso"); return Response.json(v, { status: 402 }); }
      if (g.previo) return Response.json(v);
      await registrarGasto(env, { ...g, agente: g.agente ?? "fábrica" });
      return Response.json({ ok: true });
    }
    if (ruta === "/fabrica/respaldo-probado" && req.method === "POST") {
      const { clave: k, filas } = (await req.json()) as { clave: string; filas: number };
      const r = await env.DB.prepare("UPDATE backups SET restaurado_prueba = ? WHERE clave_r2 = ? AND filas = ?").bind(new Date().toISOString(), k, filas).run();
      if (r.meta.changes) await auditar(env, "restauracion-probada", { actor: "script", detalle: `${k} · ${filas} filas` });
      return Response.json({ ok: !!r.meta.changes });
    }
    if (ruta === "/fabrica/sql" && req.method === "POST") {
      const { sql } = (await req.json()) as { sql: string[] };
      if (!Array.isArray(sql) || sql.length > 500) return Response.json({ error: "lote no válido" }, { status: 400 });
      // SENTINEL: solo INSERT/UPDATE sobre tablas de contenido; nada de borrar ni tocar usuarios, sesiones, auditoría, costos o config.
      for (const s of sql) {
        const motivo = validarSql(s);
        if (motivo) {
          await eventoSeguridad(env, "sql-rechazado", "alta", `${motivo}: ${String(s).slice(0, 200)}`, req.headers.get("cf-connecting-ip"));
          return Response.json({ error: `Sentinel rechazó la sentencia: ${motivo}` }, { status: 403 });
        }
      }
      const r = await env.DB.batch(sql.map((s) => env.DB.prepare(s)));
      return Response.json({ ok: true, filas: r.reduce((a, x) => a + (x.meta.changes || 0), 0) });
    }
    return Response.json({ error: "ruta" }, { status: 404 });
  }
  if (ruta === "/tiktok/conectar") return Response.json({ url: await urlConectar(env) });
  if (ruta === "/tiktok/canjear" && req.method === "POST") return Response.json(await canjear(env));
  if (ruta === "/tiktok/creador") return Response.json((await creador(env)) ?? { error: "sin datos" });
  const apr = /^\/tiktok\/aprobar\/(.+)$/.exec(ruta);
  if (apr && req.method === "POST" && (await detenido(env, "relatos", "publicaciones"))) return Response.json({ error: "El botón DETENER tiene paradas las publicaciones." }, { status: 423 });
  if (apr && req.method === "POST") return Response.json(await aprobar(env, decodeURIComponent(apr[1]), await req.json()));
  if (ruta === "/crecimiento") return Response.json(await crecimiento(env));
  if (ruta === "/comentarios") return Response.json(await comentariosPendientes(env));
  const rec = /^\/recomendaciones\/(\d+)$/.exec(ruta);
  if (rec && req.method === "POST") {
    const { estado } = (await req.json()) as { estado: string };
    if (!["pendiente", "hecho", "descartado"].includes(estado)) return Response.json({ error: "estado no válido" }, { status: 400 });
    await env.DB.prepare("UPDATE recomendaciones SET estado = ?, actualizado = datetime('now') WHERE id = ?").bind(estado, +rec[1]).run();
    return Response.json({ ok: true });
  }
  if (ruta.startsWith("/medio/")) return medio(env, req, decodeURIComponent(ruta.slice(7)));
  if (ruta === "/animaciones") return Response.json((await env.DB.prepare(`SELECT a.*, h.titulo, h.semana FROM animaciones a JOIN historias h ON h.id = a.historia_id
      WHERE h.estado != 'publicado' ORDER BY h.semana, a.orden`).all()).results);
  // El panel codifica el id ("llanganates%3Ag2"): se decodifica antes de comparar.
  const sub = /^\/animaciones\/([a-z0-9-]+:[a-z0-9]+)\/clip$/.exec(decodeURIComponent(ruta));
  if (sub && req.method === "POST") {
    const a = await env.DB.prepare("SELECT * FROM animaciones WHERE id = ?").bind(sub[1]).first<{ historia_id: string; escena: string }>();
    if (!a) return Response.json({ error: "no existe" }, { status: 404 });
    const tipo = req.headers.get("content-type") || "";
    const largo = +(req.headers.get("content-length") || 0);
    if (!/^video\/(mp4|quicktime|webm)$/.test(tipo)) return Response.json({ error: "Sube un video MP4" }, { status: 400 });
    if (!largo || largo > 95 * 1024 * 1024) return Response.json({ error: "El video debe pesar menos de 95 MB" }, { status: 400 });
    const clave = `animaciones/${a.historia_id}/${a.escena}.${tipo.endsWith("webm") ? "webm" : tipo.endsWith("quicktime") ? "mov" : "mp4"}`;
    await env.VIDEOS.put(clave, req.body, { httpMetadata: { contentType: tipo } });
    await env.DB.prepare("UPDATE animaciones SET clip = ?, subido = datetime('now') WHERE id = ?").bind(clave, sub[1]).run();
    await evento(env, `Clip animado recibido: ${a.historia_id} · escena ${a.escena}`);
    return Response.json({ ok: true });
  }
  if (ruta === "/pausa" && req.method === "POST") {
    const { valor } = (await req.json()) as { valor: boolean };
    await env.DB.prepare("UPDATE config SET valor = ? WHERE clave = 'pausa'").bind(valor ? "1" : "0").run();
    await evento(env, valor ? "Publicación automática PAUSADA desde el panel" : "Publicación automática REANUDADA desde el panel", "aviso");
    await auditar(env, valor ? "pausa" : "reanudar", { user_id: ses?.user.id, actor: ses?.user.correo ?? "script", division: "relatos", ip: req.headers.get("cf-connecting-ip") });
    return Response.json({ ok: true });
  }
  if (ruta === "/sincronizar" && req.method === "POST") { await publicarPendientes(env); await sincronizar(env); return Response.json({ ok: true }); }
  return Response.json({ error: "no existe" }, { status: 404 });
}

export default {
  async scheduled(c: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil((async () => {
      await publicarPendientes(env);
      const t = new Date(c.scheduledTime);
      if (t.getUTCMinutes() < 5) await sincronizar(env);
      if (!(await detenido(env, "relatos", "publicaciones"))) await historiaFacebook(env, t);
      // 03:00 de Ecuador: suscripciones del mes, respaldo cifrado y revisión de Sentinel.
      if (t.getUTCHours() === 8 && t.getUTCMinutes() < 5) {
        await suscripcionesDelMes(env);
        await hacerRespaldo(env);
        await revisionDiaria(env);
      }
    })());
  },
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const r = url.pathname.startsWith("/api/") ? await api(env, req, url) : await env.ASSETS.fetch(req);
    const h = new Headers(r.headers);
    h.set("X-Content-Type-Options", "nosniff");
    h.set("Referrer-Policy", "no-referrer");
    h.set("X-Frame-Options", "DENY");
    if ((h.get("content-type") || "").includes("text/html"))
      h.set("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' https://fonts.googleapis.com; style-src-attr 'unsafe-inline'; font-src https://fonts.gstatic.com; script-src 'self'; connect-src 'self'; frame-ancestors 'none'");
    return new Response(r.body, { status: r.status, headers: h });
  },
};
