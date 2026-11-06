// Oficina virtual de RELATOS AI GROUP: cada escritorio refleja el estado REAL del agente (tabla agents/agent_events).
// Nada se anima si el agente no está trabajando: "disponible" es reposo, "no-activado" es un puesto vacío.
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error", "no-activado": "Puesto libre" };
// Tonos discretos de ropa por agente (paleta sobria: grafito, marino, gris cálido).
const ROPA = { michael: "#2b3a55", sentinel: "#3a3f46", andy: "#4a5a6b", oscar: "#33465c", ryan: "#5a4a3e", kelly: "#5b4656", jim: "#3e4a3a", dwight: "#5a5238", pam: "#4d4a5e", angela: "#3f3a48" };
const PIEL = { michael: "#c99a7b", sentinel: "#a77b5e", andy: "#d2a989", oscar: "#8d6248", ryan: "#c08d6c", kelly: "#e0b896", jim: "#b78567", dwight: "#d8b08d", pam: "#c9a07f", angela: "#9a6b50" };

/** Contenido del monitor según lo que hace (SVG dentro de la pantalla). */
function pantalla(estado) {
  switch (estado) {
    case "escribiendo": return `<g class="lineas"><rect x="6" y="6" width="34" height="2" rx="1"/><rect x="6" y="11" width="28" height="2" rx="1"/><rect x="6" y="16" width="31" height="2" rx="1"/><rect x="6" y="21" width="20" height="2" rx="1" class="cursor"/></g>`;
    case "investigando": return `<g class="busca"><rect x="6" y="6" width="36" height="5" rx="2"/><rect x="6" y="14" width="26" height="2" rx="1"/><rect x="6" y="19" width="30" height="2" rx="1"/><circle cx="36" cy="20" r="4" class="lupa"/></g>`;
    case "analizando": return `<g class="barras"><rect x="8" y="16" width="5" height="10"/><rect x="16" y="11" width="5" height="15"/><rect x="24" y="14" width="5" height="12"/><rect x="32" y="8" width="5" height="18"/></g>`;
    case "revisando": return `<g class="doc"><rect x="12" y="4" width="22" height="22" rx="1"/><path d="M16 10h14M16 14h14M16 18h9" /><path d="M27 20l3 3 6-7" class="check"/></g>`;
    case "produciendo": case "renderizando": return `<g class="render"><rect x="6" y="8" width="36" height="12" rx="1"/><rect x="6" y="23" width="36" height="3" rx="1.5" class="pista"/><rect x="6" y="23" width="12" height="3" rx="1.5" class="avance"/></g>`;
    case "coordinando": return `<g class="org"><circle cx="24" cy="8" r="3"/><circle cx="12" cy="21" r="3"/><circle cx="24" cy="21" r="3"/><circle cx="36" cy="21" r="3"/><path d="M24 11v4M12 18v-3h24v3M24 15v3"/></g>`;
    case "error": return `<g class="falla"><path d="M24 7l11 18H13z"/><path d="M24 13v6M24 21.5v.5"/></g>`;
    default: return `<g class="reposo"><circle cx="24" cy="15" r="5"/></g>`;
  }
}

