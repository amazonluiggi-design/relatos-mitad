export interface Env {
  DB: D1Database;
  KV: KVNamespace;
  VIDEOS: R2Bucket;
  ASSETS: Fetcher;
  CLAVE: string;          // acceso de scripts (cabecera x-clave)
  PANEL_HASH: string;     // "sal:hash" PBKDF2 de la contraseña del panel
  SESION_SECRETO: string; // (heredado) firma de la cookie antigua
  CIFRADO_CLAVE: string;  // cifra en reposo los secretos MFA (AES-GCM)
  FB_PAGINA: string;
  FB_TOKEN: string;
  YT_CLIENTE: string;
  YT_SECRETO: string;
  PORTAL_CORREO: string;  // único correo que puede entrar desde el portal de empresas
}

export type Pub = {
  id: string; video_id: string; red: "facebook" | "youtube" | "tiktok"; cuando: string; estado: string;
  externo_id: string | null; url: string | null; privacidad: string | null; texto: string | null;
  error: string | null; intentos: number; publicado_en: string | null; opciones?: string | null;
};

export type Metrica = { vistas?: number | null; me_gusta?: number | null; comentarios?: number | null; compartidos?: number | null; extra?: unknown };

export async function evento(env: Env, mensaje: string, nivel: "info" | "aviso" | "error" = "info", red: string | null = null) {
  await env.DB.prepare("INSERT INTO eventos (nivel, red, mensaje) VALUES (?, ?, ?)").bind(nivel, red, mensaje.slice(0, 500)).run();
}

export async function guardarMetrica(env: Env, pubId: string, m: Metrica) {
  await env.DB.prepare("INSERT OR REPLACE INTO metricas (pub_id, momento, vistas, me_gusta, comentarios, compartidos, extra) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(pubId, new Date().toISOString().slice(0, 13) + ":00", m.vistas ?? null, m.me_gusta ?? null, m.comentarios ?? null, m.compartidos ?? null, m.extra ? JSON.stringify(m.extra) : null).run();
}

export async function guardarCuenta(env: Env, red: string, seguidores: number | null, vistas: number | null, videos: number | null) {
  await env.DB.prepare("INSERT OR REPLACE INTO cuentas_hist (red, momento, seguidores, vistas_totales, videos) VALUES (?, ?, ?, ?, ?)")
    .bind(red, new Date().toISOString().slice(0, 13) + ":00", seguidores, vistas, videos).run();
}
