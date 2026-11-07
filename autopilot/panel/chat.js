// Oficina virtual: al tocar a un trabajador, la cámara se acerca a su puesto y se abre el chat con él.
// La cámara usa una sola transformación en GPU (transform) con la curva Premium: liviano y fluido.
import { PUESTOS } from "/inicio.js";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error" };
const ESCALA = 1.9;
let abierto = null, api, post;

export const agenteAbierto = () => abierto;

/** Cuánto mover la escena (en % de su tamaño) para que el punto (x, y) quede en (destX, destY) tras escalar. */
function encuadre(x, y, destX, destY) {
  const lim = ((ESCALA - 1) * 50) / ESCALA; // más allá se verían los bordes
  const c = (v) => Math.max(-lim, Math.min(lim, v));
  return [c((destX - 50) / ESCALA - (x - 50)), c((destY - 50) / ESCALA - (y - 50))];
}

const hora = (s) => new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" });
const burbuja = (m, nombre) => `<div class="msg ${m.rol === "dueño" ? "yo" : "el"}"><p>${esc(m.texto)}</p>
  <small>${m.rol === "dueño" ? "Tú" : esc(nombre)} · ${esc(hora(m.cuando))}${m.tarea_id ? ` · <span class="tarea-chip">📌 Tarea #${m.tarea_id} creada</span>` : ""}</small></div>`;

export async function abrirChat(id, agentes) {
  const hero = document.querySelector(".hero");
  const panel = document.getElementById("chat");
  const a = agentes.find((x) => x.id === id);
  if (!hero || !panel || !a) return;
  abierto = id;
  // Cámara: el trabajador queda a la izquierda si el chat ocupa la derecha.
  const [x, y] = PUESTOS[id] || [50, 50];
  const ancho = hero.getBoundingClientRect().width > 760;
  const [tx, ty] = encuadre(x, y, ancho ? 30 : 50, ancho ? 52 : 40);
  hero.querySelector(".escena-mov").style.transform = `scale(${ESCALA}) translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%)`;
  hero.classList.add("enfocada");
  hero.querySelectorAll(".etiqueta").forEach((e) => e.classList.toggle("elegida", e.dataset.charlar === id));
  panel.hidden = false;
  panel.innerHTML = `<header class="chat-cab"><span class="chat-ava">${esc(a.nombre[0])}</span>
      <div><b>${esc(a.nombre)}</b><small>${esc(a.cargo)} · <em class="${["disponible", "pausa"].includes(a.estado) ? "" : "vivo-txt"}">${esc(EST[a.estado] || a.estado)}</em></small></div>
      <button class="chat-ficha" data-agente="${esc(id)}">Ficha</button><button class="chat-cerrar" data-cerrar-chat aria-label="Cerrar chat">✕</button></header>
    <div class="chat-msgs" id="chat-msgs"><div class="chat-cargando"><i></i><i></i><i></i></div></div>
    <form class="chat-form" id="chat-form"><textarea rows="1" maxlength="1500" placeholder="Escríbele a ${esc(a.nombre)}…" aria-label="Mensaje"></textarea><button aria-label="Enviar">➤</button></form>`;
  requestAnimationFrame(() => panel.classList.add("visible"));
  const lista = await api("/chat/" + id).catch(() => []);
  if (abierto !== id) return;
  const caja = document.getElementById("chat-msgs");
  caja.innerHTML = lista.length ? lista.map((m) => burbuja(m, a.nombre)).join("")
    : `<p class="chat-vacio">Escríbele a ${esc(a.nombre)}: te contesta al momento. Si le pides un trabajo, lo anota y lo hace con el equipo.</p>`;
  caja.scrollTop = caja.scrollHeight;
  panel.querySelector("textarea").focus();
}

export function cerrarChat() {
  const hero = document.querySelector(".hero");
  const panel = document.getElementById("chat");
  abierto = null;
  if (hero) { hero.querySelector(".escena-mov").style.transform = ""; hero.classList.remove("enfocada"); hero.querySelectorAll(".etiqueta.elegida").forEach((e) => e.classList.remove("elegida")); }
  if (panel) { panel.classList.remove("visible"); setTimeout(() => { if (!abierto) panel.hidden = true; }, 380); }
}

async function enviar(form) {
  const ta = form.querySelector("textarea"), texto = ta.value.trim();
  if (!texto || !abierto) return;
  const id = abierto, caja = document.getElementById("chat-msgs");
  const nombre = document.querySelector(".chat-cab b")?.textContent || "";
  caja.querySelector(".chat-vacio")?.remove();
  caja.insertAdjacentHTML("beforeend", burbuja({ rol: "dueño", texto, cuando: new Date().toISOString() }, nombre) + `<div class="msg el escribiendo"><span><i></i><i></i><i></i></span></div>`);
  caja.scrollTop = caja.scrollHeight;
  ta.value = ""; ta.style.height = "";
  form.querySelector("button").disabled = true;
  const r = await post("/chat/" + id, { texto });
  form.querySelector("button").disabled = false;
  if (abierto !== id) return;
  caja.querySelector(".escribiendo")?.remove();
  caja.insertAdjacentHTML("beforeend", r.ok ? burbuja(r.mensaje, nombre) : `<div class="msg sistema"><p>${esc(r.error || "No se pudo enviar.")}</p></div>`);
  caja.scrollTop = caja.scrollHeight;
  ta.focus();
}

/** Se llama una vez desde app.js. obtenerAgentes: función que devuelve la lista actual de agentes. */
export function iniciarChat(deps, obtenerAgentes) {
  ({ api, post } = deps);
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-charlar]");
    if (t) {
      e.preventDefault();
      abrirChat(t.dataset.charlar, obtenerAgentes());
      // Desde la lista del equipo: subir hasta la oficina para ver el acercamiento.
      const h = document.querySelector(".hero"), r = h?.getBoundingClientRect();
      if (r && (r.top < 0 || r.bottom > innerHeight)) h.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (e.target.closest("[data-cerrar-chat]")) cerrarChat();
  });
  document.addEventListener("submit", (e) => { const f = e.target.closest("#chat-form"); if (f) { e.preventDefault(); enviar(f); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && abierto) cerrarChat();
    if (e.key === "Enter" && !e.shiftKey && e.target.closest("#chat-form textarea")) { e.preventDefault(); enviar(e.target.form); }
  });
  document.addEventListener("input", (e) => { const ta = e.target.closest("#chat-form textarea"); if (ta) { ta.style.height = ""; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; } });
}