/** Un puesto de trabajo: escritorio de madera, monitor, silla y la persona (si el puesto está ocupado). */
function puesto(a) {
  const vacio = !a.activo;
  const est = vacio ? "no-activado" : a.estado;
  const ropa = ROPA[a.id] || "#3d4752", piel = PIEL[a.id] || "#c49a7c";
  const persona = vacio ? "" : `
    <g class="persona" style="--ropa:${ropa};--piel:${piel}">
      <path class="torso" d="M34 104c0-25 9-40 23-40s19 13 19 27v13z"/>
      <g class="cabeza"><circle cx="54" cy="46" r="13" class="piel"/><path class="pelo" d="M41 44c0-10 6-15 13-15s13 5 13 13c-4-5-8-6-13-6s-9 3-13 8z"/></g>
      <g class="brazo izq"><path d="M58 76c6 10 13 17 19 22" /></g>
      <g class="brazo der"><path d="M66 73c7 10 12 18 16 25" /></g>
      ${est === "revisando" ? `<rect class="hoja" x="64" y="74" width="16" height="13" rx="1" transform="rotate(-12 72 80)"/>` : ""}
    </g>`;
  return `<button class="puesto est-${esc(est)}" data-agente="${esc(a.id)}" aria-label="${esc(a.nombre)}: ${esc(EST[est] || est)}">
    <svg viewBox="0 0 180 150" class="escena" aria-hidden="true">
      <ellipse cx="90" cy="145" rx="80" ry="4" class="sombra"/>
      <g class="silla"><rect x="18" y="58" width="13" height="48" rx="5"/><rect x="20" y="96" width="42" height="8" rx="3"/></g>
      ${persona}
      <g class="monitor"><rect x="94" y="44" width="70" height="47" rx="4" class="marco"/><svg x="99" y="49" width="60" height="37" viewBox="0 0 48 30" class="pantalla">${pantalla(est)}</svg><rect x="125" y="91" width="8" height="10"/><rect x="115" y="100" width="28" height="4" rx="2"/></g>
      <rect x="72" y="99" width="24" height="4" rx="1.5" class="teclado"/>
      <rect x="12" y="104" width="156" height="9" rx="2" class="tablero"/>
      <rect x="20" y="113" width="6" height="30" class="pata"/><rect x="154" y="113" width="6" height="30" class="pata"/>
      <g class="taza"><rect x="148" y="93" width="9" height="11" rx="2"/>${est === "disponible" ? `<path class="vapor" d="M150 89c-2-3 2-4 0-7M154 89c-2-3 2-4 0-7"/>` : ""}</g>
    </svg>
    <span class="placa"><b>${esc(a.nombre)}</b><small>${esc(a.cargo)}</small><em>${esc(EST[est] || est)}${a.tarea_titulo && !vacio && est !== "disponible" ? " · " + esc(a.tarea_titulo) : ""}</em></span>
  </button>`;
}

export function oficinaHtml(datos, division) {
  const lista = datos.agentes.filter((a) => (division === "gaming" ? a.division_id === "gaming" : a.division_id !== "gaming"));
  const trabajando = lista.filter((a) => a.activo && !["disponible", "pausa", "no-activado"].includes(a.estado)).length;
  const direccion = lista.filter((a) => !a.division_id), equipo = lista.filter((a) => a.division_id);
  return `<div class="oficina-cab">
      <div class="pestanas"><a href="#oficina" class="${division !== "gaming" ? "activo" : ""}">Relatos</a><a href="#oficina-gaming" class="${division === "gaming" ? "activo" : ""}">Gaming</a></div>
      <p class="nd">${trabajando ? `<b>${trabajando}</b> trabajando ahora` : "Nadie trabajando en este momento"} · se actualiza sola cada 15 s · toca un puesto para ver la ficha</p>
    </div>
    <section class="oficina ${division === "gaming" ? "gaming" : ""}">
      <div class="ventanal" aria-hidden="true"></div>
      ${direccion.length ? `<div class="zona"><h4>Dirección y seguridad</h4><div class="puestos">${direccion.map(puesto).join("")}</div></div>` : ""}
      <div class="zona"><h4>${division === "gaming" ? "RELATOS GAMING MEDIA · en preparación" : "RELATOS AI MEDIA AGENCY"}</h4><div class="puestos">${equipo.map(puesto).join("")}</div></div>
    </section>
    <ul class="oficina-movil">${lista.map((a) => `<li data-agente="${esc(a.id)}" class="fila-clic est-${esc(a.activo ? a.estado : "no-activado")}"><span class="punto"></span><b>${esc(a.nombre)}</b> <span class="nd">${esc(EST[a.activo ? a.estado : "no-activado"])}${a.tarea_titulo && a.estado !== "disponible" ? " · " + esc(a.tarea_titulo) : ""}</span></li>`).join("")}</ul>`;
}
