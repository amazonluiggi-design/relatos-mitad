// Guarda un secreto en el repositorio de GitHub (cifrado con la llave pública del repo). El valor llega por la entrada estándar.
// echo VALOR | node scripts/secreto-github.mjs NOMBRE     (usa la credencial de git de esta PC)
import sodium from "libsodium-wrappers";
import { execSync } from "node:child_process";
const REPO = "amazonluiggi-design/relatos-mitad";
const nombre = process.argv[2];
if (!/^[A-Z_][A-Z0-9_]*$/.test(nombre || "")) throw new Error("uso: echo VALOR | node scripts/secreto-github.mjs NOMBRE");
let valor = "";
for await (const c of process.stdin) valor += c;
valor = valor.trim();
if (!valor) throw new Error("valor vacío");
const tok = execSync("git credential fill", { input: "protocol=https\nhost=github.com\n\n" }).toString().match(/^password=(.*)$/m)?.[1];
if (!tok) throw new Error("no hay credencial de GitHub en esta PC");
const H = { Authorization: `Bearer ${tok}`, Accept: "application/vnd.github+json" };
const llave = await (await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/public-key`, { headers: H })).json();
if (!llave.key) throw new Error("no pude leer la llave pública del repo: " + JSON.stringify(llave).slice(0, 200));
await sodium.ready;
const cifrado = sodium.to_base64(sodium.crypto_box_seal(sodium.from_string(valor), sodium.from_base64(llave.key, sodium.base64_variants.ORIGINAL)), sodium.base64_variants.ORIGINAL);
const r = await fetch(`https://api.github.com/repos/${REPO}/actions/secrets/${nombre}`, { method: "PUT", headers: H, body: JSON.stringify({ encrypted_value: cifrado, key_id: llave.key_id }) });
console.log(r.ok ? `✓ ${nombre} guardado en GitHub` : `✗ ${nombre}: ${r.status} ${await r.text()}`);
if (!r.ok) process.exit(1);
