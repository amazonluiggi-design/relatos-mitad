// Informe del día para el CEO: qué hizo el equipo, qué cambió en las redes y qué se publicó (datos reales del día).
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const hora = (s) => s ? new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleTimeString("es-EC", { timeZone: "America/Guayaquil", hour: "2-digit", minute: "2-digit" }) : "";
const RED = { facebook: "Facebook", youtube: "YouTube", tiktok: "TikTok" };
const QUE = { "agente-red-reprogramar": "cambió la hora", "agente-red-texto": "mejoró el texto", "agente-red-retener": "retuvo un video" };
const md = (s) => esc(s).replace(/^#{1,4} (.*)$/gm, "<b class='md-t'>$1</b>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>");

export function diaHtml(d) {
  const fecha = new Date(d.dia + "T12:00:00-05:00");
  const mover = (k) => new Date(fecha.getTime() + k * 86400e3).toISOString().slice(0, 10);
  const hoy = new Date(Date.now() - 5 * 3600e3).toISOString().slice(0, 10);
  const hechas = d.tareas.filter((t) => t.estado === "hecha");
  const cambiosOk = d.cambios.filter((c) => / · ok · /.test(c.detalle));
  const porAgente = {};
  for (const t of d.tareas) (porAgente[t.nombre] ??= []).push(t);
  const informe = d.informes[0];
  return `<div class="dia-cab">
      <h2 class="casa-titulo">Informe del día</h2>
      <div class="dia-nav"><a href="#dia=${mover(-1)}" aria-label="Día anterior">‹</a>
        <b>${esc(fecha.toLocaleDateString("es-EC", { weekday: "long", day: "numeric", month: "long" }))}</b>
        ${d.dia < hoy ? `<a href="#dia=${mover(1)}" aria-label="Día siguiente">›</a>` : "<span></span>"}</div>
    </div>
    <div class="kpis dia-kpis">
      <div class="kpi-c rev"><span class="kpi-ico">✓</span><div><b data-contar="${hechas.length}">0</b><small>tareas terminadas</small></div></div>
      <div class="kpi-c rev"><span class="kpi-ico">🛠</span><div><b data-contar="${cambiosOk.length}">0</b><small>cambios en las redes</small></div></div>
      <div class="kpi-c rev"><span class="kpi-ico">▶</span><div><b data-contar="${d.publicadas.length}">0</b><small>publicaciones salieron</small></div></div>
      <div class="kpi-c rev"><span class="kpi-ico">💬</span><div><b data-contar="${d.chats}">0</b><small>mensajes en el chat</small></div></div>
    </div>
    <div class="rejilla r2 dia-cuerpo">
      <div class="tarjeta rev"><h3>♛ Lo que te cuenta Michael</h3>
        ${informe ? `<div class="md dia-informe">${md(informe.contenido.slice(0, 4000))}</div><p class="nd">${esc(informe.titulo)} · ${esc(hora(informe.creado))}</p>` : `<div class="vacio">Michael todavía no ha cerrado una jornada este día. Escribe el informe en las jornadas de 07:00, 15:00 y 22:00.</div>`}
      </div>
      <div class="tarjeta rev"><h3>☰ Qué hizo cada uno</h3>
        ${Object.keys(porAgente).length ? Object.entries(porAgente).map(([n, ts]) => `<div class="dia-agente"><b>${esc(n)}</b>${ts.map((t) => `<p data-tarea="${t.id}" class="fila-clic"><span class="chip ${t.estado === "hecha" ? "publicado" : t.estado === "en-curso" ? "enviado" : ""}">${esc(t.estado)}</span> ${esc(t.titulo)}${t.calidad != null ? ` <span class="nd">· ${t.calidad}/100</span>` : ""}</p>`).join("")}</div>`).join("") : `<div class="vacio">Sin tareas este día.</div>`}
      </div>
    </div>
    <div class="rejilla r2">
      <div class="tarjeta rev"><h3>🛠 Cambios que hicieron en las redes</h3>
        ${d.cambios.length ? `<ul class="memoria">${d.cambios.map((c) => { const [obj, res, ...m] = c.detalle.split(" · "); return `<li><span class="nd">${esc(hora(c.cuando))}</span> <b>${esc(c.actor)}</b> ${esc(QUE[c.accion] || c.accion)} de <b>${esc(obj)}</b> ${res === "ok" ? "" : `<span class="chip fallido">${esc(res)}</span>`}<br><span class="nd">${esc(m.join(" · "))}</span></li>`; }).join("")}</ul>` : `<div class="vacio">No movieron nada en las redes este día.</div>`}
      </div>
      <div class="tarjeta rev"><h3>▶ Lo que salió publicado</h3>
        ${d.publicadas.length ? `<ul class="memoria">${d.publicadas.map((p) => `<li><span class="nd">${esc(hora(p.publicado_en))}</span> <span class="chip ${esc(p.red)}">${esc(RED[p.red] || p.red)}</span> ${esc(p.titulo)}</li>`).join("")}</ul>` : `<div class="vacio">Nada publicado este día.</div>`}
      </div>
    </div>`;
}
