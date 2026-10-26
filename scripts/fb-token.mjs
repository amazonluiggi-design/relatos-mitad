// Convierte el token de Facebook en un token de página permanente.
// Lee ~/.relatos-secretos/facebook.txt y escribe ~/.relatos-secretos/facebook-pagina.json (no imprime claves).
import fs from "node:fs";
import os from "node:os";
const dir = os.homedir() + "/.relatos-secretos";
const txt = fs.readFileSync(dir + "/facebook.txt", "utf8").replace(/^﻿/, "");
const v = Object.fromEntries(txt.split(/\r?\n/).map((l) => l.split("=")).filter((p) => p.length >= 2).map(([k, ...r]) => [k.trim(), r.join("=").trim()]));
for (const k of ["APP_ID", "APP_SECRET", "TOKEN"]) if (!v[k]) throw new Error("Falta " + k);
const G = "https://graph.facebook.com/v23.0";
const get = async (u) => { const r = await fetch(u); const j = await r.json(); if (j.error) throw new Error(j.error.message); return j; };
const largo = await get(`${G}/oauth/access_token?grant_type=fb_exchange_token&client_id=${v.APP_ID}&client_secret=${v.APP_SECRET}&fb_exchange_token=${encodeURIComponent(v.TOKEN)}`);
const yo = await get(`${G}/me?fields=id,name&access_token=${largo.access_token}`);
console.log("token de:", yo.name);
let pagina;
try {
  const cuentas = await get(`${G}/me/accounts?fields=id,name,access_token,tasks&access_token=${largo.access_token}`);
  console.log("páginas:", cuentas.data.map((p) => p.name).join(", ") || "(ninguna)");
  pagina = cuentas.data.find((p) => /relatos/i.test(p.name));
} catch (e) { console.log("me/accounts:", e.message); }
if (!pagina && /relatos/i.test(yo.name)) pagina = { id: yo.id, name: yo.name, access_token: largo.access_token };
if (!pagina) throw new Error("No encontré la página Relatos De La Mitad");
const dbg = await get(`${G}/debug_token?input_token=${pagina.access_token}&access_token=${v.APP_ID}|${v.APP_SECRET}`);
console.log("página:", pagina.name, pagina.id, "| caduca:", dbg.data.expires_at ? new Date(dbg.data.expires_at * 1000).toISOString() : "nunca", "| permisos:", dbg.data.scopes.join(","));
fs.writeFileSync(dir + "/facebook-pagina.json", JSON.stringify({ id: pagina.id, nombre: pagina.name, token: pagina.access_token, app: v.APP_ID }));
