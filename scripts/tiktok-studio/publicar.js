// Pulsa "Programar" y confirma: mensaje de TikTok, o salto a la lista de publicaciones, o formulario vacío de nuevo.
const nombres = await c.evaluar(`[...document.querySelectorAll("button")].filter(b=>b.offsetParent&&/^(Publicar|Programar|Post|Schedule)$/.test(b.innerText.trim())).map(b=>b.innerText.trim())`);
console.log("botones:", nombres);
const ok = await c.evaluar(`(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.offsetParent&&/^(Publicar|Programar|Post|Schedule)$/.test(b.innerText.trim()));if(!b||b.disabled)return false;b.click();return true})()`);
console.log("clic:", ok);
if (ok) for (let i = 0; i < 45; i++) {
  await c.dormir(2000);
  const u = await c.evaluar("location.href").catch(() => "");
  const t = await c.evaluar("document.body ? document.body.innerText : ''").catch(() => "");
  const m = t.match(/Vídeo publicado|Vídeo programado|programad[oa][^\n]{0,80}|Video (posted|scheduled)|scheduled[^\n]{0,80}/i); // "Error" suelto daba falsos avisos: se confirma por el salto a la lista
  if (m) { console.log("resultado:", m[0]); break; }
  if (u.includes("/tiktokstudio/content")) { console.log("resultado: pasó a Publicaciones"); break; }
  if (/Selecciona el vídeo que quieres cargar|Select video to upload/.test(t)) { console.log("resultado: formulario reiniciado tras programar"); break; }
}
