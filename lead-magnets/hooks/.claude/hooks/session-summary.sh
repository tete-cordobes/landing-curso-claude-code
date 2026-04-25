#!/usr/bin/env bash
#
# Al terminar una sesión, escribe un resumen en .claude/sessions/
# con: hora, archivos tocados, último commit, líneas cambiadas.
#
# Útil para revisar al día siguiente qué hiciste sin abrir Claude otra vez.
#
# Si quieres que te llegue por Telegram, descomenta el bloque del final
# y pon tu BOT_TOKEN y CHAT_ID en variables de entorno.
#
# Disparador: Stop event (async, no bloquea)

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

SESSIONS_DIR=".claude/sessions"
mkdir -p "$SESSIONS_DIR"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
SUMMARY_FILE="$SESSIONS_DIR/$TIMESTAMP.md"
PROJECT_NAME=$(basename "$(pwd)")

# Recopilar info
LAST_COMMIT=$(git log -1 --pretty=format:"%h - %s (%ar)" 2>/dev/null || echo "(sin commits)")
MODIFIED_FILES=$(git diff --name-only HEAD 2>/dev/null | head -20 || echo "")
UNTRACKED_FILES=$(git ls-files --others --exclude-standard 2>/dev/null | head -10 || echo "")
DIFF_STATS=$(git diff --shortstat HEAD 2>/dev/null || echo "(sin cambios)")
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "(no es git)")

# Escribir el resumen
cat > "$SUMMARY_FILE" <<EOF
# Sesión $TIMESTAMP — $PROJECT_NAME

## Estado al cerrar
- Rama: \`$CURRENT_BRANCH\`
- Último commit: $LAST_COMMIT
- Cambios: $DIFF_STATS

## Archivos modificados
$(if [ -n "$MODIFIED_FILES" ]; then echo "$MODIFIED_FILES" | sed 's/^/- /'; else echo "(ninguno)"; fi)

## Archivos nuevos sin trackear
$(if [ -n "$UNTRACKED_FILES" ]; then echo "$UNTRACKED_FILES" | sed 's/^/- /'; else echo "(ninguno)"; fi)

## Próximos pasos sugeridos
- [ ] Revisar diff antes de commitear
- [ ] Correr tests si hay cambios en código
- [ ] Actualizar CLAUDE.md si hay convenciones nuevas

EOF

# Mantén solo las últimas 30 sesiones, borra las más viejas
if [ "$(ls "$SESSIONS_DIR" 2>/dev/null | wc -l)" -gt 30 ]; then
  ls -t "$SESSIONS_DIR" | tail -n +31 | xargs -I {} rm "$SESSIONS_DIR/{}"
fi

# ─── OPCIONAL: Notificación Telegram ────────────────────────────
# Descomenta y configura para recibir el resumen en Telegram.
# Necesitas un bot (https://core.telegram.org/bots#botfather) y tu chat_id.
#
# if [ -n "${TELEGRAM_BOT_TOKEN:-}" ] && [ -n "${TELEGRAM_CHAT_ID:-}" ]; then
#   MESSAGE="🤖 Sesión cerrada en *$PROJECT_NAME*\n\nRama: \`$CURRENT_BRANCH\`\n$DIFF_STATS\n\nÚltimo commit: $LAST_COMMIT"
#   curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
#     -d "chat_id=${TELEGRAM_CHAT_ID}" \
#     -d "text=${MESSAGE}" \
#     -d "parse_mode=Markdown" >/dev/null 2>&1 || true
# fi
# ────────────────────────────────────────────────────────────────

exit 0
