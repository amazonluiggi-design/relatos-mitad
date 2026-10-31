// Autoriza la subida a YouTube (OAuth de escritorio con servidor local) y guarda el token de renovación.
import fs from "node:fs";
import os from "node:os";
import http from "node:http";
import { spawn } from "node:child_process";
const dir = os.homedir() + "/.relatos-secretos";
const txt = fs.readFileSync(dir + "/google.txt", "utf8").replace(/^\uFEFF/, "");
const v = Object.fromEntries(txt.split(/\r?\n/).map((l) => l.split("=")).filter((p) => p.length >= 2).map(([k, ...r]) => [k.trim(), r.join("=").trim()]));
if (!v.CLIENT_ID || !v.CLIENT_SECRET) throw new Error("Faltan CLIENT_ID o CLIENT_SECRET en google.txt");
const SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.force-ssl";
const srv = http.createServer();
await new Promise((r) => srv.listen(0, "127.0.0.1", r));
const redirect = `http://127.0.0.1:${srv.address().port}`;
const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(v.CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirect)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;
spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [url], { detached: true, stdio: "ignore" }).unref();
console.log("Esperando el permiso en Chrome...");
const code = await new Promise((resolve, reject) => {
  srv.on("request", (req, res) => {
    const q = new URL(req.url, redirect).searchParams;
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(q.get("code") ? "<h2>Listo. Relatos de la Mitad quedó conectado a YouTube. Ya puedes cerrar esta pestaña.</h2>" : "<h2>No se dio el permiso.</h2>");
    q.get("code") ? resolve(q.get("code")) : reject(new Error(q.get("error") || "sin código"));
  });
  setTimeout(() => reject(new Error("tiempo agotado")), 600000);
});
srv.close();
const r = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  body: new URLSearchParams({ code, client_id: v.CLIENT_ID, client_secret: v.CLIENT_SECRET, redirect_uri: redirect, grant_type: "authorization_code" }),
});
const t = await r.json();
if (!t.refresh_token) throw new Error("Sin refresh_token: " + JSON.stringify(t).slice(0, 200));
const ch = await (await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${t.access_token}` } })).json();
const canal = ch.items?.[0];
fs.writeFileSync(dir + "/youtube-token.json", JSON.stringify({ client_id: v.CLIENT_ID, client_secret: v.CLIENT_SECRET, refresh_token: t.refresh_token, canal: canal?.id, nombre: canal?.snippet?.title }));
console.log("Conectado al canal:", canal?.snippet?.title, canal?.id);
