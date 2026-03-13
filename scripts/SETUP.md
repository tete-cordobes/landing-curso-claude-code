# Claude Code Update Checker — Setup VPS

## 1. Crear Bot de Telegram

1. Abre Telegram y busca **@BotFather**
2. Envía `/newbot`
3. Ponle nombre (ej: "Claude Code Updates")
4. Copia el **token** que te da (formato: `123456789:ABCdef...`)

## 2. Obtener tu Chat ID

1. Busca **@userinfobot** en Telegram
2. Envíale `/start`
3. Te responde con tu **Chat ID** (número)

## 3. Configurar el script

Edita `check-claude-updates.sh` y pon tus datos:

```bash
TELEGRAM_BOT_TOKEN="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
TELEGRAM_CHAT_ID="987654321"
```

## 4. Subir a la VPS

```bash
scp check-claude-updates.sh tu-usuario@tu-vps:~/
ssh tu-usuario@tu-vps
chmod +x ~/check-claude-updates.sh
```

## 5. Probar

```bash
# Ejecutar manualmente
./check-claude-updates.sh

# Ver logs
cat ~/.claude-code-checker.log
```

## 6. Configurar cron (cada día a las 10:00)

```bash
crontab -e
```

Añade esta línea:

```
0 10 * * * /root/check-claude-updates.sh
```

O si quieres dos veces al día (10:00 y 18:00):

```
0 10,18 * * * /root/check-claude-updates.sh
```

## Dependencias

Solo necesita `curl` y `grep` — ya vienen en cualquier VPS Linux.

No necesita Node.js, npm, ni ninguna dependencia extra.
