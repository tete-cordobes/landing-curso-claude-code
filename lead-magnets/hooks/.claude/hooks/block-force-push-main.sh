#!/usr/bin/env bash
#
# Bloquea git push --force a main / master.
# En cualquier otra rama, lo permite (a veces es legítimo en feature branches).
#
# Disparador: PreToolUse → Bash con if=Bash(git push --force*)

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

INPUT="$(cat)"
COMMAND="$(echo "$INPUT" | jq -r '.tool_input.command // ""')"

# Detecta si el push apunta a main/master
if echo "$COMMAND" | grep -qE '(origin|upstream)[[:space:]]+(main|master)|HEAD:(main|master)'; then
  cat <<EOF >&2
🛑 BLOQUEADO: force push a main/master detectado

Comando: $COMMAND

Force push a main eh casi siempre un error grave. Sobreescribe historial
público y rompe el repo de los demás.

Si REALMENTE necesitas hacerlo:
  - Comprueba con el equipo
  - Hazlo tú a mano fuera de Claude
EOF
  exit 2
fi

# Si no es a main/master, miramos la rama actual
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" ]]; then
  cat <<EOF >&2
🛑 BLOQUEADO: estás en $CURRENT_BRANCH y el comando es force push

Comando: $COMMAND

Aunque no se ve $CURRENT_BRANCH en el comando, podría estar implícito.
Si necesitas force push, cambia a tu rama feature primero:
  git checkout feature/tu-rama
EOF
  exit 2
fi

# En feature branches, lo dejamos pasar
exit 0
