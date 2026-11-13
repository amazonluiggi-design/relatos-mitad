// Motor de la jornada de los agentes en GitHub Actions con la API de Claude (antes era una rutina de claude.ai que se apagaba con la cuenta).
// node scripts/jornada.mjs [--probar]   Necesita ANTHROPIC_API_KEY y AGENTE_CLAVE (secretos del repositorio).
// --probar: no llama a Claude; solo comprueba la API del panel y arma el prompt.
// Gasto: Haiku 5.5 hace la jornada; Sonnet 5.5 solo escribe guiones (herramienta escribir_guion). Sentinel corta con el tope mensual de "anthropic".
import Anthropic from "@anthropic-ai/sdk";
import fs from "node:fs";
import os from "node:os";
import { anotarGasto, detenido, puedoGastar } from "./nube.mjs";
import { marcador, opciones, reelNuevo } from "./reel-nuevo.mjs";

const API = (process.env.RELATOS_API || "https://relatos-autopilot.probador-worker.workers.dev") + "/api";
const CLAVE = process.env.AGENTE_CLAVE || (fs.existsSync(os.homedir() + "/.relatos-secretos/agente-clave.txt") ? fs.readFileSync(os.homedir() + "/.relatos-secretos/agente-clave.txt", "utf8").trim() : "");
const PROBAR = process.argv.includes("--probar");
const MODELO = "claude-haiku-5-5", MODELO_GUION = "claude-sonnet-5-5";
// USD por millón de tokens (hasta 100K de prompt en Haiku; por encima cuesta 5 veces más, por eso el tope de 95K).
const PRECIO = { [MODELO]: { in: 0.1, out: 0.5, w: 0.125, r: 0.01 }, [MODELO_GUION]: { in: 2, out: 10, w: 2.5, r: 0.1 } };
// USD 4 al mes repartidos parejo: cada día recibe lo que queda del mes ÷ días que faltan, y cada jornada hasta la mitad de eso.
// (Sentinel igual corta en 4 si algo se pasa.) Ej.: 13-nov → 4/18 = 0,22 al día → 0,11 por jornada; diciembre → 0,065.
const TOPE_MES = 4;
const _hoy = new Date(Date.now() - 5 * 36e5), _diasMes = new Date(Date.UTC(_hoy.getUTCFullYear(), _hoy.getUTCMonth() + 1, 0)).getUTCDate();
const TOPE_JORNADA = Math.min(0.15, Math.max(0.03, TOPE_MES / (_diasMes - _hoy.getUTCDate() + 1) / 2));
const TOPE_PROMPT = 95_000, MAX_VUELTAS = 40, BUSQUEDA = 0.01;
const AGENTES = ["michael", "andy", "oscar", "ryan", "kelly", "jim", "dwight", "pam", "angela", "sentinel"];

if (!CLAVE) throw new Error("falta AGENTE_CLAVE");
const ahoraEc = new Date(Date.now() - 5 * 36e5);
const hora = ahoraEc.getUTCHours(), fecha = ahoraEc.toISOString().slice(0, 10);
const tipo = hora < 10 ? "COMPLETA de las 07:00 (ronda de redes + informe de la mañana)"
  : hora >= 21 ? "CIERRE de las 22:00 (trabajo + informe del día para Luiggi)"
  : hora >= 14 && hora < 17 ? "COMPLETA de las 15:00 (ronda de redes + informe de la tarde)"
  : "de TRABAJO (sin informe)";

