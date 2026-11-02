// Relato 6: El tesoro pirata de la Isla de la Plata (Manabí). Tema de oro/tesoro, el que mejor funciona.
// Datos verificables: Francis Drake y el Golden Hind en el Pacífico (1578-1579), la captura del galeón
// Nuestra Señora de la Concepción, apodado "Cacafuego", el 1 de marzo de 1579 frente a Esmeraldas
// (cerca de 36 kg de oro, unas 26 toneladas de plata, cofres de monedas y joyas; seis días de trasbordo).
// La leyenda dice que Drake escondió parte en la Isla de la Plata; los historiadores lo dudan (ningún relato
// de la época menciona una isla). La isla sí fue un santuario precolombino (ofrendas de Spondylus desde
// ~2450 a. C.; George Dorsey excavó en 1892 y halló un entierro inca). Hoy: Parque Nacional Machalilla.
const ESTILO =
  "cinematic film still from an epic historical adventure documentary, ultra realistic, 16th century Pacific coast of Ecuador, warm golden light, deep shadows, volumetric light, film grain, dramatic composition, no text, no watermark";
const DRAKE = "English privateer captain in his late thirties, short reddish-brown beard, Elizabethan dark doublet with a white ruff collar, gold earring, confident sharp eyes";
const HIND = "small English galleon Golden Hind with weathered sails and a golden hind figurehead";
const GALEON = "large heavy Spanish treasure galleon with tall stern castle and red cross sails, riding low in the water";

