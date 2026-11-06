# RELATOS AI GROUP — Fase 1: auditoría técnica de Relatos Autopilot

Fecha: 2026-11-06 15:00 (America/Guayaquil). Base: megaprompt V3.0. Todo lo que sigue se comprobó contra el código y la nube hoy, no de memoria.

## 0. Respaldo hecho antes de tocar nada

| Qué | Dónde |
|---|---|
| Base D1 completa (12.673 filas, 2,3 MB) | `~/.relatos-secretos/respaldos/20261106-1501/d1.sql` |
| Lista de claves KV (sin valores) | `…/20261106-1501/kv-claves.json` |
| Código | etiqueta git `respaldo-antes-group-20261106-1501` + repo GitHub |

Restaurar D1: `npx wrangler d1 execute relatos-autopilot --remote --file <d1.sql>` (sobre una base vacía).

## 1. Inventario

| Capa | Tecnología | Estado real |
|---|---|---|
| Backend | Cloudflare Worker `relatos-autopilot` (TypeScript, sin framework), ~850 líneas en `autopilot/src` | ✅ en producción |
| Panel | HTML + JS sin framework (`autopilot/panel`, 10 vistas: resumen, agenda, videos, historias, crecimiento, animar, actividad, FB, YT, TikTok) | ✅ |
| Base de datos | D1 `relatos-autopilot`: historias, videos, publicaciones, metricas, cuentas_hist, eventos, config, animaciones, recomendaciones | ✅ 4 migraciones |
| Tokens rotativos | KV (yt-refresh, yt-access, tiktok-token…) | ✅ |
| Videos | R2 `relatos-videos` | ✅ |
| Programador | Cron del Worker cada 5 min (publicar TikTok, estado; estadísticas cada hora; historia FB 20:15) | ✅ |
| Fábrica / render | GitHub Actions (repo **público**): `fabrica.yml` (render Remotion en matriz), `diario.yml` (01/04/07 EC), `semanal.yml` (lun 08:00) | ✅ |
| Producción | Remotion 4.0.534 + ElevenLabs (voz) + Workers AI Lucid Origin (imágenes) + clips Veo manuales | ✅ semi-manual |
| Avisos | Monitor de Restaurant OS → WhatsApp (salud + resumen 21:30) | ✅ |
| Acceso | 1 contraseña (PBKDF2 100k) + cookie HMAC 30 días + entrada por pase Ed25519 desde el portal | ✅ |

## 2. Estado vivo (D1, hoy 19:00 UTC)

| Red | Seguidores | Vistas totales | Publicado | En agenda | Problemas |
|---|---|---|---|---|---|
| Facebook | 3.367 | (la API no da total) | 25 | 40 programados + 5 pendientes | — |
| YouTube | 33 | 11.109 | 29 | 29 programados + 32 pendientes | cupo ~6-9 subidas/día (canal sin verificar) |
| TikTok | 30 | 4.724 | 23 | 13 programados + **40 por-programar** | depende de la laptop (Studio por CDP) |

- La agenda llega hasta el **8-dic-2026**. Historias listas: dama-tapada, padre-almeida, caja-ronca, tesoros, isla-plata, el-dorado; tayos en imágenes (voz tras el 26-nov).
- Pausa global: **desactivada** (publica solo).
- Errores recientes: YouTube `invalid_grant` el 4-nov 00:00–04:00 (ya se recuperó: hay estadísticas de hoy); comentario automático de YouTube falló hoy en cantuna-reel7 (400).

## 3. Real vs. simulado

Nada del panel es ficticio: todas las cifras salen de las APIs oficiales y quedan en D1. Lo que **no** es automático:

- **Guiones**: los escribo yo en Claude Code (no hay IA en la nube que escriba). Esto es lo que el V3 quiere convertir en agentes.
- **TikTok**: la API sigue sin auditoría → los videos se programan en TikTok Studio con Chrome controlado desde la laptop. Si la laptop está apagada, TikTok se atrasa.
- **Clips animados**: dependen de Flow/Veo del usuario (sin API).
- **Investigación de redes / nichos / experimentos**: no existen como módulos; solo la vista Crecimiento con hallazgos por reglas fijas.

## 4. Hallazgos de seguridad (Sentinel, primera pasada)

