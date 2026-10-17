#!/usr/bin/env bash
# Copia a dist/ solo los archivos del sitio que están en git y los publica en Cloudflare.
set -euo pipefail
cd "$(dirname "$0")"
rm -rf dist && mkdir dist
git ls-files -z -- '*.html' '*.css' '*.js' '*.txt' '*.xml' '*.jpg' 'assets/**' | while IFS= read -r -d '' f; do
  mkdir -p "dist/$(dirname "$f")" && cp "$f" "dist/$f"
done
echo "Archivos a publicar: $(find dist -type f | wc -l)"
npx --yes wrangler@4.151.1 deploy "$@"
