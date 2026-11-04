// Reconecta las estadísticas de YouTube del panel: copia el refresh token vivo de la laptop
// (~/.relatos-secretos/youtube-token.json) a la clave KV "yt-refresh" del Worker. No imprime el token.
// Uso (desde ~/relatos-mitad): node autopilot/scripts/yt-a-panel.mjs
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
const T = JSON.parse(fs.readFileSync(path.join(os.homedir(), ".relatos-secretos/youtube-token.json"), "utf8"));
const r = await (await fetch("https://oauth2.googleapis.com/token", { method: "POST", body: new URLSearchParams({ client_id: T.client_id, client_secret: T.client_secret, refresh_token: T.refresh_token, grant_type: "refresh_token" }) })).json();
if (!r.access_token) throw new Error("El token de la laptop tampoco sirve: hay que correr node scripts/yt-auth.mjs");
const tmp = path.join(os.tmpdir(), "yt-refresh.txt");
fs.writeFileSync(tmp, T.refresh_token);
try {
  execFileSync("npx", ["wrangler", "kv", "key", "put", "--namespace-id=99bae21dfbdc455c93c18b9374c10240", "yt-refresh", `--path=${tmp}`, "--remote"], { cwd: path.join(process.cwd(), "autopilot"), stdio: "inherit", shell: true });
  console.log("Listo: el panel vuelve a leer YouTube en la próxima hora.");
} finally { fs.rmSync(tmp, { force: true }); }
