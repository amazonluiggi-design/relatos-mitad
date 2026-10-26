# Relatos Autopilot — Fase 1: auditoría, arquitectura y plan

Fecha: 2026-10-26. Dueño: canal **Relatos de la Mitad** (Facebook monetizado, YouTube y TikTok nuevos).

## 1. Auditoría: lo que ya existe y funciona

| Pieza | Estado | Dónde |
|---|---|---|
| Guion + escenas por historia | ✅ manual (Claude) | `historias/<id>.mjs` |
| Imágenes Lucid Origin (Workers AI) | ✅ | Worker `relatos-imagenes`, `generar-imagenes.mjs` |
| Voz ElevenLabs Starter (El Faraón) | ✅ | `scripts/voz.mjs`, clave `~/.relatos-secretos/elevenlabs.txt` |
| Montaje Remotion (largo 16:9 + reels 9:16, subtítulos, capítulos, miniatura) | ✅ local | `src/Relato.tsx`, `scripts/renderizar.sh` |
| Facebook: token de página permanente | ✅ verificado | app Meta "Relatos Publicador", `scripts/fb-publicar.mjs` |
| YouTube: OAuth + subida programada | ✅ (app en "Prueba": token 7 días; sin auditoría puede bloquear en privado) | proyecto `relatos-publicador-512817`, `scripts/yt-publicar.mjs` |
| TikTok: Login Kit + Direct Post (Sandbox) | ✅ conectado; público depende de la auditoría | app TikTok 7700997646324942868 |
| Publicador TikTok en la nube (cron 5 min) | ✅ desplegado | Worker `relatos-autopilot`, KV + R2 |

Faltantes: panel privado, base de datos central, estadísticas, producción diaria sin intervención, render en la nube, alertas.

## 2. Arquitectura (cloud-first, nada depende del PC)

```
                 ┌──────────── Cloudflare (Workers Paid $5/mes) ────────────┐
 Navegador ──►   │ Worker relatos-autopilot                                  │
 (panel)         │  ├─ Panel web (estático) + API /api/* con sesión          │
                 │  ├─ Cron */5: publicar TikTok, revisar estados            │
                 │  ├─ Cron horario: estadísticas FB / YT / TikTok           │
                 │  ├─ Cron diario: producción (guion → voz → imágenes)      │
                 │  D1 (base de datos) · KV (tokens rotativos) · R2 (videos) │
                 └───────────────┬───────────────────────────────────────────┘
                                 │ dispara render
                 ┌───────────────▼──────────────┐
                 │ GitHub Actions (render)       │  Remotion + FFmpeg → sube a R2
                 └───────────────────────────────┘
 APIs oficiales: Meta Graph · YouTube Data/Analytics · TikTok Content Posting · ElevenLabs · Workers AI (imágenes) · Gemini (guiones)
```

- **Panel**: login de un solo administrador (contraseña con PBKDF2 + cookie de sesión firmada, HttpOnly, SameSite=Strict).
- **Secretos**: Worker secrets (no en el código). Tokens que rotan (TikTok, YouTube access) en KV. Nunca se muestran completos.
- **Interruptor global** `pausa` y límites diarios/mensuales en la tabla `config`.
- **Idempotencia**: cada publicación tiene id único `(video, red)`; el estado se marca antes de enviar para no duplicar.

## 3. Estrategia de contenido

- 1 historia por semana: video largo (~8 min, anuncios a mitad de video) en Facebook y YouTube.
- 4–5 reels por historia, 1 por día, en las 3 redes, 19:30 hora de Ecuador.
- Tono "misterio épico", sin gore; IA declarada en cada red.

## 4. Costos estimados (mensuales)

| Servicio | Costo |
|---|---|
| Cloudflare Workers Paid (incluye D1, KV, cron, 10 GB R2) | $5 |
| Imágenes Lucid Origin (~120/semana × $0,03) | ~$15 |
| ElevenLabs Starter (30 k caracteres ≈ 4 historias) | $6 |
| GitHub Actions (render, ~500 min) | $0 (incluido) |
| Gemini (guiones, plan gratis) | $0 |
| **Total** | **~$26/mes** |

Límites: máximo 140 imágenes/semana y 30 k caracteres de voz/mes (tabla `config`); si se pasan, la producción se pausa y avisa.

## 5. Plan por fases

1. ✅ Auditoría y arquitectura (este documento).
2. Base de datos D1, panel privado, registro de todas las publicaciones.
3. Estadísticas por red (cron horario) y gráficos en el panel.
4. Producción semanal automática (guion con verificación → voz → imágenes → render en GitHub Actions → R2).
5. Agenda automática: reparte reels diarios y programa FB/YT/TikTok.
6. Control de calidad antes de publicar (aprobado / revisión / bloqueado).
7. Alertas (token caducado, fallos, costos) e informe semanal.
8. Pruebas completas con el PC apagado y documentación.

## 6. Lo que depende del dueño (no se puede automatizar)

- YouTube: verificar teléfono (miniaturas) y completar "Información de la marca" + "Publicar app" en Google Cloud (si no, el token caduca cada 7 días).
- TikTok: enviar la app a revisión con video demo (para publicar en público).
- Facebook: volver a generar el token con `read_insights` para ver estadísticas de video.
