# Producir videos nuevos (fábrica en la nube)

El equipo **sí produce videos**. El camino es siempre el mismo:

1. **Andy** investiga (fuentes reales con URL).
2. **Ryan** (o Jim) escribe el guion completo en el formato de abajo y lo entrega como resultado de su tarea, **con el JSON entero** en un bloque ```json.
3. **Dwight** lo revisa. Solo con 85/100 o más se puede producir.
4. **Michael o Jim** lo mandan a producir:
   `POST /api/agentes/produccion` con `{"tarea_id": <id de la tarea del guion aprobada>, "guion": { … }}`
5. La fábrica lo toma en menos de 1 h y hace todo sola: graba la voz (El Faraón), genera las imágenes, renderiza el largo y los reels, y los programa en Facebook, YouTube y el panel a las horas del guion. Tarda de 1 a 3 h.
6. El estado se ve en `/agentes/contexto` → `producciones` (`pedida → produciendo → renderizando → lista`, o `error` con el motivo). Si sale `error`, se corrige el guion y se pide otra vez **con otro `id`**.

Si la API responde 400, el mensaje dice exactamente qué corregir. 409 = ese id ya existe. 429 = ya hay 2 producciones en curso o se llegó al tope de 4 por semana.

## Formato del guion

```json
{
  "id": "tesoro-lima",
  "titulo": "El Tesoro de Lima",
  "estilo": "cinematic film still from an epic mystery documentary, ultra realistic, colonial Peru and Pacific coast, candle and lantern light, deep shadows, volumetric light, film grain, no text, no watermark",
  "escenas": [
    { "id": "g1", "texto": "Narración de la escena en español (1-3 frases).", "img": "prompt de la imagen EN INGLÉS, concreto, sin texto", "mov": "acercar" }
  ],
  "cartel": { "en": "g5", "titulo": "EL TESORO DE LIMA", "sub": "El oro que nunca volvió" },
  "capitulos": { "c1": "La ciudad de los reyes", "x1": "La huida" },
  "miniatura": { "cara": "g3", "fondo": "g1", "linea1": "EL ORO", "linea2": "PERDIDO", "dato": "LIMA · 1820" },
  "largo": {
    "cuando": "2026-11-28T19:00:00-05:00",
    "texto": "Descripción para Facebook con pregunta y hashtags",
    "titulo_yt": "Título de YouTube (máx. 100)",
    "descripcion_yt": "Descripción de YouTube; los capítulos se agregan solos al final. Incluye: Las imágenes son recreaciones generadas con IA.",
    "etiquetas": ["tesoro de lima", "leyendas"]
  },
  "reels": [
    { "gancho": "Texto grande de los primeros segundos", "escenas": ["g1", "g2", "g3"], "cierre": "Historia completa en el canal",
      "cuando": "2026-11-26T19:30:00-05:00", "texto": "Descripción para Facebook/YouTube con pregunta y hashtags", "titulo_yt": "Título del Short #shorts" }
  ]
}
```

## Cómo se escribe un video que la gente no suelta

1. **Los 2 primeros segundos deciden.** La primera frase ya trae el objeto y la intriga ("Hay 750 toneladas de oro inca que nadie ha encontrado"). Nada de saludos, "cuenta la tradición que…" ni contexto al inicio: la frase de leyenda va en la segunda escena.
2. **Una idea por escena y una imagen por idea.** Escenas de 60 a 160 letras (4 a 11 s). El sistema rechaza las de más de 240.
3. **Cada 3 escenas, algo nuevo:** un dato con número, un giro, una pregunta o un "pero". Si tres escenas seguidas solo describen, se recorta.
4. **Datos concretos:** años, nombres, cantidades y lugares reales con fuente. "Mucho oro" no retiene; "26 toneladas de plata" sí.
5. **Cada reel se entiende solo** y termina en una pregunta abierta o en una frase que conecta con su inicio (para que se vuelva a ver). No es un tráiler que solo dice "mira el video largo".
6. **Gancho en pantalla:** máximo 9 palabras, distinto en cada reel, con el objeto o el lugar. El primer reel lleva el mejor dato de toda la historia, no la introducción.
7. **Prompts de imagen (en inglés):** tipo de plano + sujeto + acción + lugar y época + luz. Ejemplo: "low angle close-up of a gloved conquistador hand lifting a gold Inca mask from muddy water, Andean cloud forest, 1590s, torchlight, mist". Alterna planos (general, medio, detalle) y no repitas el mismo encuadre dos escenas seguidas. Un personaje que vuelve a salir se describe siempre igual (edad, ropa, rasgos). Sin texto en la imagen.
8. **Títulos de YouTube:** objeto o lugar concreto + pregunta o dato ("¿Dónde están las 750 toneladas de oro de Atahualpa?"). Mira antes `analisis.por_red.youtube.mejores` y `/agentes/tendencias`.
9. **Qué producir:** reels y partes primero. `largo` solo en historias de tesoros (los largos tienen mediana 75 vistas; los reels 206).

10. **Miniatura obligatoria (orden de Luiggi).** Ningún video sale sin miniatura. Cada guion con `largo` trae `miniatura` completa: `cara` y `fondo` (escenas con imagen clara y luminosa, no noche cerrada), `linea1` y `linea2` (máximo 14 letras cada una, la palabra que engancha: ORO, TESORO, MALDITO…) y `dato` (lugar y año). La primera escena de cada reel debe tener una imagen con luz, porque ese cuadro es la portada del reel en TikTok y en Shorts.

## Cómo puntúa Dwight un guion (100 puntos, mínimo 85)

| Criterio | Puntos |
|---|---|
| Primera frase y gancho de cada reel: ¿detienen el dedo en 2 s? | 25 |
| Ritmo: una idea por escena y algo nuevo cada 3 escenas | 20 |
| Veracidad: leyenda como leyenda, datos con fuente | 20 |
| Imágenes: prompts concretos, planos variados, personaje constante | 15 |
| Títulos y textos: objeto concreto + pregunta, sin prometer lo que no hay | 10 |
| Cada reel se entiende solo y cierra bien | 10 |

Un guion veraz pero aburrido no pasa. Dwight devuelve con la frase exacta que hay que cambiar y una propuesta.

Reglas del guion:
- **Escenas:** de 3 a 60. `id` = letra de la sección + número (`g1…g5` gancho, `c1…` contexto, `x1…`, `z1…` cierre). Al cambiar de letra la voz hace una pausa. `mov`: `acercar, alejar, derecha, izquierda, abajo, arriba, subir`.
- **Voz:** máximo 6.000 letras sumando todos los `texto` (créditos de ElevenLabs). Un largo necesita al menos 1.500 letras (~2 min). Unas 14 letras = 1 segundo.
- **Reels:** de 0 a 12; cada uno con 2 a 8 escenas del guion cuya narración sume de 130 a 700 letras (10 a 50 s). Gancho de máximo 9 palabras y distinto en cada reel. Se llaman `reel1, reel2…` por orden.
- **Escenas:** máximo 240 letras de narración cada una.
- **`largo` es opcional:** sin `largo` se producen solo los reels (por ejemplo, un experimento de reels).
- **Horas:** ISO con zona de Ecuador (`-05:00`), al menos 4 h en el futuro y como máximo 45 días. Respeta la agenda: adelantos → largo → reels en orden; 3 h entre dos publicaciones de la misma red; no choques con lo ya programado (`agenda`).
- **Imágenes:** recreaciones. Personajes históricos sin rasgos de famosos reales vivos; sin gore; tono "misterio épico". Costo ≈ $0,03 por imagen (horizontal para el largo + vertical para cada escena de reel). Angela vigila el presupuesto; si no alcanza, la fábrica lo rechaza.
- **Veracidad:** la leyenda se cuenta como leyenda; lo documentado, con fuentes en la tarea.
