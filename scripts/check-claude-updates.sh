#!/bin/bash
# =============================================================================
# Claude Code Update Checker — Cron script for VPS
# Checks npm for new versions and notifies via Telegram
# =============================================================================

# --- CONFIGURACIÓN -----------------------------------------------------------
# Telegram Bot Token (créalo con @BotFather en Telegram)
TELEGRAM_BOT_TOKEN="TU_BOT_TOKEN_AQUI"

# Tu Chat ID (envía /start a @userinfobot para obtenerlo)
TELEGRAM_CHAT_ID="TU_CHAT_ID_AQUI"

# Archivo donde se guarda la última versión conocida
VERSION_FILE="$HOME/.claude-code-last-version"

# Logs
LOG_FILE="$HOME/.claude-code-checker.log"
# -----------------------------------------------------------------------------

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

send_telegram() {
    local message="$1"
    curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d chat_id="${TELEGRAM_CHAT_ID}" \
        -d parse_mode="HTML" \
        -d text="${message}" \
        -d disable_web_page_preview="true" > /dev/null 2>&1
}

# Obtener última versión de npm
LATEST=$(curl -s "https://registry.npmjs.org/@anthropic-ai/claude-code/latest" | grep -o '"version":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$LATEST" ]; then
    log "ERROR: No se pudo obtener la versión de npm"
    exit 1
fi

# Leer versión conocida
if [ -f "$VERSION_FILE" ]; then
    CURRENT=$(cat "$VERSION_FILE" | tr -d '[:space:]')
else
    CURRENT="2.1.75"
    echo "$CURRENT" > "$VERSION_FILE"
fi

# Comparar
if [ "$LATEST" = "$CURRENT" ]; then
    log "OK: Sin cambios (v${CURRENT})"
    exit 0
fi

log "NUEVA VERSION: v${LATEST} (anterior: v${CURRENT})"

# Obtener release notes de GitHub
NOTES=$(curl -s "https://api.github.com/repos/anthropics/claude-code/releases/tags/v${LATEST}" | \
    grep -o '"body":"[^"]*"' | head -1 | cut -d'"' -f4 | \
    sed 's/\\r\\n/\n/g' | sed 's/\\n/\n/g' | head -30)

if [ -z "$NOTES" ]; then
    NOTES="No se encontraron notas de release. Revisa GitHub manualmente."
fi

# Extraer solo los bullet points principales (primeras 15 líneas con •)
HIGHLIGHTS=$(echo "$NOTES" | grep "•" | head -15 | sed 's/^[[:space:]]*//')

if [ -z "$HIGHLIGHTS" ]; then
    HIGHLIGHTS="$NOTES"
fi

# Enviar notificación a Telegram
MESSAGE="🚀 <b>Nueva versión de Claude Code</b>

<b>v${LATEST}</b> (anterior: v${CURRENT})

<b>Cambios destacados:</b>
${HIGHLIGHTS}

📋 <b>Pendiente:</b>
• Actualizar changelog.html
• Actualizar banner en index.html
• Actualizar .claude-code-version

🔗 <a href=\"https://github.com/anthropics/claude-code/releases/tag/v${LATEST}\">Ver release completa</a>
🔗 <a href=\"https://www.claudecodecurso.com/changelog.html\">Tu changelog</a>"

send_telegram "$MESSAGE"

# Actualizar versión guardada
echo "$LATEST" > "$VERSION_FILE"

log "NOTIFICADO: Telegram enviado para v${LATEST}"
