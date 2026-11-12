#!/usr/bin/env bash
# Subsets the app's OFL fonts to Latin + ₹ and writes woff2 files to
# src/assets/fonts/. The outputs are committed; run this only to regenerate.
#
# Needs: APP_REPO_PATH (the app repo, read-only; fonts come from its
# node_modules/@expo-google-fonts) and pyftsubset on PATH
# (pip install fonttools==4.55.0 brotli==1.1.0).
set -euo pipefail

: "${APP_REPO_PATH:?Set APP_REPO_PATH to the app repo (read-only source of the font files)}"
SRC="$APP_REPO_PATH/node_modules/@expo-google-fonts"
OUT="$(cd "$(dirname "$0")/.." && pwd)/src/assets/fonts"
LIC="$(cd "$(dirname "$0")/.." && pwd)/public/fonts"
mkdir -p "$OUT" "$LIC"

# Google Fonts' "latin" range plus ₹ (U+20B9) and the arrows used in copy.
UNICODES="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+20B9,U+2122,U+2190-2193,U+2212,U+2215,U+FEFF,U+FFFD"

subset() {
  local in="$1" out="$2"
  pyftsubset "$SRC/$in" \
    --unicodes="$UNICODES" \
    --layout-features='kern,liga,calt,clig,tnum,lnum,case,ccmp,locl,mark,mkmk' \
    --name-IDs='*' \
    --no-hinting \
    --desubroutinize \
    --flavor=woff2 \
    --output-file="$OUT/$out"
  echo "$out $(wc -c < "$OUT/$out") bytes"
}

subset prata/400Regular/Prata_400Regular.ttf prata-400.woff2
subset dm-sans/400Regular/DMSans_400Regular.ttf dm-sans-400.woff2
subset dm-sans/500Medium/DMSans_500Medium.ttf dm-sans-500.woff2
subset dm-sans/600SemiBold/DMSans_600SemiBold.ttf dm-sans-600.woff2
subset dm-mono/400Regular/DMMono_400Regular.ttf dm-mono-400.woff2
subset dm-mono/500Medium/DMMono_500Medium.ttf dm-mono-500.woff2

cp "$SRC/prata/LICENSE_FONT" "$LIC/OFL-prata.txt"
cp "$SRC/dm-sans/LICENSE_FONT" "$LIC/OFL-dm-sans.txt"
cp "$SRC/dm-mono/LICENSE_FONT" "$LIC/OFL-dm-mono.txt"
