// TOTP (RFC 6238: SHA-1, 6 dígitos, 30 s), compatible con Google Authenticator, Microsoft Authenticator, Authy, 1Password.
// Y cifrado AES-GCM del secreto en reposo (la base nunca guarda el secreto en claro).

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function base32(bytes: Uint8Array) {
  let bits = 0, valor = 0, out = "";
  for (const b of bytes) {
    valor = (valor << 8) | b; bits += 8;
    while (bits >= 5) { out += B32[(valor >>> (bits - 5)) & 31]; bits -= 5; }
  }
  if (bits > 0) out += B32[(valor << (5 - bits)) & 31];
  return out;
}

export function desdeBase32(s: string) {
  const limpio = s.toUpperCase().replace(/[^A-Z2-7]/g, "");
  let bits = 0, valor = 0;
  const out: number[] = [];
  for (const c of limpio) {
    valor = (valor << 5) | B32.indexOf(c); bits += 5;
    if (bits >= 8) { out.push((valor >>> (bits - 8)) & 255); bits -= 8; }
  }
  return new Uint8Array(out);
}

export async function codigoTotp(secreto: string, paso: number) {
  const k = await crypto.subtle.importKey("raw", desdeBase32(secreto), { name: "HMAC", hash: "SHA-1" }, false, ["sign"]);
  const contador = new Uint8Array(8);
  new DataView(contador.buffer).setBigUint64(0, BigInt(paso));
  const h = new Uint8Array(await crypto.subtle.sign("HMAC", k, contador));
  const o = h[19] & 15;
  const n = ((h[o] & 127) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}

/** Devuelve el paso que coincide (ventana ±1 = ±30 s) o null. El llamador rechaza pasos ya usados. */
export async function verificarTotp(secreto: string, codigo: string, ahora = Date.now()) {
  if (!/^\d{6}$/.test(codigo)) return null;
  const paso = Math.floor(ahora / 30000);
  for (const d of [0, -1, 1]) if ((await codigoTotp(secreto, paso + d)) === codigo) return paso + d;
  return null;
}

export const nuevoSecreto = () => base32(crypto.getRandomValues(new Uint8Array(20)));

async function llaveCifrado(material: string) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(material), "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: new TextEncoder().encode("relatos-group"), info: new TextEncoder().encode("totp-v1") },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
const b64 = (b: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(b)));
const desdeB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function cifrar(material: string, texto: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await llaveCifrado(material), new TextEncoder().encode(texto));
  return `v1.${b64(iv)}.${b64(c)}`;
}

export async function descifrar(material: string, sobre: string) {
  const [v, iv, c] = sobre.split(".");
  if (v !== "v1") throw new Error("formato de cifrado desconocido");
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: desdeB64(iv) }, await llaveCifrado(material), desdeB64(c)));
}
