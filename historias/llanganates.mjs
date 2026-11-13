// Relato 2: El tesoro de los Llanganates. Continúa el final de Cantuña (el oro de Rumiñahui).
// Datos con varias versiones se narran como tradición ("cuentan", "según los relatos").
const ESTILO =
  "cinematic film still from an epic historical documentary, ultra realistic, Andes mountains of Ecuador, moody dramatic lighting, volumetric fog, rich teal and gold color grade, 35mm film grain, high detail, no text, no gore";
const INDIGENA = "indigenous Quechua man with brown skin, high cheekbones and long straight black hair, woven Andean poncho";
const ESPANOL = "16th century Spanish soldier in his thirties with a short dark beard, worn leather doublet and morion helmet";

export const HISTORIA = {
  id: "llanganates",
  titulo: "El tesoro de los Llanganates: el mapa que nadie pudo seguir",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "En el centro del Ecuador hay unas montañas donde la niebla nunca se levanta. Los mapas modernos todavía tienen zonas en blanco ahí.", img: "endless dark Andean mountain range completely covered in thick fog, jagged peaks emerging from clouds, dusk, epic aerial view", mov: "alejar" },
    { id: "g2", texto: "Se llaman los Llanganates. Y según la tradición, ahí está escondido el oro que Rumiñahui le quitó a los conquistadores.", img: "glimmer of Inca gold objects hidden in a misty mountain cave, a single ray of light through fog", mov: "acercar" },
    { id: "g3", texto: "Un hombre llegó a encontrarlo. Escribió el camino exacto, paso por paso, y se lo dejó al rey de España.", img: "aged Spanish parchment with handwritten directions and a red wax seal lying on a table, candlelight, quill", mov: "derecha" },
    { id: "g4", texto: "Desde entonces, muchos han seguido esas instrucciones. Algunos nunca regresaron.", img: "an abandoned explorer camp in foggy mountains, a torn tent, an old lantern on the ground, no people", mov: "acercar" },
    { id: "g4b", texto: "Hoy te voy a contar esa historia completa: el general que escondió el oro, el soldado que lo encontró, y todos los que murieron intentando seguir su camino.", img: "a dramatic triptych feeling: an Inca general, a Spanish soldier and a lost explorer silhouettes on a misty mountain ridge at dusk", mov: "alejar" },
    { id: "g5", texto: "Si viste nuestro relato de Cantuña, esta es la otra mitad de la historia. Y si no lo viste, no te preocupes: aquí empieza todo.", img: "an old brass lantern glowing on a stone line at night under a full moon, fog, mysterious and elegant", mov: "subir" },
    // EL ORO QUE NUNCA LLEGÓ
    { id: "a1", texto: "Año mil quinientos treinta y tres. Atahualpa, el último gran emperador inca, ha sido ejecutado por los españoles.", img: "Inca emperor Atahualpa in golden regalia standing in shadows surrounded by Spanish conquistadors with torches, tense, epic historical realism", mov: "acercar" },
    { id: "a2", texto: "Para salvar su vida había prometido una habitación llena de oro. Y desde todo el imperio salieron caravanas cargadas de tesoros.", img: "long caravan of llamas and Inca porters carrying golden treasures along a narrow mountain trail, clouds below, epic", mov: "derecha" },
    { id: "a3", texto: "Una de ellas venía desde el norte, desde Quito. La dirigía el general Rumiñahui.", img: "fierce Inca general Rumiñahui, brown skin, large golden ear spools, woven Inca tunic with geometric patterns, simple woven headband, holding a bronze star-headed mace, on a mountain ridge at dusk", mov: "acercar" },
    { id: "a4", texto: "Cuando supo que su emperador había muerto, detuvo la caravana. Y en lugar de entregar el oro, lo llevó a las montañas.", img: "Inca porters carrying golden statues into thick fog on a steep mountain slope, torches, night falling", mov: "subir" },
    { id: "a5", texto: "Cuentan que lo escondió en lo más profundo de los Llanganates: en una cueva, o en el fondo de una laguna artificial, cerca de un cerro con forma de tres picos.", img: "a dark mountain lagoon surrounded by three jagged peaks in fog, faint golden glow under the water, moonlight", mov: "alejar" },
    { id: "a6", texto: "Rumiñahui fue capturado y torturado. Nunca dijo dónde estaba el oro.", img: "silhouette of a proud Inca warrior standing defiant in a dark stone prison, torchlight from a small window, no blood", mov: "acercar" },
    // VALVERDE
    { id: "v1", texto: "Pasan unas décadas. Llega a la región de Píllaro un soldado español pobre, de esos que cruzaron el mar buscando fortuna y no la encontraron. Se llamaba Valverde.", img: `${ESPANOL}, tired and poor, walking alone into a small Andean colonial village with adobe houses, mountains behind, overcast`, mov: "derecha" },
    { id: "v2", texto: "Valverde se enamora de una joven indígena del lugar. Y se casa con ella.", img: "a modest wedding in a small colonial Andean chapel, a Spanish soldier and a young indigenous woman in traditional dress holding hands, candlelight, warm", mov: "acercar" },
    { id: "v2b", texto: "Para la familia de ella, un español en la casa era una protección en tiempos difíciles. Para él, era la oportunidad de empezar de nuevo, lejos de las guerras.", img: "a humble Andean adobe house interior with a family sharing a meal by the fire, a Spanish soldier among them, warm candlelight, intimate", mov: "derecha" },
    { id: "v3", texto: "Lo que Valverde no sabía, es que el padre de su esposa guardaba un secreto. Uno que su familia había protegido por generaciones.", img: `close-up of an old ${INDIGENA} with deep wrinkles, looking at the camera with a knowing gaze, firelight`, mov: "acercar" },
    { id: "v4", texto: "Un día, cuentan, el suegro lo llevó a las montañas. Caminaron durante días, entre pantanos, niebla y cerros sin nombre.", img: `an old ${INDIGENA} guiding a Spanish soldier through a misty high Andean marsh with tall grass, mountains vanishing into clouds`, mov: "derecha" },
    { id: "v5", texto: "Y entonces lo vio. Oro. Más oro del que un soldado pobre podía imaginar.", img: "a dark cave interior filled with Inca gold statues, masks and plates glowing in torchlight, epic reveal, awe", mov: "alejar" },
    { id: "v6", texto: "Desde ese día, Valverde se convirtió en un hombre muy rico. Volvía a la montaña cada cierto tiempo… y siempre regresaba con oro.", img: `${ESPANOL} now wearing rich velvet clothes and gold chains, counting gold pieces at a candlelit table, greedy smile`, mov: "acercar" },
    // EL DERROTERO
    { id: "d1", texto: "Años después, Valverde volvió a España convertido en un hombre poderoso.", img: "a Spanish galleon sailing across a stormy ocean at sunset, golden light through clouds, epic", mov: "derecha" },
    { id: "d2", texto: "Y estando a punto de morir, hizo algo que nadie esperaba: escribió las instrucciones exactas para llegar al tesoro, y se las dejó al rey.", img: "an old dying Spanish nobleman in a dark bedroom writing a letter by candlelight with a trembling hand, quill and ink", mov: "acercar" },
    { id: "d3", texto: "Ese documento se conoce como el Derrotero de Valverde. Una guía con señales en el camino: un cerro con forma de mujer, una laguna, un pantano, una cascada.", img: "close-up of a yellowed Spanish colonial document with handwritten text, small hand-drawn mountain and lagoon sketches in the margins, candlelight", mov: "derecha" },
    { id: "d3b", texto: "Pero el derrotero tiene una trampa: cada señal depende de la anterior. Un paso mal dado al inicio, y terminas a kilómetros del lugar correcto, perdido en un laberinto de cerros iguales.", img: "aerial view of endless identical misty Andean ridges and valleys like a labyrinth, a tiny explorer figure lost among them", mov: "alejar" },
    { id: "d4", texto: "Parecía fácil. Solo había que seguir las señales. El rey ordenó a las autoridades de Latacunga que encontraran el oro.", img: "a royal decree with the seal of the Spanish crown being handed to a colonial official in a stone hall, dramatic window light", mov: "acercar" },
    // EL FRAILE
    { id: "f1", texto: "La expedición salió con el corregidor de Latacunga y un fraile: el padre Longo.", img: "a colonial expedition of Spanish officials, a Franciscan friar in brown robes, mules and indigenous porters departing a mountain town at dawn, fog", mov: "derecha" },
    { id: "f2", texto: "Y al principio, todo coincidía. El cerro, la laguna, el pantano… estaban exactamente donde el derrotero decía.", img: "explorers in colonial clothes standing at the edge of a misty mountain lagoon, looking at a parchment, amazed faces", mov: "alejar" },
    { id: "f3", texto: "Pero una noche, en medio de la montaña, el padre Longo desapareció.", img: "an empty campfire in a foggy Andean night, a friar's rosary left on a rock, footprints leading into darkness", mov: "acercar" },
    { id: "f3b", texto: "Unos dijeron que cayó a un precipicio. Otros, que se perdió en la niebla. Y los porteadores indígenas murmuraban otra cosa: que la montaña no quería ser encontrada.", img: "indigenous porters whispering to each other around a small fire in a foggy mountain camp at night, worried faces", mov: "acercar" },
    { id: "f4", texto: "Lo buscaron durante días. Gritaron su nombre entre la niebla. Nunca encontraron su cuerpo.", img: "silhouettes of men with torches searching in thick fog on a mountain slope at night, calling out, desperate", mov: "derecha" },
    { id: "f5", texto: "La expedición regresó sin el fraile y sin el oro. Y el derrotero volvió a quedar guardado en un archivo.", img: "a dusty colonial archive room with stacks of old documents and a single candle, a parchment being placed on a shelf", mov: "alejar" },
    // GUZMÁN
    { id: "z1", texto: "Siglos después, un minero llamado Atanasio Guzmán pasó años recorriendo los Llanganates.", img: "a lone 18th century miner with a pickaxe and a mule climbing a misty Andean mountain, rugged and determined", mov: "subir" },
    { id: "z2", texto: "Hizo un mapa de la zona, con lagunas, cerros y caminos que nadie más conocía. Muchos creen que estuvo muy cerca.", img: "an old hand-drawn map of mountains and lagoons on yellowed paper, a compass and a candle on top, dramatic light", mov: "acercar" },
    { id: "z3", texto: "Pero antes de poder reclamar nada, Guzmán también murió en extrañas circunstancias. Y su mapa quedó como otra pieza del rompecabezas.", img: "an abandoned mountain hut at dusk with an open door, fog rolling inside, a hat on a wooden table", mov: "acercar" },
    { id: "z3b", texto: "Un fraile desaparecido. Un minero muerto. Cada persona que se acercaba al oro parecía correr la misma suerte. Y así nació la idea de una maldición.", img: "a dark mountain pass in fog with old wooden crosses on the side of the trail, ravens, ominous", mov: "subir" },
    { id: "m1", texto: "Si llegaste hasta aquí, suscríbete a Relatos de la Mitad. Porque lo que viene ahora es la parte más increíble de esta historia.", img: "an old brass lantern glowing on a stone line at night under a full moon, fog, mysterious and elegant", mov: "acercar" },
    // LOS INGLESES
    { id: "i1", texto: "Siglo diecinueve. Un botánico inglés que estudiaba las plantas de los Andes encuentra en un archivo de Latacunga una copia del derrotero, y también el mapa de Guzmán.", img: "a Victorian English botanist with spectacles reading old documents in a dim colonial archive, plant specimens on the table, candlelight", mov: "derecha" },
    { id: "i2", texto: "La historia llega a oídos de dos marineros británicos: el capitán Barth Blake y el teniente George Chapman. Y deciden ir por el tesoro.", img: "two 19th century British sailors in navy coats studying a map on a ship deck at sunset, determined faces", mov: "acercar" },
    { id: "i3", texto: "Según las cartas que Blake habría escrito después, siguieron el derrotero paso a paso… y encontraron una cueva.", img: "two 19th century explorers with lanterns entering a narrow cave entrance in a misty mountain cliff, golden light inside", mov: "acercar" },
    { id: "i4", texto: "Dentro, describe Blake, había estatuas de oro, joyas, y figuras de tamaño humano. Miles de piezas.", img: "inside a cave, life-size golden Inca statues and piles of jewels glowing under lantern light, two explorers frozen in awe", mov: "alejar" },
    { id: "i4b", texto: "Blake escribió que podían haber sacado mucho más, pero que la montaña no los dejaba. El frío, la lluvia y la falta de comida los obligaron a bajar.", img: "two exhausted 19th century explorers struggling through freezing rain on a high Andean ridge, wrapped in blankets, heavy sacks", mov: "derecha" },
    { id: "i5", texto: "Sacaron lo que pudieron cargar y dibujaron el camino para volver con más hombres.", img: "an explorer drawing a map by lantern light inside a cave, gold pieces next to him, intense concentration", mov: "acercar" },
    { id: "i6", texto: "Pero en el regreso, Chapman murió en la montaña. Y Blake, años después, desapareció en el mar antes de volver por el resto.", img: "a lone sailor standing at the bow of a ship in a violent ocean storm at night, lightning, waves", mov: "derecha" },
    { id: "i7", texto: "Para muchos, las cartas de Blake son una invención. Para otros, son la prueba de que el tesoro existe.", img: "old handwritten letters scattered on a dark wooden table with a magnifying glass and a gold coin, candlelight", mov: "acercar" },
    // HOY
    { id: "h1", texto: "Hoy, los Llanganates son un parque nacional. Un lugar hermoso, de lagunas y páramos, pero también uno de los más difíciles de recorrer en el Ecuador.", img: "breathtaking real landscape of the Llanganates national park in Ecuador, páramo grassland, dark lagoons, mountains with clouds, golden hour", mov: "alejar" },
    { id: "h2", texto: "Llueve casi todos los días. La niebla puede caer en minutos. Hay pantanos que no se ven hasta que estás dentro.", img: "a hiker in a rain jacket seen from behind in thick fog on a páramo trail in the Andes, rain, wet grass", mov: "derecha" },
    { id: "h2b", texto: "Varios exploradores han tenido que ser rescatados. Otros pasaron días caminando en círculos, convencidos de que avanzaban, sin saber dónde estaban.", img: "a rescue team with headlamps searching a misty páramo at night, flashlight beams in the fog", mov: "acercar" },
    { id: "h3", texto: "Aun así, todavía llegan expediciones de todo el mundo con copias del derrotero, intentando descifrar las señales.", img: "a modern expedition team with backpacks and GPS looking at an old map copy on a misty Andean ridge", mov: "acercar" },
    { id: "h4", texto: "Nadie ha presentado el oro de Rumiñahui. Ni una sola pieza.", img: "an empty dark cave with a single ray of light hitting a bare stone floor, dust in the air, mysterious", mov: "acercar" },
    { id: "h5", texto: "Tal vez la montaña lo protege. Tal vez nunca existió. O tal vez alguien lo encontró… y decidió no decir nada.", img: "silhouette of a cloaked figure standing on a foggy mountain peak at dawn looking down at the valley, mysterious", mov: "alejar" },
    // CIERRE
    { id: "c1", texto: "¿Tú qué crees? ¿El oro de Rumiñahui sigue escondido en los Llanganates? Déjamelo en los comentarios.", img: "the dark mountain lagoon surrounded by three peaks in fog with a faint golden glow under the water, moonlight", mov: "acercar" },
    { id: "c2", texto: "Y suscríbete, porque en el próximo relato nos vamos a Guayaquil, a conocer a la mujer que aparecía de noche con el rostro cubierto: la Dama Tapada.", img: "a mysterious elegant woman in a long dark colonial dress with her face covered by a black veil, walking on a foggy wooden pier at night in old Guayaquil, lanterns", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "LLANGANATES", sub: "El mapa que nadie pudo seguir" };