async function api(metodo, ruta, agente, cuerpo) {
  if (!/^\/agentes\//.test(ruta)) return { error: "solo rutas /agentes/*" };
  if (!AGENTES.includes(agente)) return { error: `agente desconocido: ${agente}` };
  const r = await fetch(API + ruta, { method: metodo, headers: { "x-agente": CLAVE, "x-agente-id": agente, "content-type": "application/json" }, body: metodo === "POST" ? JSON.stringify(cuerpo || {}) : undefined, signal: AbortSignal.timeout(60000) });
  const t = await r.text();
  return { estado: r.status, respuesta: t.length > 20000 ? t.slice(0, 20000) + "…(recortado)" : t };
}

function leer(ruta) {
  const limpia = String(ruta).replace(/\\/g, "/");
  if (!/^(agentes|historias|publicaciones)\/[\w.-]+\.(md|mjs|json)$/.test(limpia)) return "Solo se pueden leer archivos de agentes/, historias/ o publicaciones/.";
  if (!fs.existsSync(limpia)) return `No existe ${limpia}.`;
  const t = fs.readFileSync(limpia, "utf8");
  return t.length > 30000 ? t.slice(0, 30000) + "\n…(recortado)" : t;
}

// ── Prompt (fijo para que la caché lo reutilice) ──
const manual = fs.readFileSync("agentes/JORNADA.md", "utf8");
const produccion = fs.readFileSync("agentes/PRODUCCION.md", "utf8");
const perfiles = AGENTES.filter((a) => fs.existsSync(`agentes/${a}.md`)).map((a) => `### Perfil: ${a}\n${fs.readFileSync(`agentes/${a}.md`, "utf8")}`).join("\n\n");
const motor = `## Cómo actúas en este motor (manda sobre lo que el manual dice de curl, secretos de red y entorno de la nube)
- Actúas SOLO con la herramienta \`api\` (método, ruta que empieza con /agentes/, agente que habla, cuerpo). El motor pone la clave: tú nunca la ves ni la pides.
- El contexto completo (/agentes/contexto) ya viene en el primer mensaje: no lo pidas otra vez. Lleva la cuenta de lo que cambias durante la jornada.
- \`leer\` abre archivos del repositorio en agentes/, historias/ y publicaciones/ (Dwight revisa guiones así).
- \`web_search\` y \`web_fetch\` sirven para investigar con fuentes reales (Andy, Ryan). Úsalos poco: cada búsqueda cuesta.
- \`escribir_guion\`: cuando Ryan o Jim deban escribir un guion completo en el JSON de PRODUCCION.md, pídelo con esta herramienta (lo escribe un modelo más fuerte) y entrega lo que devuelve.
- **Reels nuevos sin gastar voz (prioridad diaria):** con \`opciones_reel\` ves las escenas (con voz e imagen vertical) y los ganchos usados de una historia; con \`reel_nuevo\` armas un reel con gancho nuevo y otro orden de escenas. Elige historias que rindieron (tesoros: Llanganates, Isla de la Plata, Tesoro de Lima, El Dorado) y llena los días o franjas de YouTube sin publicación. Kelly escribe el gancho y el título, Dwight lo revisa antes de mandarlo, Pam elige la hora. Máximo 2 por jornada. La Fábrica lo renderiza y lo programa en Facebook y YouTube sola.
- **La nota real la ponen las vistas.** El primer mensaje trae el MARCADOR REAL (reels de YouTube: vistas a 24 h y nota = 50 en la mediana, 100 al doble). Dwight lo usa para revisar ganchos y títulos: uno parecido a los de nota < 40 se rechaza; los de nota ≥ 70 son el modelo a copiar. Kelly escribe mirando el marcador, no su intuición.
- Sé breve en lo que escribes: cada palabra cuesta. Termina la jornada cuando no quede trabajo útil.`;
const system = [{ type: "text", text: `${motor}\n\n${manual}\n\n# Manual de producción\n${produccion}\n\n# Perfiles\n${perfiles}`, cache_control: { type: "ephemeral" } }];

const tools = [
  { name: "api", description: "Llama a la API del panel de RELATOS AI GROUP como un agente. Devuelve estado HTTP y respuesta JSON.", strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["metodo", "ruta", "agente", "cuerpo"],
      properties: { metodo: { type: "string", enum: ["GET", "POST"] }, ruta: { type: "string", description: "Ej. /agentes/tareas/tomar" }, agente: { type: "string", enum: AGENTES }, cuerpo: { type: "string", description: "JSON del cuerpo para POST; '{}' si no hay" } } } },
  { name: "leer", description: "Lee un archivo del repositorio (agentes/, historias/, publicaciones/).", strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["ruta"], properties: { ruta: { type: "string" } } } },
  { name: "escribir_guion", description: "Escribe un guion completo en el formato JSON de agentes/PRODUCCION.md con un modelo más fuerte. Pasa el pedido (tema aprobado, ángulo, fuentes, fechas libres de la agenda).", strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["pedido"], properties: { pedido: { type: "string" } } } },
  { name: "opciones_reel", description: "Escenas con voz e imagen vertical y ganchos ya usados de una historia producida.", strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["historia"], properties: { historia: { type: "string" } } } },
  { name: "reel_nuevo", description: "Crea un reel nuevo de una historia ya producida (no gasta voz) y lo manda a la Fábrica. Valida gancho ≤9 palabras e inédito, 2-7 escenas, 10-60 s, hora de Ecuador entre 6 h y 10 días y a 2 h de otra publicación.", strict: true,
    input_schema: { type: "object", additionalProperties: false, required: ["historia", "gancho", "escenas", "cierre", "cuando", "texto", "titulo_yt"],
      properties: { historia: { type: "string" }, gancho: { type: "string" }, escenas: { type: "array", items: { type: "string" } }, cierre: { type: "string" },
        cuando: { type: "string", description: "ISO con -05:00, ej. 2026-11-18T12:30:00-05:00" }, texto: { type: "string", description: "Descripción para Facebook con 3-5 hashtags" }, titulo_yt: { type: "string", description: "≤100 letras, termina en #shorts" } } } },
  { type: "web_search_20250305", name: "web_search", max_uses: 4 },
  { type: "web_fetch_20250910", name: "web_fetch", max_uses: 4 },
];

