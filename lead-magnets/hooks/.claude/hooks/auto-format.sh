#!/usr/bin/env bash
#
# Auto-formatea el archivo que Claude acaba de editar/escribir.
# Detecta el formateador automáticamente por extensión y por archivos
# de configuración del proyecto.
#
# Disparador: PostToolUse → Edit|Write
# Filosofía: silencioso si todo va bien, ruidoso solo si falla.

set -euo pipefail

INPUT="$(cat)"
FILE="$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // ""')"

# Si no hay archivo, nada que hacer
[ -z "$FILE" ] && exit 0
[ ! -f "$FILE" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$FILE")}"

# Función helper: ejecuta un comando y se calla si va bien
run_quiet() {
  if ! "$@" >/dev/null 2>&1; then
    echo "⚠️  Formato falló en $FILE con: $*" >&2
    return 1
  fi
}

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.css|*.scss|*.html|*.md|*.yml|*.yaml)
    if [ -f "package.json" ] && grep -q '"prettier"' package.json 2>/dev/null; then
      if [ -x "node_modules/.bin/prettier" ]; then
        run_quiet ./node_modules/.bin/prettier --write "$FILE" || true
      elif command -v bunx >/dev/null 2>&1; then
        run_quiet bunx prettier --write "$FILE" || true
      elif command -v npx >/dev/null 2>&1; then
        run_quiet npx --no-install prettier --write "$FILE" || true
      fi
    fi
    ;;

  *.py)
    if command -v ruff >/dev/null 2>&1; then
      run_quiet ruff format "$FILE" || true
      run_quiet ruff check --fix "$FILE" || true
    elif command -v black >/dev/null 2>&1; then
      run_quiet black --quiet "$FILE" || true
    fi
    ;;

  *.go)
    command -v gofmt >/dev/null 2>&1 && run_quiet gofmt -w "$FILE" || true
    ;;

  *.rs)
    command -v rustfmt >/dev/null 2>&1 && run_quiet rustfmt --quiet "$FILE" || true
    ;;

  *.swift)
    command -v swift-format >/dev/null 2>&1 && run_quiet swift-format --in-place "$FILE" || true
    ;;
esac

# Siempre exit 0 — un fallo de formato no debería bloquear a Claude.
# Solo loggeamos a stderr para que se vea, pero seguimos.
exit 0
