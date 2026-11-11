set -e
export VID=$1
node paso.mjs preparar.js
node paso.mjs texto.js
node paso.mjs portada.js
node paso.mjs programar.js
node paso.mjs publicar.js