export const HISTORIA = {
  id: "isla-plata",
  titulo: "El tesoro pirata de la Isla de la Plata",
  voz: "Rl2JPHsuEWSfwCD4ZHIQ", // El Faraón
  estilo: ESTILO,
  escenas: [
    // GANCHO
    { id: "g1", texto: "Frente a la costa de Manabí, en Ecuador, hay una isla con un nombre muy extraño: la Isla de la Plata.", img: "aerial view of a rugged rocky island in the Pacific Ocean off the coast of Ecuador at golden hour, white cliffs, turquoise water", mov: "acercar" },
    { id: "g2", texto: "Y desde hace más de cuatrocientos años, los pescadores cuentan por qué se llama así.", img: "old Ecuadorian fisherman on a wooden boat at dawn looking toward a distant island, weathered face, golden light", mov: "derecha" },
    { id: "g3", texto: "Dicen que ahí, bajo la tierra seca y las rocas, un pirata inglés escondió parte del tesoro más grande que robó en toda su vida.", img: "a half-buried wooden treasure chest overflowing with silver bars and gold coins among dry rocks on an island, dramatic light", mov: "acercar" },
    { id: "g4", texto: "Toneladas de plata. Kilos de oro. Y nadie ha podido demostrar dónde quedó.", img: "pile of silver ingots and gold coins glowing in a dark cave, lantern light, mysterious", mov: "izquierda" },
    { id: "g5", texto: "Hoy te cuento la historia real del pirata Francis Drake, el galeón más rico del Pacífico… y el secreto que la isla guardaba mucho antes de él.", img: `${DRAKE}, standing on the deck of a ship at sunset, looking at the horizon, wind in his cape`, mov: "acercar" },
    // EL MAR DEL SUR
    { id: "m1", texto: "Año 1579. El océano Pacífico, al que los españoles llamaban el Mar del Sur, era como un camino privado.", img: "vast calm Pacific Ocean at golden hour with a single Spanish galleon sailing far away, epic wide shot", mov: "derecha" },
    { id: "m2", texto: "Por ahí bajaba la plata de las minas de Potosí y el oro del Perú, rumbo a Panamá, y de ahí a España.", img: "colonial mule train carrying silver bars down Andean mountains toward the coast, dust and golden light", mov: "izquierda" },
    { id: "m3", texto: "Los galeones viajaban tranquilos, casi sin cañones. ¿Quién iba a atacarlos? Ningún barco enemigo había llegado jamás hasta ese mar.", img: `${GALEON}, sailing peacefully along a green tropical coastline, sailors relaxed on deck`, mov: "acercar" },
    { id: "m4", texto: "Hasta que llegó él.", img: "silhouette of a small ship appearing out of the sea mist at dawn, ominous", mov: "acercar" },
    // DRAKE
    { id: "d1", texto: "Francis Drake era un marino inglés. Para Inglaterra, un héroe con permiso de la reina. Para España, un pirata.", img: `${DRAKE}, portrait in a dim ship cabin lit by candles, maps on the table, half smile`, mov: "acercar" },
    { id: "d2", texto: "Había cruzado el estrecho de Magallanes con varios barcos. Las tormentas se los fueron quitando uno por uno.", img: "small wooden ships fighting huge stormy waves in the Strait of Magellan, dark sky, lightning", mov: "derecha" },
    { id: "d3", texto: "Al final le quedó solo uno: el Golden Hind, la Cierva Dorada. Y con ese único barco, subió por la costa saqueando puertos.", img: `${HIND}, sailing alone along the rocky coast of South America, dramatic clouds`, mov: "izquierda" },
    { id: "d4", texto: "En el Callao, el puerto de Lima, escuchó la noticia que cambiaría su vida.", img: "16th century Spanish colonial port of Callao with ships at anchor at dusk, torches, tense atmosphere", mov: "acercar" },
    { id: "d5", texto: "Un galeón había salido rumbo a Panamá cargado hasta el tope. Su nombre era Nuestra Señora de la Concepción. Los marineros lo llamaban el Cacafuego.", img: `${GALEON}, leaving a colonial port, heavily loaded, crates of treasure being stowed`, mov: "derecha" },
    // LA PERSECUCIÓN
    { id: "c1", texto: "Drake salió tras él. El galeón llevaba días de ventaja, pero era lento y pesado.", img: `${HIND}, racing across the ocean with full sails, sea spray, determined crew`, mov: "acercar" },
    { id: "c2", texto: "Para animar a sus hombres, Drake prometió una cadena de oro al primero que viera el barco español.", img: `${DRAKE}, holding up a heavy gold chain in front of his cheering sailors on deck`, mov: "acercar" },
    { id: "c3", texto: "Cuentan que la ganó su joven primo, John, que lo vio desde lo alto del mástil frente a la costa de Esmeraldas.", img: "a teenage English boy, male, short hair, in a simple 16th century linen shirt, clinging to the top of a wooden ship mast and pointing at the horizon, excited, wind, golden light", mov: "arriba" },
    { id: "c4", texto: "Y entonces Drake hizo un truco: ató cuerdas y barriles a la popa para frenar su barco y parecer un mercante inofensivo.", img: "ropes and wooden barrels dragging in the water behind the stern of an old galleon, sly trick, calm sea", mov: "izquierda" },
    { id: "c5", texto: "El capitán español, San Juan de Antón, vio acercarse ese barquito… y no sospechó nada.", img: "Spanish galleon captain in 16th century armor looking calmly through a spyglass on deck, sunset", mov: "acercar" },
    // LA CAPTURA
    { id: "k1", texto: "Primero de marzo de 1579. Al caer la tarde, el Golden Hind se puso al lado del galeón.", img: `${HIND} pulling alongside a ${GALEON} at dusk, orange sky, tension`, mov: "derecha" },
    { id: "k2", texto: "De repente, las cuerdas cayeron, los cañones asomaron y un disparo derribó el mástil del Cacafuego.", img: "cannon fire and smoke between two galleons at dusk, a mast cracking and falling, dramatic", mov: "acercar" },
    { id: "k3", texto: "Los ingleses abordaron con espadas y arcabuces. El galeón casi no tenía armas. Se rindió en minutos.", img: "English sailors boarding a Spanish galleon with swords and muskets through smoke, chaos, firelight", mov: "izquierda" },
    { id: "k4", texto: "Y cuando abrieron las bodegas, ni ellos podían creer lo que vieron.", img: "sailors opening the hatch of a ship hold revealing glowing silver bars and chests, astonished faces", mov: "acercar" },
    // EL BOTÍN
    { id: "b1", texto: "Unos treinta y seis kilos de oro. Trece cofres llenos de monedas. Joyas y piedras preciosas.", img: "open wooden chests full of gold coins, jewels and emeralds in a ship hold, candlelight reflections", mov: "acercar" },
    { id: "b2", texto: "Y alrededor de veintiséis toneladas de plata. Tanta, que tardaron seis días en pasarla de un barco al otro.", img: "sailors carrying heavy silver ingots across planks between two ships anchored in a hidden bay, sweat, sunlight", mov: "derecha" },
    { id: "b3", texto: "Lo hicieron en un rincón escondido de la costa, lejos de los ojos españoles.", img: "two galleons anchored in a secluded tropical bay with cliffs and jungle, calm water, golden hour", mov: "alejar" },
    { id: "b4", texto: "Fue uno de los robos más grandes de la historia del mar. Y aquí empieza la leyenda.", img: `${DRAKE}, sitting on a pile of silver bars in the ship hold, lantern light, satisfied`, mov: "acercar" },
    // LA LEYENDA
    { id: "l1", texto: "El Golden Hind era un barco pequeño. Con tanto peso, se hundía demasiado en el agua. Era peligroso navegar así.", img: `${HIND} riding dangerously low in the water, waves washing over the deck, worried sailors`, mov: "derecha" },
    { id: "l2", texto: "Según la leyenda, Drake tuvo que aligerar la carga. Y eligió un lugar: una isla seca y solitaria frente a Manabí.", img: "a lonely dry rocky island with cliffs in the Pacific, small boats rowing toward it at dusk", mov: "acercar" },
    { id: "l3", texto: "Ahí, dicen, sus hombres desembarcaron cofres de plata y los escondieron entre las rocas y las cuevas.", img: "pirates carrying heavy chests up a rocky island slope at night with torches, mysterious", mov: "izquierda" },
    { id: "l4", texto: "Desde entonces, la isla dejó de tener otro nombre. Para todos, fue la Isla de la Plata.", img: "old hand-drawn 16th century map of the Ecuadorian coast with an island marked with an X, parchment, candlelight", mov: "acercar" },
    { id: "l5", texto: "Y durante siglos, aventureros y buscadores de tesoros llegaron con picos y palas, convencidos de que la plata seguía ahí.", img: "treasure hunters in old clothes digging among rocks on a dry island under the hot sun, sweat, shovels", mov: "derecha" },
    // ¿VERDAD O LEYENDA?
    { id: "v1", texto: "Pero aquí viene lo interesante. Los diarios del viaje de Drake cuentan la captura con mucho detalle.", img: "old leather-bound ship log open on a wooden table with handwritten English text, quill and candle", mov: "acercar" },
    { id: "v2", texto: "Y en ninguno se menciona una isla. Varios historiadores creen que, con las fechas del viaje, ni siquiera tuvo tiempo de pasar por ahí.", img: "historian examining old manuscripts and maps with a magnifying glass in a dim archive", mov: "izquierda" },
    { id: "v3", texto: "Drake volvió a Inglaterra en 1580 con la plata a bordo. La reina Isabel lo nombró caballero en la cubierta de su propio barco.", img: "Queen Elizabeth I knighting Francis Drake on the deck of the Golden Hind, crowd, ceremony, 1581", mov: "acercar" },
    { id: "v4", texto: "Entonces… ¿de dónde salió el nombre? ¿Y por qué tanta gente juraba que había un tesoro en esa isla?", img: "mysterious rocky island under storm clouds with a beam of sunlight hitting it, intrigue", mov: "acercar" },
    // EL SANTUARIO
    { id: "s1", texto: "La respuesta estaba bajo tierra. Y era mucho más antigua que cualquier pirata.", img: "archaeological excavation on a dry island hillside, layers of earth, ancient pottery fragments, golden light", mov: "acercar" },
    { id: "s2", texto: "Mucho antes de los españoles, la Isla de la Plata fue un lugar sagrado. Durante unos cuatro mil años, los pueblos de la costa navegaban hasta ella para dejar ofrendas.", img: "ancient pre-Columbian coastal people paddling balsa rafts toward a sacred island at dawn, ceremonial", mov: "derecha" },
    { id: "s3", texto: "Figuras de barro, piedras talladas y la concha Spondylus, roja como la sangre, más valiosa para ellos que el oro.", img: "ancient red Spondylus shells, clay figurines and carved stones laid as offerings on rocks, warm light", mov: "acercar" },
    { id: "s4", texto: "En 1892 llegó el arqueólogo George Dorsey. Encontró ofrendas, y también una tumba inca: la marca más al norte que dejó el imperio en esa costa.", img: "19th century archaeologist in a hat excavating an ancient tomb on an island, assistants, 1890s photograph style", mov: "izquierda" },
    { id: "s5", texto: "Y descubrió algo más: antes de su visita, alguien ya había sacado de esas tumbas varios objetos de metal. Nunca se supo adónde fueron.", img: "an empty looted ancient tomb with scattered stones and a broken clay vessel, eerie light", mov: "acercar" },
    // HOY
    { id: "o1", texto: "Hoy la isla es parte del Parque Nacional Machalilla. La llaman la Galápagos de los pobres.", img: "blue-footed booby birds on the rocks of Isla de la Plata, turquoise sea behind, bright sunny day", mov: "derecha" },
    { id: "o2", texto: "Ahí viven piqueros de patas azules, albatros y fragatas. Y entre junio y septiembre, a su alrededor saltan las ballenas jorobadas.", img: "humpback whale breaching near a rocky island in the Pacific Ocean, spray, dramatic", mov: "acercar" },
    { id: "o3", texto: "Los turistas caminan por los mismos senderos donde, según la leyenda, un pirata enterró su plata.", img: "tourists hiking a dry trail on a rocky island with ocean views, golden afternoon light", mov: "izquierda" },
    // CIERRE
    { id: "z1", texto: "Y tú, ¿crees que el tesoro de Drake sigue escondido en la Isla de la Plata? ¿O el verdadero tesoro siempre fue la isla? Déjamelo en los comentarios.", img: "close-up of a round old Spanish silver coin, a piece of eight with a cross stamped on it, half buried in wet sand on a beach at sunset, small waves", mov: "acercar" },
    { id: "z2", texto: "Suscríbete, porque en el próximo relato vamos tras otro tesoro perdido de nuestra tierra.", img: "lantern light revealing a glimmer of gold in a dark tunnel, mysterious, inviting", mov: "acercar" },
  ],
};