let gasto = 0, busquedas = 0, reels = 0;
function cobrar(modelo, u) {
  const p = PRECIO[modelo];
  const s = u.server_tool_use?.web_search_requests || 0;
  busquedas += s;
  gasto += ((u.input_tokens || 0) * p.in + (u.output_tokens || 0) * p.out + (u.cache_creation_input_tokens || 0) * p.w + (u.cache_read_input_tokens || 0) * p.r) / 1e6 + s * BUSQUEDA;
}

const client = new Anthropic();
async function escribirGuion(pedido) {
  if (gasto + 0.08 > TOPE_JORNADA) return "No alcanza el presupuesto de esta jornada para un guion (cuesta ~USD 0,08): déjalo para la siguiente y trabaja en reels nuevos.";
  const r = await client.messages.create({ model: MODELO_GUION, max_tokens: 16000, output_config: { effort: "medium" },
    system: [{ type: "text", text: `Eres Ryan, guionista de "Relatos de la Mitad" (misterio épico, Ecuador y Latinoamérica, sin gore, leyenda contada como leyenda). Escribe SOLO el JSON del guion, válido, siguiendo exactamente este manual:\n\n${produccion}`, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: pedido }] });
  cobrar(MODELO_GUION, r.usage);
  if (r.stop_reason === "refusal") return "El modelo no quiso escribir ese guion; cambia el ángulo.";
  return r.content.filter((b) => b.type === "text").map((b) => b.text).join("");
}

async function ejecutar(b) {
  try {
    if (b.name === "api") {
      let cuerpo = {};
      if (b.input.metodo === "POST") { try { cuerpo = JSON.parse(b.input.cuerpo || "{}"); } catch { return { content: "cuerpo no es JSON válido", is_error: true }; } }
      if (b.input.ruta === "/agentes/contexto") return { content: "Ya tienes el contexto en el primer mensaje." };
      const r = await api(b.input.metodo, b.input.ruta, b.input.agente, cuerpo);
      if (r.estado === 423) detener = true;
      return { content: JSON.stringify(r), is_error: r.estado >= 400 };
    }
    if (b.name === "leer") return { content: leer(b.input.ruta) };
    if (b.name === "opciones_reel") return { content: JSON.stringify(await opciones(b.input.historia) || { error: "historia no producida" }) };
    if (b.name === "reel_nuevo") {
      if (reels >= 2) return { content: "Ya van 2 reels nuevos en esta jornada.", is_error: true };
      const r = await reelNuevo(b.input);
      if (r.ok) reels++;
      return { content: JSON.stringify(r), is_error: !r.ok };
    }
    if (b.name === "escribir_guion") return { content: await escribirGuion(b.input.pedido) };
    return { content: `herramienta desconocida: ${b.name}`, is_error: true };
  } catch (e) { return { content: String(e).slice(0, 300), is_error: true }; }
}

let detener = false;
if (await detenido("relatos", "agentes")) { console.log("🛑 DETENER EMPRESA: no hay jornada."); process.exit(0); }
const rc = await fetch(API + "/agentes/contexto", { headers: { "x-agente": CLAVE, "x-agente-id": "michael" }, signal: AbortSignal.timeout(60000) });
const contexto = await rc.text();
if (!rc.ok) throw new Error(`contexto: ${rc.status} ${contexto.slice(0, 200)}`);
const ctxJson = JSON.parse(contexto);
// El contexto entero pasa de 100K tokens con la conversación (y Haiku cobra 5 veces más arriba de eso): se manda lo útil.
function compactar(c) {
  const corta = (s, n) => (s == null ? s : String(s).slice(0, n));
  const desde = Date.now() - 10 * 864e5;
  const ultimas = {};
  for (const x of c.datos?.cuentas || []) ultimas[x.red] = x;
  return { ...c,
    tareas: (c.tareas || []).map((t) => ({ ...t, descripcion: corta(t.descripcion, 300), revision: corta(t.revision, 200) })),
    agenda: (c.agenda || []).map((a) => ({ pub_id: a.pub_id, red: a.red, estado: a.estado, cuando: a.cuando, subido: a.subido, titulo: corta(a.titulo, 80), tipo: a.tipo, historia_id: a.historia_id, calidad: a.calidad })),
    datos: { cuentas: Object.values(ultimas), serie: c.datos?.serie,
      pubs: (c.datos?.pubs || []).filter((p) => Date.parse(p.cuando) > desde && p.estado === "publicado")
        .map((p) => ({ id: p.id, cuando: p.cuando, tipo: p.tipo, historia_id: p.historia_id, gancho: corta(p.gancho, 70), vistas: p.vistas, vistas_24h: p.vistas_24h })) } };
}
const marca = marcador(ctxJson);
const tablaMarcador = marca.filas.map((f) => `| ${f.video}${f.de_agentes ? " (agentes)" : ""} | ${(f.gancho || "").slice(0, 70)} | ${f.vistas_24h} | ${f.nota} |`).join("\n");
// En el cierre de las 22:00 queda guardada la nota de los reels de los agentes que cumplieron 24-48 h (una sola vez cada uno).
if (!PROBAR && hora >= 21) for (const f of marca.filas.filter((f) => f.de_agentes && Date.parse(f.salio) > Date.now() - 2 * 864e5))
  await api("POST", "/agentes/memoria", "dwight", { tipo: "aprendizaje", titulo: `Marcador: ${f.video}`, contenido: `Gancho «${f.gancho}»: ${f.vistas_24h} vistas a 24 h en YouTube (mediana de reels ${marca.mediana}) → nota ${f.nota}/100.`, confianza: "alta" });