| # | Severidad | Hallazgo | Propuesta |
|---|---|---|---|
| S1 | Alta | `POST /api/fabrica/sql` ejecuta **SQL arbitrario** con solo la cabecera `x-clave`. Quien tenga esa clave puede borrar la base. | Reemplazar por operaciones con nombre (registrar historia, marcar publicada) y consultas parametrizadas. |
| S2 | Alta | La misma `CLAVE` sirve para el Worker de imágenes y para el autopilot (y está en GitHub Secrets). Una fuga abre todo. | Claves separadas por servicio; rotación. |
| S3 | Media | Sin MFA. La sesión dura 30 días y no se puede revocar una sola (solo rotando `SESION_SECRETO`). | Sesiones en D1 (revocables, 12 h + renovación), TOTP, cierre global. |
| S4 | Media | Contraseña con PBKDF2 (el V3 pide Argon2id). Workers no trae Argon2 nativo. | Argon2id en WASM (verificar costo de CPU en Workers) o mantener PBKDF2 + MFA; decidir con prueba. |
| S5 | Baja | `/api/salud` es pública (cifras agregadas, sin datos privados). Es necesaria para el monitor de WhatsApp. | Mantener, o pasarla a token del monitor. |
| S6 | Info | Repo público: revisé el historial buscando tokens de Meta, Google, Anthropic y ElevenLabs → ninguno. | Añadir escaneo de secretos en CI. |
| S7 | Info | Sin registro de auditoría de acciones del dueño (aprobaciones, pausas, logins). | Tabla `audit_logs` (V3 la exige). |

Lo bueno: cookies HttpOnly/Secure/SameSite=Strict, CSRF por Origin, CSP estricta, límite de intentos de login, secretos fuera del código, pase del portal de un solo uso.

## 5. Distancia con el megaprompt V3

| Pide el V3 | Hoy | Trabajo |
|---|---|---|
| Login con correo + MFA, selector de 2 divisiones, panel de grupo | 1 contraseña, 1 sola marca | Capa "grupo" encima del Worker actual |
| División RELATOS | Existe (es este sistema) | Se conserva tal cual y se le agregan módulos |
| División GAMING | No existe | Nueva: cuentas, marca, Rights Manager, plantillas Remotion propias |
| Agentes (Michael, Andy, Oscar…, Sentinel) que trabajan solos | No existen en la nube | Orquestador en el Worker que llama a la **API de Claude** con perfiles; tareas en D1 + Cloudflare Queues |
| Aprobación individual antes de publicar | **Se publica solo** (autorización tuya del 26-oct) | Ver decisión 1 |
| Presupuesto 75 USD con parada automática | Sin registro de costos | `cost_ledger` + tope antes de cada llamada pagada |
| Oficina virtual animada | No existe | SVG/CSS ligada a `agent_tasks` reales |
| Memoria empresarial, experimentos, nichos, auditoría de redes | Parcial (recomendaciones) | Tablas y vistas nuevas |
| Backups probados | Hoy manual | Export D1 diario a R2 cifrado + prueba de restauración |

## 6. Arquitectura propuesta (sin destruir nada)

- **Mismo Worker, misma D1.** Las tablas actuales pasan a ser la división `relatos` (columna `division_id` con valor por defecto) — migración reversible, sin mover datos.
- Tablas nuevas del V3 (organizations, divisions, users, sessions, agents, agent_tasks, agent_events, cost_ledger, approvals, rights_permissions, creators, experiments, company_memory, audit_logs, security_events, backups…) en migraciones 0005+.
- **Agentes en la nube**: un solo orquestador; cada agente = perfil (prompt + herramientas permitidas + división). Modelos: Haiku para rutina, Sonnet para análisis, nunca todos a la vez. La autorización de herramientas se valida en el backend, no en el prompt.
- **agency-agents** (MIT, 166k ★, 384 archivos de prompts): son agentes de *Claude Code* para desarrollar, no corren en la nube. Uso propuesto: instalar 4-6 para mi trabajo de desarrollo (seguridad, analítica, contenido) y **adaptar** sus textos como base de los perfiles de Michael/Oscar/Kelly. No instalar los 384.
- **Render** sigue en GitHub Actions (Workers no puede renderizar video).
- **Gaming** comparte infraestructura pero con datos, tokens y presupuesto separados por `division_id`, filtrados en cada consulta del backend.

## 7. Costos actuales (aprox.) frente al tope de 75 USD

| Servicio | Hoy | Nota |
|---|---|---|
| Cloudflare Workers Paid | 5 USD | incluye D1/KV/R2 base |
| ElevenLabs Starter | ~5 USD | 30.000 letras/mes; ya casi agotadas hasta el 26-nov |
| GitHub Actions | 0 | repo público |
| API de Anthropic | 0 | **no hay clave de API para Relatos** (AUREN usa la suya, no se mezcla) |
| **Total** | **~10 USD** | margen para ~40 USD de Claude API |

## 8. Lo que solo puede hacer el dueño

1. Decidir la política de aprobación (abajo).
2. Crear una clave de API de Anthropic **solo para Relatos AI Group** con tope de gasto en console.anthropic.com (el tope de la consola es la parada de seguridad real; el mío es la segunda).
3. Para Gaming: nombre de la marca y crear las cuentas FB/YT/TikTok.
4. Verificar el canal de YouTube por teléfono (sube el cupo diario).
5. Revisar en developers.tiktok.com si la app ya salió de revisión.
