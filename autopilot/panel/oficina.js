// Oficina virtual completa: la misma oficina fotorrealista (video de Remotion) en grande, con todos los agentes
// etiquetados sobre su puesto y la lista del equipo con su estado REAL. Gaming muestra su equipo en preparación.
import { escenaHtml } from "/inicio.js";
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error", "no-activado": "Por activar" };
const vivo = (a) => a.activo && !["disponible", "pausa", "no-activado"].includes(a.estado);

function tarjeta(a) {
  const est = a.activo ? a.estado : "no-activado";
  return `<button class="miembro ${vivo(a) ? "vivo" : ""} est-${esc(est)}" ${a.activo ? `data-charlar="${esc(a.id)}"` : `data-agente="${esc(a.id)}"`}>
    <span class="m-ini">${esc(a.nombre.slice(0, 1))}</span>
    <span class="m-txt"><b>${esc(a.nombre)}</b><small>${esc(a.cargo)}</small><em>${esc(EST[est] || est)}${vivo(a) && a.tarea_titulo ? " · " + esc(a.tarea_titulo) : ""}</em></span>
    <span class="m-num">${a.hechas ?? 0} hechas</span></button>`;
}

export function oficinaHtml(datos, division) {
  const gaming = division === "gaming";
  const lista = datos.agentes.filter((a) => (gaming ? a.division_id === "gaming" : a.division_id !== "gaming"));
  const n = lista.filter(vivo).length;
  return `<div class="oficina-cab">
      <div class="pestanas"><a href="#oficina" class="${gaming ? "" : "activo"}">Relatos</a><a href="#oficina-gaming" class="${gaming ? "activo" : ""}">Gaming</a></div>
      <p class="nd">${n ? `<b>${n}</b> trabajando ahora` : "Nadie trabajando en este momento"} · se actualiza sola · toca a un agente para ver su ficha</p>
    </div>
    ${gaming
      ? `<div class="tarjeta gaming-espera"><h3>RELATOS GAMING MEDIA · equipo en preparación</h3><p class="nd">Los agentes de Gaming se activan cuando la marca tenga nombre y cuentas, y Rockstar esté verificado en el gestor de derechos.</p></div>`
      : escenaHtml(datos.agentes, true)}
    <div class="equipo-lista">${lista.map(tarjeta).join("")}</div>`;
}
