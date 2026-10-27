const nombres = await c.evaluar(`[...document.querySelectorAll("button")].filter(b=>b.offsetParent&&/^(Publicar|Programar)$/.test(b.innerText.trim())).map(b=>b.innerText.trim())`);
console.log("botones:", nombres);
const ok = await c.evaluar(`(()=>{const b=[...document.querySelectorAll("button")].find(b=>b.offsetParent&&/^(Publicar|Programar)$/.test(b.innerText.trim()));if(!b||b.disabled)return false;b.click();return true})()`);
console.log("clic:", ok);
for (let i=0;i<20;i++){ await c.dormir(2000); const t = await c.evaluar("document.body.innerText"); const m = t.match(/Vídeo publicado|Vídeo programado|programad[oa][^\n]{0,80}|Error[^\n]{0,120}/i); if(m){console.log("resultado:", m[0]); break;} }
