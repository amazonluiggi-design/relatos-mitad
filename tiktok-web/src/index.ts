// Páginas públicas de Relatos de la Mitad (términos, privacidad) y regreso de la conexión con TikTok.
interface Env { KV: KVNamespace; CLAVE: string }

const pagina = (titulo: string, cuerpo: string) =>
  new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${titulo} · Relatos de la Mitad</title>
<style>body{font-family:system-ui,sans-serif;max-width:720px;margin:40px auto;padding:0 16px;line-height:1.6;background:#0b0f12;color:#ece3d6}h1{color:#f2a33a}a{color:#f2a33a}</style></head>
<body><h1>${titulo}</h1>${cuerpo}<p style="opacity:.6;margin-top:40px">Relatos de la Mitad · Ecuador · Última actualización: 26 de octubre de 2026</p></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } });

const TERMINOS = `<p>Relatos de la Mitad es un canal de historias, leyendas y misterios de Ecuador y Latinoamérica. Esta herramienta interna la usa únicamente el propietario del canal para publicar su propio contenido en sus cuentas de TikTok, YouTube y Facebook.</p>
<p>No ofrece servicios a terceros, no vende nada y no publica contenido de otras personas. Al conectar una cuenta, el propietario autoriza que la herramienta suba los videos que él mismo produjo.</p>
<p>El contenido publicado respeta las normas de cada plataforma. Las imágenes generadas con inteligencia artificial se declaran como tales.</p>
<p>Contacto: a través de la página <a href="https://www.facebook.com/RelatosDeLaMitad">facebook.com/RelatosDeLaMitad</a>.</p>`;

const PRIVACIDAD = `<p>Esta herramienta solo se conecta a las cuentas del propietario de Relatos de la Mitad.</p>
<p><b>Datos que usa:</b> el identificador de la cuenta y un token de acceso para publicar videos. No recopila datos de seguidores ni de otros usuarios.</p>
<p><b>Dónde se guardan:</b> los tokens se guardan cifrados en el equipo del propietario. No se venden ni se comparten con terceros.</p>
<p><b>Cómo eliminarlos:</b> el propietario puede revocar el acceso en cualquier momento desde la configuración de su cuenta de TikTok, Google o Facebook.</p>
<p>Contacto: <a href="https://www.facebook.com/RelatosDeLaMitad">facebook.com/RelatosDeLaMitad</a>.</p>`;

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const u = new URL(req.url);
    // Archivo de verificación de TikTok for Developers (URL prefix).
    if (u.pathname === "/tiktokJEfAvB3rYE4yXwzUgcZ9vUfoxuKctZfp.txt")
      return new Response("tiktok-developers-site-verification=JEfAvB3rYE4yXwzUgcZ9vUfoxuKctZfp", { headers: { "content-type": "text/plain" } });
    if (u.pathname === "/terminos") return pagina("Términos del servicio", TERMINOS);
    if (u.pathname === "/privacidad") return pagina("Política de privacidad", PRIVACIDAD);
    if (u.pathname === "/tiktok/regreso") {
      const code = u.searchParams.get("code");
      if (code) await env.KV.put("tiktok-code", JSON.stringify({ code, state: u.searchParams.get("state") }), { expirationTtl: 600 });
      if (code) return Response.redirect("https://relatos-autopilot.probador-worker.workers.dev/#tiktok-conectado", 302);
      return pagina(code ? "Conectado" : "Sin permiso", code ? "<p>TikTok quedó conectado a Relatos de la Mitad. Ya puedes cerrar esta pestaña.</p>" : `<p>${u.searchParams.get("error_description") || "No se dio el permiso."}</p>`);
    }
    if (u.pathname === "/tiktok/codigo" && req.headers.get("x-clave") === env.CLAVE) {
      const v = await env.KV.get("tiktok-code");
      if (v) await env.KV.delete("tiktok-code");
      return new Response(v || "{}", { headers: { "content-type": "application/json" } });
    }
    if (u.pathname === "/") return pagina("Relatos de la Mitad", `<p>Leyendas, misterios e historias reales de Ecuador y Latinoamérica.</p><p><a href="/terminos">Términos</a> · <a href="/privacidad">Privacidad</a></p>`);
    return new Response("no", { status: 404 });
  },
};
