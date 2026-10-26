// Generador privado de imágenes para Relatos de la Mitad (Workers AI).
// POST { prompt, modelo?, ancho?, alto?, pasos?, semilla? } con cabecera x-clave.
interface Env { AI: Ai; CLAVE: string }

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    if (req.method !== "POST" || req.headers.get("x-clave") !== env.CLAVE) {
      return new Response("no", { status: 403 });
    }
    const p = (await req.json()) as Record<string, unknown>;
    const modelo = String(p.modelo || "@cf/black-forest-labs/flux-1-schnell");
    const entrada: Record<string, unknown> = { prompt: p.prompt };
    if (p.ancho) entrada.width = p.ancho;
    if (p.alto) entrada.height = p.alto;
    if (p.pasos) entrada.steps = p.pasos;
    if (p.semilla) entrada.seed = p.semilla;
    let r: unknown;
    try {
    if (modelo.includes("flux-2")) {
      // FLUX.2 pide multipart.
      const fd = new FormData();
      for (const [k, v] of Object.entries(entrada)) fd.append(k, String(v));
      const f = new Response(fd);
      r = await env.AI.run(modelo as any, {
        multipart: { body: f.body, contentType: f.headers.get("content-type") },
      } as any);
    } else {
      r = await env.AI.run(modelo as any, entrada as any);
    }
    } catch (e) { return Response.json({ error: String(e) }, { status: 502 }); }
    if (r instanceof ReadableStream) return new Response(r, { headers: { "content-type": "image/png" } });
    const img = (r as { image?: string }).image;
    if (!img) return Response.json(r, { status: 500 });
    const bytes = Uint8Array.from(atob(img), (c) => c.charCodeAt(0));
    return new Response(bytes, { headers: { "content-type": "image/jpeg" } });
  },
};
