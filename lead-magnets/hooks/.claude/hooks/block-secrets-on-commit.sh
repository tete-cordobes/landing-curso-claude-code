#!/usr/bin/env bash
#
# Bloquea git commit si hay archivos sensibles staged o secretos en el diff.
# Eh la red de seguridad antes del pre-commit hook nativo de git.
#
# Disparador: PreToolUse → Bash con if=Bash(git commit:*)

set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-.}"

# 1. Archivos sensibles staged por nombre
SENSITIVE_FILES=$(git diff --cached --name-only 2>/dev/null | grep -E '(^|/)(\.env(\..+)?|.*\.pem|.*\.key|secrets?\.(json|yaml|yml)|credentials?\.json|service-account.*\.json)$' || true)

if [ -n "$SENSITIVE_FILES" ]; then
  cat <<EOF >&2
🛑 BLOQUEADO: archivos sensibles staged para commit

$SENSITIVE_FILES

Estos archivos no deberían entrar al repo. Ejecuta:
  git reset HEAD <archivo>

Y añádelos a .gitignore si aún no están.
EOF
  exit 2
fi

# 2. Patrones típicos de secretos en el contenido staged
SECRETS=$(git diff --cached 2>/dev/null | grep -aE '(AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,}|sk-ant-[a-zA-Z0-9-]{32,}|ghp_[a-zA-Z0-9]{36}|xox[baprs]-[a-zA-Z0-9-]{10,})' || true)

if [ -n "$SECRETS" ]; then
  cat <<EOF >&2
🛑 BLOQUEADO: posible secreto detectado en el diff

Patrones encontrados (extracto):
$(echo "$SECRETS" | head -3)

Si es un falso positivo, commitea fuera de Claude. Si es real:
  1. Elimina el secreto del código
  2. Rota la credencial inmediatamente (ya está en tu historial local)
  3. git reset HEAD y vuelve a stagear sin el secreto
EOF
  exit 2
fi

# Todo limpio, dejamos pasar
exit 0
