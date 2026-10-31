#!/usr/bin/env bash
# Publica una historia ya renderizada (out/<h>-*.mp4): portadas → R2 → Facebook → YouTube → panel.
# Funciona igual en la laptop y en GitHub Actions. Uso: bash scripts/publicar-historia.sh dama-tapada
set -e
H=$1
R="node node_modules/@remotion/cli/remotion-cli.js"
COMPS=$(node -e "const p=require('./src/datos/$H-plan.json');console.log(p.reels.map(r=>r.id).join(' '))")
mkdir -p out/portadas
node scripts/nube.mjs subir out/$H-miniatura.jpg $H/miniatura.jpg image/jpeg
for k in $COMPS; do
  $R ffmpeg -y -loglevel error -ss 1.5 -i out/$H-$k.mp4 -frames:v 1 -vf scale=540:-1 -q:v 3 out/portadas/$H-$k.jpg
  node scripts/nube.mjs subir out/portadas/$H-$k.jpg $H/$k.jpg image/jpeg
  node scripts/nube.mjs subir out/$H-$k.mp4 $H/$k.mp4 video/mp4
done
echo "== Facebook"; node scripts/fb-publicar.mjs $H 2>&1 | grep -vE "subido [0-9]+%" | tail -12
echo "== YouTube"; node scripts/yt-publicar.mjs $H 2>&1 | grep -E "subido|rror" | tail -12
echo "== Panel"; node autopilot/scripts/registrar-historia.mjs $H
