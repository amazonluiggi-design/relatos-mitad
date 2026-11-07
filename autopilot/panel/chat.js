// Oficina virtual: acercamiento al trabajador + chat con él (mensajes y lo que va haciendo, en vivo),
// y el "vuelo" de los mensajes (sobre dorado hecho en Remotion) cuando Michael reparte trabajo.
import { PUESTOS } from "/inicio.js";

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const EST = { disponible: "Disponible", investigando: "Investigando", analizando: "Analizando", escribiendo: "Escribiendo", produciendo: "Produciendo", renderizando: "Renderizando", revisando: "Revisando", coordinando: "Coordinando", pausa: "En pausa", error: "Error", pendiente: "Tiene pendientes" };
const ESCALA = 1.6; // con la imagen HD se mantiene nítido
const ATAJOS = ["¿Qué estás haciendo ahora?", "¿Qué hiciste hoy?", "¿Qué propones para crecer esta semana?"];
const CURVA = "cubic-bezier(.4,0,.2,1)";
let abierto = null, api, post, nombreAbierto = "";

export const agenteAbierto = () => abierto;

function encuadre(x, y, destX, destY) {
  const lim = ((ESCALA - 1) * 50) / ESCALA; // más allá se verían los bordes
  const c = (v) => Math.max(-lim, Math.min(lim, v));
  return [c((destX - 50) / ESCALA - (x - 50)), c((destY - 50) / ESCALA - (y - 50))];
}

const fechaDe = (s) => new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z");
const hora = (s) => fechaDe(s).toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" });
const burbuja = (m) => `<div class="msg ${m.rol === "dueño" ? "yo" : "el"}"><p>${esc(m.texto)}</p>
  <small>${m.rol === "dueño" ? "Tú" : esc(nombreAbierto)} · ${esc(hora(m.cuando))}${m.tarea_id ? ` · <span class="tarea-chip">📌 Tarea #${m.tarea_id} creada</span>` : ""}</small></div>`;
const nota = (e) => e.agente_id === "michael" && abierto !== "michael" && /^Asignó a /.test(e.mensaje)
  ? `<div class="msg nota orden" data-ev="${e.id}"><p>📨 Michael te asignó: <b>${esc(e.mensaje.replace(/^Asignó a [a-z-]+: /, ""))}</b></p><small>${esc(hora(e.cuando))}</small></div>`
  : `<div class="msg nota" data-ev="${e.id}"><p><i class="est-${esc(e.estado || "")}"></i>${esc(e.mensaje)}</p><small>${esc(hora(e.cuando))}</small></div>`;

/** Mensajes + actividad del agente, en orden de tiempo. */
function linea(d) {
  const todo = [...d.mensajes.map((m) => ({ t: fechaDe(m.cuando), h: burbuja(m) })), ...d.actividad.map((e) => ({ t: fechaDe(e.cuando), h: nota(e) }))];
  return todo.sort((a, b) => a.t - b.t).map((x) => x.h).join("");
}
function pintarAhora(d) {
  const el = document.getElementById("chat-ahora");
  if (!el || !d.ahora) return;
  const vivo = !["disponible", "pausa"].includes(d.ahora.estado);
  el.className = "chat-ahora" + (vivo ? " vivo" : "");
  el.innerHTML = `<i></i>${vivo ? `Ahora: <b>${esc(EST[d.ahora.estado] || d.ahora.estado)}</b>${d.ahora.tarea ? " · " + esc(d.ahora.tarea) : ""}` : "Disponible · esperando la próxima jornada o tu mensaje"}`;
}

function verHD(hero, si) {
  const img = hero.querySelector(".escena-hd");
  if (!img) return;
  if (si && !img.getAttribute("src")) { img.src = img.dataset.src; img.decode?.().then(() => hero.classList.toggle("hd", hero.classList.contains("enfocada"))).catch(() => {}); }
  hero.classList.toggle("hd", si && img.complete && img.naturalWidth > 0);
}

