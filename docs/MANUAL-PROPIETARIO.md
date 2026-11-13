# RELATOS AI GROUP — Manual del propietario

Panel: **https://relatos-autopilot.probador-worker.workers.dev** (también se instala como app en Windows y el celular: menú del navegador → "Instalar").

## 1. Entrar
- Con tu correo + tu contraseña de siempre + el código de 6 dígitos de tu app autenticadora.
- ¿Perdiste el teléfono? Usa uno de tus 10 **códigos de recuperación** en lugar del código (cada uno sirve una sola vez).
- Desde el portal de empresas entras sin código (el portal ya te pidió el suyo).
- **Seguridad → Cerrar sesión en todos los dispositivos** si sospechas de algo.

## 2. Qué hay en cada pantalla

| Pantalla | Para qué |
|---|---|
| **Empresas** | Elegir RELATOS o GAMING |
| **Panel del grupo** | Estado de las dos divisiones, agentes, gastos, alertas, actividad |
| **Bandeja** | Lo que sale en 7 días: ver, pedir cambios, bloquear (la publicación es automática; esto es tu control) |
| **Oficina** | Los agentes trabajando en vivo (cada animación es una tarea real) |
| **Agentes** | Fichas, tareas con su entregable y nota de Dwight, memoria, experimentos. Desde la ficha le das instrucciones a un agente |
| **Presupuesto** | Gasto del mes contra el tope de 75 USD, por proveedor y división |
| **Seguridad** | Botón DETENER, controles de Sentinel, eventos, sesiones |
| **RELATOS** (← Empresas → Relatos) | El panel de siempre: resumen, crecimiento, historias, agenda, videos, redes |
| **GAMING** | Marca, derechos (Rights Manager) y creadores |

## 3. Botón DETENER EMPRESA (Seguridad)
Detiene sin borrar nada: toda la empresa, una división, o solo publicaciones / renderizados / agentes / APIs con gasto. **Ojo:** lo ya programado DENTRO de Facebook y YouTube sale igual; se cancela en Meta Business Suite / YouTube Studio (o pídemelo). Te llega un aviso por WhatsApp mientras esté activo.

## 4. Agentes
- Trabajan solos **a las 07:00, 12:00, 15:00 y 22:00** en GitHub (Actions → "Jornada de agentes"; "Run workflow" para que trabajen ya). Usan la API de Claude (Haiku 5.5; Sonnet 5.5 solo para guiones) con tope de **USD 4 al mes** (Presupuesto → anthropic). Ya no dependen de una cuenta de claude.ai.
- Cada día arman hasta 3 **reels nuevos** con historias que ya rindieron (sin gastar voz) y la Fábrica los programa en Facebook y YouTube.
- **Marcador real:** la nota de cada reel la ponen sus vistas a 24 h en YouTube (50 = la mediana, 100 = el doble), no la opinión de Dwight.
- **Voz de respaldo** (Kokoro, gratis) para cuando ElevenLabs se queda sin letras: apagada. Se enciende con la variable del repositorio `VOZ_RESPALDO` (em_alex, em_santa o ef_dora).
- Claves en GitHub: `ANTHROPIC_API_KEY` y `AGENTE_CLAVE` (se ponen con `prueba/claves-agentes.ps1`).
- Para pedirles algo: **Agentes → toca al agente → Darle una instrucción**. Lo toma en la siguiente jornada. Para que sea ya: en la rutina, **Ejecutar ahora**.
- No pueden publicar, gastar ni tocar la seguridad (lo impide el código, no la IA). Dwight revisa todo: < 85/100 vuelve al autor.
- Su clave vive en el **entorno Default** de claude.ai/code (variable `AGENTE_CLAVE`) y en `~/.relatos-secretos/agente-clave.txt`. Si se filtra: pídeme "rota la clave de los agentes" y la pegas de nuevo en el entorno.

## 5. Gaming y derechos
- Ningún recurso de GTA va a publicación **monetizada** si algún titular (el creador, la música, **Rockstar**) no tiene "uso comercial" vigente con prueba documentada. El sistema lo bloquea solo.
- Rockstar está **pendiente** hasta leer y registrar su política vigente.
- Registra a cada creador con su permiso por escrito. Un clip público de Twitch NO es un permiso comercial.

## 6. Presupuesto
Tope 75 USD/mes (Anthropic 40 · ElevenLabs 12 · infraestructura 10 · reserva 13) y 6 USD/día en gastos variables. Si algo no cabe, la tarea se detiene sola. Nada compra créditos ni activa suscripciones. Para cambiar topes: pídemelo (tabla `config`, clave `presupuesto`; el total nunca pasa de 75 sin tu autorización).

## 7. Respaldos
Cada día a las 03:00, cifrados, 14 días en R2. Para comprobar que se pueden restaurar: `node scripts/restaurar-respaldo.mjs` (carga el último en una base aparte y compara fila por fila). La clave de los respaldos está en `~/.relatos-secretos/respaldo-clave.txt`: **sin ella no se pueden abrir**, guárdala también fuera de la laptop.

## 8. Cómo crecer (para mí o un desarrollador)
- **Agregar un agente:** fila en `agents` (migración nueva) + perfil `agentes/<id>.md`. Se activa con `activo = 1`.
- **Nueva marca o canal:** Gaming → Marca (URLs); conexión a la API de cada red con el mismo procedimiento que Relatos (scripts `fb-token`, `yt-auth`, `tt-auth`).
- **Nueva división:** fila en `divisions` + `division_id` en sus datos; las consultas ya filtran por división.
- **Código:** `autopilot/src` (Worker), `autopilot/panel` (pantallas), `autopilot/migrations` (base de datos, siempre migraciones nuevas, nunca editar las viejas). Desplegar: `cd autopilot && npx wrangler deploy`.
- **Pruebas:** baterías de acceso, Sentinel, agentes y derechos (108 comprobaciones) contra `wrangler dev` local con `.dev.vars` de prueba.

## 9. Pendiente
- Leer y registrar la política de Rockstar (la página oficial no cargó el 6-nov).
- Nombre y cuentas de la marca gaming.
- Experimento E-FB1: producir los 6 reels con los guiones aprobados de Ryan y medir a 72 h.
- Fase 7 completa (producción automática de los guiones de agentes en la fábrica) y TikTok por API cuando aprueben la auditoría de la app.
