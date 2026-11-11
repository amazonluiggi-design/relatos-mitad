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

Reglas del guion:
- **Escenas:** de 3 a 60. `id` = letra de la sección + número (`g1…g5` gancho, `c1…` contexto, `x1…`, `z1…` cierre). Al cambiar de letra la voz hace una pausa. `mov`: `acercar, alejar, derecha, izquierda, abajo, arriba, subir`.
- **Voz:** máximo 6.000 letras sumando todos los `texto` (créditos de ElevenLabs). Un largo necesita al menos 1.500 letras (~2 min). Unas 14 letras = 1 segundo.
- **Reels:** de 0 a 12; cada uno con 2 a 8 escenas del guion (unos 15-40 s). Se llaman `reel1, reel2…` por orden.
- **`largo` es opcional:** sin `largo` se producen solo los reels (por ejemplo, un experimento de reels).
- **Horas:** ISO con zona de Ecuador (`-05:00`), al menos 4 h en el futuro y como máximo 45 días. Respeta la agenda: adelantos → largo → reels en orden; 3 h entre dos publicaciones de la misma red; no choques con lo ya programado (`agenda`).
- **Imágenes:** recreaciones. Personajes históricos sin rasgos de famosos reales vivos; sin gore; tono "misterio épico". Costo ≈ $0,03 por imagen (horizontal para el largo + vertical para cada escena de reel). Angela vigila el presupuesto; si no alcanza, la fábrica lo rechaza.
- **Veracidad:** la leyenda se cuenta como leyenda; lo documentado, con fuentes en la tarea.
