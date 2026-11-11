// Producción automática desde un guion de los agentes (pedido en el panel: /api/agentes/produccion).
// node scripts/producir.mjs tomar        → toma el siguiente pedido, escribe historias/ y publicaciones/, graba voz,
//                                          genera imágenes, sube recursos a R2 y arma el plan. Deja id y comps en $GITHUB_OUTPUT.
// node scripts/producir.mjs listo <id>   → marca la producción como lista (al final de la Fábrica; si no es de agentes, no hace nada).
// node scripts/producir.mjs indice       → regenera src/datos/producidas.ts (planes y miniaturas que Root registra solos).
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const U = (process.env.RELATOS_API || "https://relatos-autopilot.probador-worker.workers.dev") + "/api/fabrica/produccion";
const clave = () => process.env.RELATOS_CLAVE || fs.readFileSync(`${process.env.HOME || process.env.USERPROFILE}/.relatos-secretos/clave-imagenes.txt`, "utf8").trim();
const api = async (ruta, cuerpo = {}) => {
  const r = await fetch(U + ruta, { method: "POST", headers: { "x-clave": clave(), "content-type": "application/json" }, body: JSON.stringify(cuerpo) });
  return r.json();
};
const node = (...args) => execFileSync(process.execPath, args, { stdio: "inherit" });
const VOZ = "Rl2JPHsuEWSfwCD4ZHIQ"; // El Faraón, la voz de todas las historias

/** Archivos de la historia en el mismo formato que las escritas a mano. */
export function archivos(g) {
  const historia = `// ${g.titulo}. Guion de los agentes de RELATOS AI GROUP (producción automática).
export const HISTORIA = ${JSON.stringify({ id: g.id, titulo: g.titulo, voz: VOZ, estilo: g.estilo, escenas: g.escenas }, null, 1)};
export const TITULO_CARTEL = ${JSON.stringify(g.cartel)};
export const CAPITULOS = ${JSON.stringify(g.capitulos || {})};
export const REELS = ${JSON.stringify(g.reels.map(({ id, gancho, escenas, cierre }) => ({ id, gancho, escenas, cierre })), null, 1)};
`;
  const pub = { reels: g.reels.map((r) => ({ archivo: `out/${g.id}-${r.id}.mp4`, cuando: r.cuando, texto: r.texto })) };
  const yt = { etiquetas: g.largo?.etiquetas || [], reels: g.reels.map((r) => ({ titulo: r.titulo_yt })) };
  let largoYt = "";
  if (g.largo) {
    pub.largo = { archivo: `out/${g.id}-largo.mp4`, miniatura: `out/${g.id}-miniatura.jpg`, titulo: g.titulo, texto: g.largo.texto, cuando: g.largo.cuando };
    largoYt = `\nYOUTUBE.largo = { titulo: ${JSON.stringify(g.largo.titulo_yt)}, etiquetas: ${JSON.stringify(g.largo.etiquetas)},
  descripcion: (capitulos) => ${JSON.stringify(g.largo.descripcion_yt)} + "\\n\\n" + capitulos };\n`;
  }
  const publicacion = `// Textos y horarios de ${g.titulo} (producción automática de los agentes).
export const PUBLICACION = ${JSON.stringify(pub, null, 1)};
export const YOUTUBE = ${JSON.stringify(yt, null, 1)};${largoYt}`;
  // Composiciones a renderizar: sin largo no hay miniatura ni largo; los episodios no se publican (no se renderizan).
  const comps = [...(g.largo ? ["miniatura", "largo"] : []), ...g.reels.map((r) => r.id)];
  return { historia, publicacion, comps };
}

