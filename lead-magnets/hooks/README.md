# Hooks útiles para Claude Code

Estos son los hooks que tengo activos en mis proyectos para que Claude
trabaje seguro y rápido sin que yo tenga que vigilarle.

Un hook es código tuyo que se dispara automáticamente cuando Claude hace
algo: antes de ejecutar un comando peligroso, después de editar un archivo,
al cerrar una sesión.

**Es lo más infravalorado de Claude Code.** El que no usa hooks está
dejando productividad y seguridad encima de la mesa.

---

## Qué incluye este pack

```
.claude/
├── settings.json                       ← config de los hooks
└── hooks/
    ├── block-rm-rf.sh                  ← bloquea rm -rf fuera de /tmp/
    ├── block-secrets-on-commit.sh      ← bloquea commits con .env, claves, tokens
    ├── block-force-push-main.sh        ← bloquea force push a main/master
    ├── auto-format.sh                  ← prettier/ruff/gofmt automático
    └── session-summary.sh              ← resumen al cerrar sesión
```

5 hooks que cubren los 3 momentos críticos: **antes** de comandos peligrosos,
**después** de editar código, **al cerrar** la sesión.

---

## Cómo instalarlos

```bash
# 1. Copia la carpeta .claude/ entera a tu proyecto
cp -r .claude/ /ruta/a/tu/proyecto/

# 2. Marca los scripts como ejecutables
cd /ruta/a/tu/proyecto
chmod +x .claude/hooks/*.sh

# 3. Verifica que jq está instalado (los hooks lo usan para parsear JSON)
which jq || brew install jq    # macOS
which jq || apt install jq     # Linux

# 4. Abre Claude Code en el proyecto. Listo.
```

Si quieres los hooks GLOBALES (en todos tus proyectos), copia a `~/.claude/`
en vez de a `.claude/` del proyecto.

---

## Qué hace cada hook

### 🛑 `block-rm-rf.sh` — Bloquea borrados destructivos

**Disparador**: `PreToolUse` cuando Claude va a ejecutar `rm -rf`

**Qué hace**:
- Si el path apunta a `/tmp/` lo deja pasar (es trabajo limpio)
- En cualquier otro caso, bloquea con un mensaje claro

**Por qué importa**: una sola vez que Claude se confunda con `rm -rf .` en
tu home eh suficiente. Los hooks de bloqueo son tu última red de seguridad.

### 🔐 `block-secrets-on-commit.sh` — Bloquea commits con secretos

**Disparador**: `PreToolUse` cuando Claude va a ejecutar `git commit`

**Qué hace**:
- Detecta archivos sensibles staged: `.env`, `*.pem`, `*.key`, `secrets.json`,
  `credentials.json`, `service-account*.json`
- Detecta patrones de secretos en el diff: API keys de AWS (`AKIA...`),
  OpenAI (`sk-...`), Anthropic (`sk-ant-...`), GitHub (`ghp_...`), Slack (`xox...`)
- Si encuentra algo, BLOQUEA el commit y te dice qué arreglar

**Por qué importa**: una API key commiteada al repo eh comprometida en
cuestión de minutos. GitHub tiene scrapers buscando esto. Este hook eh
defensa en profundidad junto al `pre-commit` nativo.

### 🛑 `block-force-push-main.sh` — Bloquea force push a main

**Disparador**: `PreToolUse` cuando Claude va a ejecutar `git push --force`

**Qué hace**:
- Si el push apunta a `main` o `master` (explícito o implícito), bloquea
- En feature branches, lo permite

**Por qué importa**: force push a main reescribe historial público y
rompe el repo de tus compañeros. Eh casi siempre un error grave que
requiere intervención humana.

### ✨ `auto-format.sh` — Formatea automáticamente

**Disparador**: `PostToolUse` cuando Claude termina un `Edit` o `Write`

**Qué hace**:
- Detecta el tipo de archivo por extensión
- Ejecuta el formateador correspondiente:
  - `.ts/.tsx/.js/.jsx/.json/.css/.html/.md/.yml` → Prettier
  - `.py` → Ruff (o Black como fallback)
  - `.go` → gofmt
  - `.rs` → rustfmt
  - `.swift` → swift-format
- Si algo falla, lo loggea pero NO bloquea

**Por qué importa**: NUNCA mandes a Claude a hacer trabajo de un linter.
Es lento, caro y poco fiable. Que el código salga formateado solo es
**deterministic, gratis e instantáneo**. Filosofía clave: deja que la IA
piense, deja que las herramientas ejecuten.

### 📝 `session-summary.sh` — Resumen al cerrar sesión

**Disparador**: `Stop` event (cuando Claude termina la sesión, async)

**Qué hace**:
- Crea un archivo en `.claude/sessions/YYYY-MM-DD_HH-MM-SS.md`
- Incluye: rama actual, último commit, archivos modificados, untracked,
  estadísticas del diff
- Mantiene solo las últimas 30 sesiones (rotación automática)
- Tiene un bloque opcional para notificar a Telegram

