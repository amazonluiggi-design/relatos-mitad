# Diagnóstico de Facebook — Relatos de la Mitad

**Fecha:** 2026-11-06 · **Investigó:** ANDY (datos) · **Analizó:** OSCAR · **Verificó:** DWIGHT · **Entrega:** MICHAEL
**Fuentes:** API Graph v23 de Meta (solo lectura, `scripts/diagnostico-fb.mjs` → `informes/fb-diagnostico-2026-11-06.json`) y métricas horarias por video guardadas en D1 desde el 26-oct.

## 1. Situación

| Dato (verificado hoy) | Valor |
|---|---|
| Seguidores | 3.367 (eran 3.386 el 11-ago) |
| Seguidores nuevos en 90 días | **1** |
| Dejaron de seguir en 90 días | 21 (8 ago · 5 sep · 4 oct · 4 nov) |
| Vistas de contenido de la página, 11-ago → 25-oct (76 días, antes de Relatos) | **630** (≈ 8 por día) |
| Vistas de contenido, 26-oct → 6-nov (11 días, con Relatos) | 262 (≈ 24 por día) |
| Vistas por reel en Facebook (19 reels) | mediana **6**, máximo 17 |
| **Los mismos reels** en YouTube Shorts / TikTok | mediana **294** / **404** |
| Tiempo medio visto por reproducción en FB | 6,1 s (los reels duran 37-74 s) |
| Categoría de la página | "Artes visuales" |
| Estado | publicada, sin verificar, nueva experiencia de páginas |

## 2. Respuestas a las 9 preguntas del V3

1. **¿Restricción comprobable?** **No se ve ninguna.** Captura del propietario (6-nov 16:11): *Estado de monetización: “Tu página está ganando dinero”* (en verde). Programas activos: solo **Estrellas** ($0,00). **Monetización de contenido: no admitida (“solo con invitación”)**. Suscripciones: 2 de 3 criterios. Conclusión: la página no está sancionada; lo que pasa es que hoy **no cobra por vistas** (solo Estrellas). Para eso hace falta crecer la audiencia activa y que Meta la invite.
2. **¿La audiencia histórica coincide con el contenido actual?** Muy probablemente **no**, y además estaba **dormida**. Con 3.386 seguidores la página generó 8 vistas al día durante los 76 días anteriores a Relatos, y solo ganó 1 seguidor en 90 días. Es una audiencia que dejó de interactuar hace tiempo (página de entretenimiento renombrada). *Confianza: alta en que está dormida; media en el desajuste de tema (no se pudo leer el historial de publicaciones, ver §5).*
3. **¿Funcionan los primeros segundos?** En FB, el tiempo medio visto es de 6,1 s sobre reels de 37-74 s. Pero con solo 6 reproducciones por reel la muestra es demasiado pequeña para culpar al gancho: **el mismo gancho funciona en YouTube y TikTok** (cientos de vistas).
4. **¿La retención es baja?** Sí en FB (≈ 10 %), pero sobre muestras de 1-17 vistas. No es concluyente.
5. **¿Publicaciones repetitivas?** No dentro de FB (cada reel es distinto). Ojo: los mismos videos salen en YT y TT; no llevan marcas de agua, así que no hay señal de reciclaje visible.
6. **¿Frecuencia adecuada?** 1-2 reels al día + historia diaria. Es una frecuencia normal; no es la causa.
7. **¿Qué formatos rinden mejor?** Reels 6-17 vistas, video largo 9-12, episodios 1-9. **Todo es bajo; ninguno destaca.**
8. **¿Qué publicaciones generan seguidores?** **Ninguna**: +1 seguidor en 90 días. La API no atribuye seguidores por video en FB.
9. **¿Qué oportunidades se pierden?** Ver §4.

## 3. Causa más probable (con evidencia)

**Facebook casi no está distribuyendo los reels fuera de la página, y la página no tiene una audiencia activa que los empuje.**

- El contenido **no** es el problema principal: los mismos 19 reels sacan 50-100 veces más vistas en YouTube y TikTok.
- La subida **no** es el problema: se publican por el endpoint oficial de Reels (`video_reels`). *Hipótesis descartada hoy.*
- Señales que **sí** apuntan a la audiencia y la distribución: cero crecimiento de seguidores en 90 días, 8 vistas al día antes de empezar, y categoría "Artes visuales", que no coincide con misterio e historia.

**Confianza: media-alta.** La captura del estado de monetización descarta una sanción.

## 4. Recomendaciones (no cambio nada de la página sin tu visto bueno)

| # | Acción | Quién | Por qué |
|---|---|---|---|
| 1 | ✅ Hecho (6-nov): monetización en verde, sin sanciones. Solo Estrellas activo; la monetización de contenido es por invitación | Tú | Descarta la restricción. |
| 2 | Cambiar la categoría de "Artes visuales" a **"Creador de contenido digital"** (autorizado 6-nov; el token no tiene `pages_manage_metadata`, así que se hace a mano en la configuración de la página) | Tú | Coincidir con el tema ayuda a que Facebook sepa a quién mostrarlo. Es un cambio de configuración de una página monetizada: por eso no lo hago solo. |
| 3 | Experimento E-FB1: reels nativos de FB de **15-25 s** con el texto del gancho en pantalla desde el primer cuadro | Yo (fase 6) | En FB el abandono ocurre antes de los 6 s. |
| 4 | Seguir compartiendo en grupos de leyendas y misterio (a mano, guía ya entregada) | Tú | Es la única forma de llegar a gente nueva mientras la distribución esté fría. |
| 5 | No subir el volumen en FB hasta tener el dato de §1: más reels a una audiencia dormida no cambian el resultado | Michael | Ahorra producción para YT y TT, que sí crecen. |

## 5. Lo que no se pudo medir (y por qué)

- **Historial de publicaciones de la página** (qué se publicaba antes y cuánto respondía la gente): el token no tiene el permiso `pages_read_user_content`. Se puede pedir al reautorizar la app de Meta.
- **Impresiones, alcance, país, edad y género de los seguidores**: Meta retiró esas métricas de la API (`page_impressions*`, `page_fans_*`). Solo se ven en Meta Business Suite; también se puede importar el CSV.
- **Seguidores por video**: Facebook no los atribuye por API.