export function indice() {
  const ids = fs.readdirSync("src/datos").filter((f) => f.endsWith("-produccion.json")).map((f) => f.replace("-produccion.json", "")).filter((id) => fs.existsSync(`src/datos/${id}-plan.json`)).sort();
  const v = (id) => "p_" + id.replace(/-/g, "_");
  const minis = Object.fromEntries(ids.map((id) => {
    const m = JSON.parse(fs.readFileSync(`src/datos/${id}-produccion.json`, "utf8")).miniatura;
    return [id, { cara: `${id}/h/${m.cara}.jpg`, fondo: `${id}/h/${m.fondo}.jpg`, linea1: m.linea1, linea2: m.linea2, dato: m.dato }];
  }));
  fs.writeFileSync("src/datos/producidas.ts", `// GENERADO por scripts/producir.mjs: historias producidas por los agentes. No editar a mano.
import type { Plan } from "../Relato";
${ids.map((id) => `import ${v(id)} from "./${id}-plan.json";`).join("\n")}
export const PLANES: Record<string, Plan> = { ${ids.map((id) => `"${id}": ${v(id)} as unknown as Plan`).join(", ")} };
export const MINIS: Record<string, { cara: string; fondo: string; linea1: string; linea2: string; dato: string }> = ${JSON.stringify(minis)};
`);
}

const [, , accion, idArg] = process.argv;
if (accion === "indice") indice();

if (accion === "listo") {
  const r = await api(`/${idArg}`, { estado: "lista", detalle: "Renderizada y programada en Facebook, YouTube y el panel." }).catch(() => ({}));
  console.log(r.ok ? `producción ${idArg} lista` : `${idArg} no es una producción de agentes`);
}

if (accion === "tomar") {
  const { produccion: p } = await api("/siguiente");
  if (!p) { console.log("sin pedidos de producción"); process.exit(0); }
  const g = p.guion;
  console.log(`== Producción ${g.id}: ${g.titulo} (${g.escenas.length} escenas, ${g.letras} letras)`);
  try {
    if (fs.existsSync(`historias/${g.id}.mjs`)) throw new Error(`ya existe historias/${g.id}.mjs`);
    const { historia, publicacion, comps } = archivos(g);
    fs.writeFileSync(`historias/${g.id}.mjs`, historia);
    fs.writeFileSync(`publicaciones/${g.id}.mjs`, publicacion);
    fs.writeFileSync(`src/datos/${g.id}-produccion.json`, JSON.stringify(g, null, 1));
    node("scripts/voz.mjs", g.id);
    // Horizontales para el largo (todas las escenas); verticales solo para las escenas de los reels.
    if (g.largo) node("generar-imagenes.mjs", g.id, "h");
    const vert = [...new Set(g.reels.flatMap((r) => r.escenas))];
    if (vert.length) node("generar-imagenes.mjs", g.id, "v", vert.join(","));
    const faltan = [...(g.largo ? g.escenas.map((e) => `h/${e.id}`) : []), ...vert.map((e) => `v/${e}`)].filter((f) => !fs.existsSync(`public/${g.id}/${f}.jpg`));
    if (faltan.length > 3) throw new Error(`faltan ${faltan.length} imágenes (${faltan.slice(0, 5).join(", ")}…)`);
    fs.mkdirSync("prueba", { recursive: true });
    node("scripts/recursos.mjs", "subir", g.id);
    node("scripts/planear.mjs", g.id);
    indice();
    await api(`/${g.id}`, { estado: "renderizando", detalle: `Voz e imágenes listas. Render de: ${comps.join(", ")}` });
    if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `id=${g.id}\ncomps=${comps.join(" ")}\n`);
  } catch (e) {
    const motivo = String(e.message || e).slice(0, 600);
    await api(`/${g.id}`, { estado: "error", detalle: motivo });
    // No queda nada a medias en el repo: el pedido se puede corregir y volver a pedir con otro id.
    for (const f of [`historias/${g.id}.mjs`, `publicaciones/${g.id}.mjs`, `src/datos/${g.id}-produccion.json`]) fs.rmSync(f, { force: true });
    console.error("ERROR:", motivo);
    process.exit(1);
  }
}