export async function abrirChat(id, agentes) {
  const hero = document.querySelector(".hero");
  const panel = document.getElementById("chat");
  const a = agentes.find((x) => x.id === id);
  if (!hero || !panel || !a) return;
  abierto = id; nombreAbierto = a.nombre;
  const [x, y] = PUESTOS[id] || [50, 50];
  const ancho = hero.getBoundingClientRect().width > 760;
  const [tx, ty] = encuadre(x, y, ancho ? 30 : 50, ancho ? 54 : 42);
  hero.querySelector(".escena-mov").style.transform = `scale(${ESCALA}) translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%)`;
  hero.classList.add("enfocada");
  verHD(hero, true);
  hero.querySelectorAll(".etiqueta").forEach((e) => e.classList.toggle("elegida", e.dataset.charlar === id));
  panel.hidden = false;
  panel.innerHTML = `<header class="chat-cab"><span class="chat-ava">${esc(a.nombre[0])}</span>
      <div><b>${esc(a.nombre)}</b><small>${esc(a.cargo)}</small></div>
      <button class="chat-ficha" data-agente="${esc(id)}">Ficha</button><button class="chat-cerrar" data-cerrar-chat aria-label="Cerrar chat">✕</button></header>
    <p class="chat-ahora" id="chat-ahora"><i></i>…</p>
    <div class="chat-msgs" id="chat-msgs"><div class="chat-cargando"><i></i><i></i><i></i></div></div>
    <div class="chat-atajos">${ATAJOS.map((t) => `<button type="button" data-atajo="${esc(t)}">${esc(t)}</button>`).join("")}</div>
    <form class="chat-form" id="chat-form"><textarea rows="1" maxlength="1500" placeholder="Escríbele a ${esc(a.nombre)}…" aria-label="Mensaje"></textarea><button aria-label="Enviar">➤</button></form>`;
  requestAnimationFrame(() => panel.classList.add("visible"));
  const d = await api("/chat/" + id).catch(() => ({ mensajes: [], actividad: [], ahora: null }));
  if (abierto !== id) return;
  pintarAhora(d);
  const caja = document.getElementById("chat-msgs");
  caja.innerHTML = linea(d) || `<p class="chat-vacio">Escríbele a ${esc(a.nombre)}: te contesta al momento. Si le pides un trabajo, lo anota y lo hace con el equipo.</p>`;
  caja.scrollTop = caja.scrollHeight;
  panel.querySelector("textarea").focus({ preventScroll: true });
}

/** Lo llama el refresco en vivo: trae lo nuevo que hizo el agente sin perder la posición del chat. */
export async function refrescarChat() {
  if (!abierto) return;
  const id = abierto, d = await api("/chat/" + id).catch(() => null);
  if (!d || abierto !== id) return;
  pintarAhora(d);
  const caja = document.getElementById("chat-msgs");
  if (!caja || caja.querySelector(".escribiendo")) return;
  const vistos = new Set([...caja.querySelectorAll("[data-ev]")].map((n) => n.dataset.ev));
  const nuevos = d.actividad.filter((e) => !vistos.has(String(e.id)));
  if (!nuevos.length) return;
  const abajo = caja.scrollHeight - caja.scrollTop - caja.clientHeight < 40;
  caja.querySelector(".chat-vacio")?.remove();
  caja.insertAdjacentHTML("beforeend", nuevos.map(nota).join(""));
  if (abajo) caja.scrollTop = caja.scrollHeight;
}

export function cerrarChat() {
  const hero = document.querySelector(".hero");
  const panel = document.getElementById("chat");
  abierto = null;
  if (hero) { hero.querySelector(".escena-mov").style.transform = ""; hero.classList.remove("enfocada", "hd"); hero.querySelectorAll(".etiqueta.elegida").forEach((e) => e.classList.remove("elegida")); }
  if (panel) { panel.classList.remove("visible"); setTimeout(() => { if (!abierto) panel.hidden = true; }, 380); }
}

async function enviar(form, texto) {
  const ta = form.querySelector("textarea");
  texto = (texto ?? ta.value).trim();
  if (!texto || !abierto) return;
  const id = abierto, caja = document.getElementById("chat-msgs");
  caja.querySelector(".chat-vacio")?.remove();
  caja.insertAdjacentHTML("beforeend", burbuja({ rol: "dueño", texto, cuando: new Date().toISOString() }) + `<div class="msg el escribiendo"><span><i></i><i></i><i></i></span></div>`);
  caja.scrollTop = caja.scrollHeight;
  ta.value = ""; ta.style.height = "";
  form.querySelector("button").disabled = true;
  const r = await post("/chat/" + id, { texto });
  form.querySelector("button").disabled = false;
  if (abierto !== id) return;
  caja.querySelector(".escribiendo")?.remove();
  caja.insertAdjacentHTML("beforeend", r.ok ? burbuja(r.mensaje) : `<div class="msg sistema"><p>${esc(r.error || "No se pudo enviar.")}</p></div>`);
  caja.scrollTop = caja.scrollHeight;
  ta.focus({ preventScroll: true });
}

