// El Tesoro de Lima: la leyenda. Guion de los agentes de RELATOS AI GROUP (producción automática).
export const HISTORIA = {
 "id": "tesoro-lima-leyenda",
 "titulo": "El Tesoro de Lima: la leyenda",
 "voz": "Rl2JPHsuEWSfwCD4ZHIQ",
 "estilo": "cinematic film still from an epic mystery documentary, ultra realistic, Pacific coast, candle and lantern light, deep shadows, volumetric light, film grain, no text, no watermark",
 "escenas": [
  {
   "id": "g1",
   "texto": "Cuenta la tradición que, en algún rincón de una isla perdida en el Pacífico, duerme el tesoro más buscado de América.",
   "img": "remote tropical island with misty jungle cliffs at dawn, lone sailing ship offshore",
   "mov": "acercar"
  },
  {
   "id": "g2",
   "texto": "Es la leyenda del Tesoro de Lima. Una historia que ha atraído a exploradores durante más de un siglo, y que nadie ha podido confirmar.",
   "img": "old weathered treasure map on a table lit by candle, compass and brass dividers",
   "mov": "derecha"
  },
  {
   "id": "c1",
   "texto": "La tradición dice que todo empezó hacia 1820, cuando las guerras de independencia sacudían el Perú y Lima temía por sus riquezas.",
   "img": "colonial Lima plaza at dusk with cathedral and nervous crowd, lanterns",
   "mov": "alejar"
  },
  {
   "id": "c2",
   "texto": "Según el relato, oro, joyas y objetos de las iglesias fueron embarcados en secreto para ponerlos a salvo, bajo la custodia de un capitán llamado William Thompson.",
   "img": "wooden crates of gold and jewels carried onto a sailing ship at night, torchlight",
   "mov": "izquierda"
  },
  {
   "id": "c3",
   "texto": "Pero la leyenda cuenta que el capitán no cumplió su misión. Que su tripulación vio el cargamento, y que la ambición fue más fuerte que la lealtad.",
   "img": "tense sailors on a ship deck looking at an open chest of gold, shadows",
   "mov": "acercar"
  },
  {
   "id": "x1",
   "texto": "Dicen que el barco puso rumbo a una isla deshabitada, hoy conocida como la Isla del Coco, frente a las costas de Costa Rica.",
   "img": "tall dark ship approaching a green volcanic island in the Pacific, stormy sky",
   "mov": "derecha"
  },
  {
   "id": "x2",
   "texto": "Allí, siempre según la tradición, los cofres fueron enterrados en un lugar que solo unos pocos conocían. Y ese secreto nunca salió de la isla.",
   "img": "men burying heavy chests on a moonlit beach near cliffs, lantern glow",
   "mov": "abajo"
  },
  {
   "id": "x3",
   "texto": "Desde entonces, decenas de expediciones han recorrido cuevas, acantilados y selva en busca de la señal que lo cambiaría todo. Algunas hablan de mapas, otras de rumores.",
   "img": "explorers with shovels and lanterns climbing a rainforest cliff, mist",
   "mov": "subir"
  },
  {
   "id": "x4",
   "texto": "Pero hay que decirlo con honestidad: los supuestos hallazgos nunca se han confirmado con pruebas, y las versiones cambian en fechas, nombres y cantidades.",
   "img": "empty dark cave entrance with a single beam of light, ancient rock",
   "mov": "alejar"
  },
  {
   "id": "z1",
   "texto": "Hoy la isla es un parque nacional protegido, donde nadie puede cavar. Y quizá por eso el misterio sigue intacto.",
   "img": "aerial view of a lush protected tropical island national park at sunrise",
   "mov": "alejar"
  },
  {
   "id": "z2",
   "texto": "¿Existió de verdad el Tesoro de Lima, o es una de esas historias que el mar se encarga de mantener vivas? Cuéntanos qué crees.",
   "img": "silhouette of a ship on the horizon at sunset, golden light on water",
   "mov": "acercar"
  }
 ]
};
export const TITULO_CARTEL = {"en":"g2","titulo":"EL TESORO DE LIMA","sub":"La leyenda que el mar guarda"};
export const CAPITULOS = {"c1":"Lima, hacia 1820","x1":"La isla","z1":"El misterio sigue"};
export const REELS = [
 {
  "id": "reel1",
  "gancho": "¿Dónde está el Tesoro de Lima?",
  "escenas": [
   "g1",
   "g2",
   "c1",
   "c2"
  ],
  "cierre": "Historia completa en el canal"
 },
 {
  "id": "reel2",
  "gancho": "El capitán que traicionó a Lima",
  "escenas": [
   "c2",
   "c3",
   "x1",
   "x2"
  ],
  "cierre": "Historia completa en el canal"
 },
 {
  "id": "reel3",
  "gancho": "Nadie ha encontrado el tesoro",
  "escenas": [
   "x3",
   "x4",
   "z1",
   "z2"
  ],
  "cierre": "Historia completa en el canal"
 }
];