**Por qué importa**: al día siguiente sabes exactamente dónde lo dejaste
sin tener que reabrir Claude y pedirle el contexto. También es oro para
revisar qué has hecho la última semana.

---

## La filosofía detrás de estos hooks

### 1. Bloqueos selectivos, no paranoia

Un hook que bloquea TODO eh inútil — terminas desactivándolo. Estos hooks
solo bloquean lo que **NUNCA** debería pasar (rm -rf en home, secretos
commiteados, force push a main). Lo demás lo dejan pasar.

### 2. Silencioso si todo va bien, ruidoso si falla

`auto-format.sh` no te llena el log si todo va bien. Solo grita si algo
peta. Un hook que escupe ruido en cada ejecución acaba ignorado.

### 3. Async cuando no hace falta esperar

`session-summary.sh` corre con `async: true` en `settings.json`. Claude
no espera a que termine para cerrar la sesión. Los hooks que tardan deben
ser asíncronos siempre que sea posible.

### 4. Defensa en profundidad

Estos hooks NO sustituyen a tus pre-commit hooks de git, ni a tu CI, ni
a tu code review. Los **complementan**. Es defense-in-depth: si una capa
falla, otra te cubre.

---

## Eventos disponibles (resumen rápido)

Claude Code 2026 expone muchos hook events. Estos son los más útiles:

| Evento | Cuándo se dispara | Uso típico |
|--------|-------------------|------------|
| `PreToolUse` | Antes de ejecutar una tool (Bash, Edit, Write...) | Bloqueo selectivo, validación |
| `PostToolUse` | Después de ejecutar una tool con éxito | Auto-format, lint, side-effects |
| `Stop` | Cuando la sesión termina | Resúmenes, notificaciones |
| `SessionStart` | Al abrir Claude Code | Cargar contexto inicial |
| `UserPromptSubmit` | Cada vez que el usuario manda un prompt | Validar entrada, expandir contexto |
| `PreCompact` | Antes de compactar el contexto | Salvar info crítica antes de perderla |

Hay más (FileChanged, TaskCreated, SubagentStop, etc.) — la docu oficial
los lista todos: [code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)

---

## Cómo escribir tus propios hooks

### Estructura básica

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm -rf *)",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/mi-script.sh",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

### Reglas para el script

1. **Lee el JSON de stdin**: `INPUT=$(cat)` y luego `jq` para extraer campos
2. **Exit 0** = éxito, sigue el flujo normal
3. **Exit 2** = bloqueo, stderr se le muestra a Claude
4. **Otros exit codes** = error no bloqueante, sigue pero loggea
5. **Timeout** generoso pero realista. Si tarda más, ponlo `async: true`

### Variables de entorno disponibles

- `$CLAUDE_PROJECT_DIR` — raíz del proyecto
- `$CLAUDE_CODE_REMOTE` — `"true"` si va por web, `unset` si es CLI

### Tipos de hook (no solo command)

- `command` → ejecuta un script (lo más común)
- `http` → llama a un endpoint HTTP con auth
- `mcp_tool` → invoca una tool de un MCP server
- `prompt` → ejecuta un prompt con un modelo concreto
- `agent` → lanza un sub-agent

---

## Errores típicos al escribir hooks

❌ **No marcar el script como ejecutable** (`chmod +x`)
   → Claude no podrá lanzarlo

❌ **Olvidar `set -euo pipefail`** al principio del script
   → Errores silenciosos que no debugeas hasta que rompen producción

❌ **Hacer hooks lentos sin marcar `async: true`**
   → Claude se queda colgado esperando 30 segundos

❌ **Bloquear con exit 2 sin un mensaje claro en stderr**
   → Tu yo de mañana no sabrá por qué se bloqueó

❌ **Hardcodear paths absolutos** en vez de `$CLAUDE_PROJECT_DIR`
   → Funciona en tu máquina, falla en la del compañero

❌ **No probar el hook a mano** antes de configurarlo
   → Ejecuta el script con un JSON de ejemplo en stdin antes de que
     Claude lo dispare en producción

---

## Dependencias

Estos hooks usan:

- **`jq`** (parsear JSON) — `brew install jq` o `apt install jq`
- **`git`** (los de git, obviamente)
- **`bash`** (no funcionan con sh puro por `set -euo pipefail` y arrays)

Los formateadores son opcionales y se detectan dinámicamente.

---

## Si quieres más

En el [curso completo de Claude Code](https://ccodecurso.com) profundizamos en:

- Hooks que llaman a MCPs personalizados (notificación a Linear, Slack, etc.)
- Hooks `PreCompact` para preservar contexto crítico antes de compactar
- Hooks de validación que llaman a sub-agents adversariales (judgment-day)
- Patrones avanzados: hooks que se auto-modifican según el contexto

Y por LinkedIn voy soltando trucos sueltos cada semana:
[linkedin.com/in/jose-gilarte-alvarez](https://www.linkedin.com/in/jose-gilarte-alvarez/)

---

Un saludo,
José