export const TITULO_CARTEL = { en: "g5", titulo: "LA ISLA DE LA PLATA", sub: "El tesoro del pirata Drake" };

export const CAPITULOS = {
  m1: "El Mar del Sur",
  d1: "Francis Drake",
  c1: "La persecución",
  k1: "La captura",
  b1: "El botín",
  l1: "La leyenda",
  v1: "¿Verdad o leyenda?",
  s1: "El santuario",
  o1: "La isla hoy",
};

export const REELS = [
  { id: "reel1", gancho: "Un pirata escondió su tesoro en esta isla de Ecuador", escenas: ["g1", "g2", "g3", "g4"], cierre: "Este viernes, la historia completa" },
  { id: "reel2", gancho: "El barco con 26 toneladas de plata", escenas: ["d5", "k4", "b1", "b2"], cierre: "Este viernes, en el canal" },
  { id: "reel3", gancho: "Prometió una cadena de oro a quien viera el barco", escenas: ["c1", "c2", "c3", "c4", "c5"], cierre: "La historia completa, en el canal" },
  { id: "reel4", gancho: "El truco del pirata para cazar un galeón", escenas: ["c4", "c5", "k1", "k2", "k3"], cierre: "Relato completo en el canal" },
  { id: "reel5", gancho: "Esta isla fue sagrada durante 4.000 años", escenas: ["s2", "s3", "s4", "s5"], cierre: "¿Lo sabías? Míralo en el canal" },
  { id: "reel6", gancho: "¿El tesoro de Drake sigue enterrado?", escenas: ["l5", "v1", "v2", "v4", "z1"], cierre: "Tú, ¿qué crees? En el canal" },
  { id: "parte1", tiktok: true, gancho: "La Isla de la Plata · Parte 1: el pirata", escenas: ["g1", "g2", "g3", "g4", "m1", "m2", "m3", "m4", "d1", "d2", "d3", "d4", "d5"], cierre: "Parte 2 en mi perfil · Sígueme" },
  { id: "parte2", tiktok: true, gancho: "La Isla de la Plata · Parte 2: la caza", escenas: ["c1", "c2", "c3", "c4", "c5", "k1", "k2", "k3", "k4", "b1", "b2"], cierre: "Parte 3 en mi perfil · Sígueme" },
  { id: "parte3", tiktok: true, gancho: "La Isla de la Plata · Parte 3: la leyenda", escenas: ["b3", "b4", "l1", "l2", "l3", "l4", "l5", "v1", "v2", "v3", "v4"], cierre: "Parte 4 en mi perfil · Sígueme" },
  { id: "parte4", tiktok: true, gancho: "La Isla de la Plata · Parte 4: el secreto", escenas: ["s1", "s2", "s3", "s4", "s5", "o1", "o2", "o3", "z1"], cierre: "Sígueme para el próximo relato" },
];

export const CLIPS_MAX = {};