export const CAPITULOS = {
  a1: "El oro que nunca llegó",
  v1: "El soldado Valverde",
  d1: "El derrotero",
  f1: "El fraile que desapareció",
  z1: "El mapa de Guzmán",
  i1: "Los marineros ingleses",
  h1: "Los Llanganates hoy",
};

// Reels para las 3 redes (60-75 s) y PARTES solo para TikTok (la historia completa en vertical).
export const REELS = [
  { id: "reel1", gancho: "Hay un tesoro inca que nadie ha encontrado", escenas: ["g1", "g2", "g3", "g4", "a3", "a4", "a5", "a6"], cierre: "¿Dónde está? Relato completo en el canal" },
  { id: "reel2", gancho: "Un soldado pobre se casó… y se volvió millonario", escenas: ["v1", "v2", "v3", "v4", "v5", "v6", "d2"], cierre: "Lo que escribió antes de morir, en el canal" },
  { id: "reel3", gancho: "El fraile que desapareció buscando oro", escenas: ["d3", "d4", "f1", "f2", "f3", "f4", "f5"], cierre: "La historia completa, en el canal" },
  { id: "reel4", gancho: "Dijeron que encontraron el oro… y murieron", escenas: ["i2", "i3", "i4", "i5", "i6", "i7", "h4"], cierre: "¿Verdad o mentira? Míralo en el canal" },
  // Reels cortos de "un dato" (25-40 s), para publicar más seguido.
  { id: "reel5", gancho: "El mapa del tesoro que le dejó al rey", escenas: ["d2", "d3", "d3b"], cierre: "La historia completa, en el canal" },
  { id: "reel6", gancho: "Hizo el mapa del tesoro… y murió", escenas: ["z1", "z2", "z3", "z3b"], cierre: "La historia completa, en el canal" },
  { id: "reel7", gancho: "Dos marineros encontraron la cueva de oro", escenas: ["i1", "i2", "i3", "i4"], cierre: "¿Verdad o mentira? En el canal" },
  { id: "reel8", gancho: "El parque donde la niebla se traga a la gente", escenas: ["h1", "h2", "h2b", "h3"], cierre: "La historia completa, en el canal" },
  { id: "reel9", gancho: "Prometió una habitación llena de oro", escenas: ["a1", "a2", "a3", "a4"], cierre: "¿Dónde está ese oro? En el canal" },
  { id: "reel10", gancho: "El día que encontró el oro", escenas: ["v3", "v4", "v5", "v6"], cierre: "La historia completa, en el canal" },
  { id: "parte1", tiktok: true, gancho: "Llanganates · Parte 1: el oro de Rumiñahui", escenas: ["g1", "g2", "g3", "g4", "a1", "a2", "a3", "a4", "a5", "a6"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "Llanganates · Parte 2: el soldado Valverde", escenas: ["v1", "v2", "v2b", "v3", "v4", "v5", "v6", "d1", "d2", "d3", "d3b", "d4"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "Llanganates · Parte 3: los que desaparecieron", escenas: ["f1", "f2", "f3", "f3b", "f4", "f5", "z1", "z2", "z3", "z3b"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "Llanganates · Parte 4: la cueva de oro", escenas: ["i1", "i2", "i3", "i4", "i4b", "i5", "i6", "i7", "h1", "h2", "h2b", "h3", "h4", "h5", "c1"], cierre: "Sígueme para el próximo relato" },
];

// Segundos máximos que se usan de cada clip animado (el resto se descarta).
// i4: desde el segundo 5 Veo dibujó estatuas egipcias, que no corresponden al oro inca.
export const CLIPS_MAX = { i4: 4 };

// reel nuevo 2026-11-12
REELS.push({"id":"reel11","gancho":"¿Dónde quedó el oro de Rumiñahui?","escenas":["g2","d3","f3","c1"],"cierre":"Historia completa en el canal"});

// reel nuevo 2026-11-13
REELS.push({"id":"reel12","gancho":"El mapa de Guzmán: ¿dónde quedó el oro?","escenas":["z1","z2","z3b","c1"],"cierre":"Historia completa en el canal"});