const compacto = JSON.stringify(compactar(ctxJson));
const inicio = `Jornada ${tipo}. Hoy es ${fecha}, son las ${String(hora).padStart(2, "0")}:00 en Ecuador.\n\nMARCADOR REAL (YouTube, mediana de reels ${marca.mediana}):\n| video | gancho | vistas 24 h | nota |\n|---|---|---|---|\n${tablaMarcador}\n\nCONTEXTO (/agentes/contexto resumido, JSON):\n${compacto}`;
console.log(`Tope de esta jornada: USD ${TOPE_JORNADA.toFixed(3)}`);
console.log(`Jornada ${tipo} · contexto ${contexto.length} → ${compacto.length} letras · prompt fijo ${system[0].text.length} letras`);
if (PROBAR) console.log(inicio.slice(0, inicio.indexOf("CONTEXTO (")));
if (PROBAR) { console.log("--probar: API del panel OK, no se llama a Claude."); process.exit(0); }
if (!(await puedoGastar("anthropic", TOPE_JORNADA, "Jornada de agentes"))) { console.log("⛔ Sin presupuesto de Anthropic: no hay jornada."); process.exit(0); }

const messages = [{ role: "user", content: [{ type: "text", text: inicio, cache_control: { type: "ephemeral" } }] }];
let avisado = false;
try {
  for (let vuelta = 0; vuelta < MAX_VUELTAS && !detener; vuelta++) {
    const r = await client.messages.create({ model: MODELO, max_tokens: 8000, system, tools, messages, output_config: { effort: "medium" }, cache_control: { type: "ephemeral" } });
    cobrar(MODELO, r.usage);
    const prompt = (r.usage.input_tokens || 0) + (r.usage.cache_read_input_tokens || 0) + (r.usage.cache_creation_input_tokens || 0);
    for (const b of r.content) if (b.type === "text" && b.text.trim()) console.log("·", b.text.trim().slice(0, 300));
    messages.push({ role: "assistant", content: r.content });
    if (r.stop_reason === "refusal") { console.log("El modelo se negó:", r.stop_details?.category); break; }
    if (r.stop_reason === "pause_turn") continue;
    if (r.stop_reason !== "tool_use") break;
    const resultados = [];
    for (const b of r.content.filter((b) => b.type === "tool_use")) {
      const x = await ejecutar(b);
      console.log(`  → ${b.name} ${b.name === "api" ? `${b.input.agente} ${b.input.metodo} ${b.input.ruta}` : ""} ${x.is_error ? "✗ " + String(x.content).slice(0, 160) : "✓"}`);
      resultados.push({ type: "tool_result", tool_use_id: b.id, content: x.content, ...(x.is_error ? { is_error: true } : {}) });
    }
    messages.push({ role: "user", content: resultados });
    if (gasto > TOPE_JORNADA || prompt > TOPE_PROMPT * 1.1) { console.log(`Tope de la jornada alcanzado: se corta (USD ${gasto.toFixed(3)}, prompt ${prompt} tokens).`); break; }
    if (!avisado && (gasto > TOPE_JORNADA * 0.8 || prompt > TOPE_PROMPT)) {
      avisado = true;
      messages.push({ role: "system", content: "Se acaba el presupuesto de esta jornada: entrega lo que tengas, pon a todos en disponible y termina en 2 pasos como máximo." });
    }
  }
} finally {
  console.log(`Gasto estimado: USD ${gasto.toFixed(4)} · búsquedas ${busquedas}`);
  if (gasto > 0) await anotarGasto({ proveedor: "anthropic", concepto: `Jornada de agentes ${fecha} ${hora}:00`, monto: +gasto.toFixed(4), unidades: 1, unidad: "jornada", agente: "michael" });
}
