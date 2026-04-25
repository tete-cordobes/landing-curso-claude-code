#!/usr/bin/env bash
#
# Bloquea cualquier `rm -rf` que toque el proyecto o el home.
# Solo permite rm -rf dentro de /tmp/ y subdirectorios.
#
# Disparador: PreToolUse → Bash con if=Bash(rm -rf *)

set -euo pipefail

# Lee el JSON de entrada del stdin
INPUT="$(cat)"
COMMAND="$(echo "$INPUT" | jq -r '.tool_input.command // ""')"

# Si el comando opera sobre /tmp/ explícitamente, lo dejamos pasar.
if echo "$COMMAND" | grep -qE 'rm -rf[[:space:]]+(/tmp/|\./tmp|/var/tmp/)'; then
  exit 0
fi

# Bloqueamos cualquier otro rm -rf
cat <<EOF >&2
🛑 BLOQUEADO: rm -rf detectado fuera de /tmp/

Comando rechazado:
  $COMMAND

Si REALMENTE necesitas borrar esto, ejecútalo tú a mano fuera de Claude.
Las operaciones destructivas requieren intervención humana explícita.
EOF

exit 2
