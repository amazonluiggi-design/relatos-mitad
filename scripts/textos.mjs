// Lleva el texto actual de publicaciones/<h>.mjs a lo ya programado: Facebook (descripción), YouTube (descripción)
// y el panel (TikTok aún por programar). node scripts/textos.mjs <historia> <clave> [<clave>...]   (clave: reel2, parte1…)
import fs from "node:fs";
import os from "node:os";
import { sql } from "./nube.mjs";
const [, , h, ...claves] = process.argv;
const { PUBLICACION } = await import(`../publicaciones/${h}.mjs`);
const P = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/facebook-pagina.json", "utf8"));
const T = JSON.parse(fs.readFileSync(os.homedir() + "/.relatos-secretos/youtube-token.json", "utf8"));
const leer = (r) => (fs.existsSync(`publicaciones/${h}-${r}.json`) ? JSON.parse(fs.readFileSync(`publicaciones/${h}-${r}.json`, "utf8")) : {});
const fb = leer("fb"), yt = leer("yt");
const tok = (await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json()).access_token;
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
for (const k of claves) {
  const n = +k.replace(/\D/g, "") - 1, p = (k.startsWith("parte") ? PUBLICACION.partes : PUBLICACION.reels)[n];
  const pag = p.texto, ytxt = p.texto.replace("en la página", "en el canal").replace("Sígueme para la", "Suscríbete para la");
  const ttxt = k.startsWith("parte") ? p.texto : p.texto.replace("en la página 👆", "en YouTube 👆");
  if (fb[k] && !k.startsWith("parte")) {
    const r = await (await fetch(`https://graph.facebook.com/v23.0/${fb[k].id}`, { method: "POST", body: new URLSearchParams({ description: pag, access_token: P.token }) })).json();
    console.log(k, "facebook:", r.error ? "ERROR " + r.error.message : "ok");
  }
  if (yt[k]) {
    const v = (await (await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${yt[k].id}`, { headers: { Authorization: `Bearer ${tok}` } })).json()).items?.[0];
    if (v) {
      const snippet = { ...v.snippet, description: k.startsWith("parte") ? ytxt : ytxt };
      delete snippet.thumbnails; delete snippet.localized; delete snippet.publishedAt; delete snippet.channelId; delete snippet.channelTitle; delete snippet.liveBroadcastContent;
      const r = await fetch("https://www.googleapis.com/youtube/v3/videos?part=snippet", { method: "PUT", headers: { Authorization: `Bearer ${tok}`, "Content-Type": "application/json" }, body: JSON.stringify({ id: yt[k].id, snippet }) });
      console.log(k, "youtube:", r.ok ? "ok" : "ERROR " + (await r.text()).slice(0, 200));
    }
  }
  console.log(k, "panel:", JSON.stringify(await sql([`UPDATE publicaciones SET texto = ${q(ttxt)} WHERE video_id = ${q(`${h}-${k}`)} AND red = 'tiktok' AND estado = 'por-programar';`, `UPDATE publicaciones SET texto = ${q(pag)} WHERE video_id = ${q(`${h}-${k}`)} AND red = 'facebook' AND estado <> 'publicado';`])));
}
