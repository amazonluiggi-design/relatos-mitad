// Convierte el token de usuario de Facebook (Explorador de la API Graph) en un token de página permanente.
// La página está en un portafolio y no sale en /me/accounts: se toma su id de los permisos concedidos.
// Lee ~/.relatos-secretos/facebook.txt y escribe facebook-pagina.json (no imprime claves).
import fs from "node:fs";
import os from "node:os";
const dir = os.homedir() + "/.relatos-secretos";
const txt = fs.readFileSync(dir + "/facebook.txt", "utf8").replace(/^﻿/, "");
const v = Object.fromEntries(txt.split(/\r?\n/).map((l) => l.split("=")).filter((p) => p.length >= 2).map(([k, ...r]) => [k.trim(), r.join("=").trim()]));
const G = "https://graph.facebook.com/v23.0";
const get = async (u) => { const j = await (await fetch(u)).json(); if (j.error) throw new Error(j.error.message); return j; };
const app = `${v.APP_ID}|${v.APP_SECRET}`;
const d = (await get(`${G}/debug_token?input_token=${v.TOKEN}&access_token=${app}`)).data;
console.log("permisos del token:", d.scopes.join(", "));
const id = d.granular_scopes.find((g) => g.scope === "pages_manage_posts")?.target_ids?.[0];
if (!id) throw new Error("El token no tiene acceso a ninguna página");
const largo = (await get(`${G}/oauth/access_token?grant_type=fb_exchange_token&client_id=${v.APP_ID}&client_secret=${v.APP_SECRET}&fb_exchange_token=${v.TOKEN}`)).access_token;
const p = await get(`${G}/${id}?fields=id,name,access_token,followers_count&access_token=${largo}`);
const dp = (await get(`${G}/debug_token?input_token=${p.access_token}&access_token=${app}`)).data;
console.log("página:", p.name, p.id, "| caduca:", dp.expires_at ? new Date(dp.expires_at * 1000).toISOString() : "nunca");
if (!/relatos/i.test(p.name)) throw new Error("no es la página Relatos");
fs.writeFileSync(dir + "/facebook-pagina.json", JSON.stringify({ id: p.id, nombre: p.name, token: p.access_token, app: v.APP_ID }));
