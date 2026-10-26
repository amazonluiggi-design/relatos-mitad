#!/usr/bin/env bash
# Renderiza el video largo y los reels de una historia y normaliza el audio a -14 LUFS.
# Uso: bash scripts/renderizar.sh cantuna [largo|reel1|...]
set -e
H=$1; SOLO=$2
NODE=node
R="$NODE node_modules/@remotion/cli/remotion-cli.js"
SAL="$HOME/Documents/Escritorio/Relatos de la Mitad/$H"
mkdir -p out "$SAL"
COMPS=$($NODE -e "const p=require('./src/datos/$H-plan.json');console.log(['largo',...p.reels.map(r=>r.id)].join(' '))")
for c in $COMPS; do
  [ -n "$SOLO" ] && [ "$SOLO" != "$c" ] && continue
  $R render src/index.ts "$H-$c" "out/$H-$c-crudo.mp4" --codec=h264 --crf=18 --log=error
  $R ffmpeg -y -loglevel error -i "out/$H-$c-crudo.mp4" -c:v copy -af "loudnorm=I=-14:TP=-1:LRA=11,aformat=channel_layouts=stereo" -c:a aac -b:a 192k -ar 48000 "out/$H-$c.mp4"
  cp "out/$H-$c.mp4" "$SAL/"
  echo "listo $c"
done
