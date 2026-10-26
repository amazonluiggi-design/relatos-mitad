// Conecta TikTok (Login Kit web): abre el permiso en Chrome, recoge el código en el Worker y guarda los tokens.
import fs from "node:fs";
import os from "node:os";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
const dir = os.homedir() + "/.relatos-secretos";
const leer = (f) => Object.fromEntries(fs.readFileSync(dir + "/" + f, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/).map((l) => l.split("=")).filter((p) => p.length >= 2).map(([k, ...r]) => [k.trim(), r.join("=").trim()]));
const v = leer("tiktok.txt");
const CLAVE = fs.readFileSync(dir + "/clave-imagenes.txt", "utf8").trim();
const WEB = "https://relatos-web.probador-worker.workers.dev";
const redirect = WEB + "/tiktok/regreso";
const state = crypto.randomBytes(8).toString("hex");
await fetch(WEB + "/tiktok/codigo", { headers: { "x-clave": CLAVE } }); // limpia un código viejo
const url = `https://www.tiktok.com/v2/auth/authorize/?client_key=${v.CLIENT_KEY}&scope=user.info.basic,user.info.stats,video.list,video.upload,video.publish&response_type=code&redirect_uri=${encodeURIComponent(redirect)}&state=${state}`;
spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [url], { detached: true, stdio: "ignore" }).unref();
console.log("Esperando el permiso en Chrome...");
let code;
for (let i = 0; i < 200 && !code; i++) {
  await new Promise((r) => setTimeout(r, 3000));
  const j = await (await fetch(WEB + "/tiktok/codigo", { headers: { "x-clave": CLAVE } })).json();
  if (j.code && j.state === state) code = j.code;
}
if (!code) throw new Error("tiempo agotado");
const t = await (await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
  method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({ client_key: v.CLIENT_KEY, client_secret: v.CLIENT_SECRET, code, grant_type: "authorization_code", redirect_uri: redirect }),
})).json();
if (!t.access_token) throw new Error("token: " + JSON.stringify(t).slice(0, 300));
const u = await (await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", { headers: { Authorization: `Bearer ${t.access_token}` } })).json();
fs.writeFileSync(dir + "/tiktok-token.json", JSON.stringify({ client_key: v.CLIENT_KEY, client_secret: v.CLIENT_SECRET, ...t, obtenido: Date.now() }));
console.log("Conectado:", u.data?.user?.display_name, "| permisos:", t.scope, "| renovación vence en", Math.round(t.refresh_expires_in / 86400), "días");