/* ───── Vuelo del mensaje (sobre dorado de Remotion) de un puesto a otro ───── */
const SAFARI = /^((?!chrome|android).)*safari/i.test(navigator.userAgent); // Safari no muestra WebM con transparencia
function centro(hero, id) {
  const h = hero.getBoundingClientRect();
  if (id === "ceo") return [h.width / 2, 8];
  const e = hero.querySelector(`.etiqueta[data-charlar="${id}"]`);
  if (!e) return null;
  const r = e.getBoundingClientRect();
  return [r.left - h.left + r.width / 2, r.top - h.top + r.height / 2];
}
export function volar(desde, hacia, retardo = 0) {
  const hero = document.querySelector(".hero");
  if (!hero || document.hidden || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // Con el chat abierto solo vuela si va para quien estás mirando (entra desde arriba hasta su puesto).
  if (hero.classList.contains("enfocada") && hacia !== abierto) return;
  const a = hero.classList.contains("enfocada") ? centro(hero, "ceo") : centro(hero, desde), b = centro(hero, hacia);
  if (!a || !b) return;
  const capa = hero.querySelector(".vuelos");
  const el = document.createElement("div");
  el.className = "vuelo";
  el.innerHTML = SAFARI ? `<span class="vuelo-css">✉</span>` : `<video src="/mensaje.webm" autoplay loop muted playsinline></video>`;
  capa.appendChild(el);
  const alto = Math.min(a[1], b[1]) - Math.max(50, Math.abs(b[0] - a[0]) * 0.25); // arco
  const anim = el.animate([
    { transform: `translate(${a[0]}px, ${a[1]}px) scale(.4)`, opacity: 0 },
    { transform: `translate(${(a[0] + b[0]) / 2}px, ${alto}px) scale(1)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${b[0]}px, ${b[1]}px) scale(.55)`, opacity: 1, offset: 0.92 },
    { transform: `translate(${b[0]}px, ${b[1]}px) scale(.3)`, opacity: 0 },
  ], { duration: 1700, delay: retardo, easing: CURVA, fill: "both" });
  anim.onfinish = () => {
    el.remove();
    const destino = hero.querySelector(`.etiqueta[data-charlar="${hacia}"]`);
    if (destino) {
      destino.classList.remove("recibe"); void destino.offsetWidth; destino.classList.add("recibe");
      destino.insertAdjacentHTML("beforeend", `<span class="nueva-tarea">📨 Nueva tarea</span>`);
      setTimeout(() => { destino.classList.remove("recibe"); destino.querySelector(".nueva-tarea")?.remove(); }, 3500);
    }
    if (hacia === abierto) refrescarChat();
  };
}

export function iniciarChat(deps, obtenerAgentes) {
  ({ api, post } = deps);
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-charlar]");
    if (t) {
      e.preventDefault();
      abrirChat(t.dataset.charlar, obtenerAgentes());
      const h = document.querySelector(".hero"), r = h?.getBoundingClientRect();
      if (r && (r.top < 0 || r.bottom > innerHeight)) h.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const at = e.target.closest("[data-atajo]");
    if (at) { enviar(document.getElementById("chat-form"), at.dataset.atajo); return; }
    if (e.target.closest("[data-cerrar-chat]")) cerrarChat();
  });
  document.addEventListener("submit", (e) => { const f = e.target.closest("#chat-form"); if (f) { e.preventDefault(); enviar(f); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && abierto) cerrarChat();
    if (e.key === "Enter" && !e.shiftKey && e.target.closest("#chat-form textarea")) { e.preventDefault(); enviar(e.target.form); }
  });
  document.addEventListener("input", (e) => { const ta = e.target.closest("#chat-form textarea"); if (ta) { ta.style.height = ""; ta.style.height = Math.min(ta.scrollHeight, 120) + "px"; } });
}
