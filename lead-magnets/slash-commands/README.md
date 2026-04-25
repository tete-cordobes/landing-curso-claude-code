# Mis 3 slash commands para Claude Code

Estos son los 3 comandos custom que tengo configurados en TODOS mis proyectos.
Me ahorran fácil 1 hora al día.

No son comandos genéricos. Cada uno está pensado para un momento concreto del
flujo de trabajo donde la gente pierde tiempo o comete errores.

---

## Qué incluye este paquete

```
.claude/commands/
├── review.md    → /review (pre-commit code review)
├── test.md      → /test (genera tests para los cambios actuales)
└── commit.md    → /commit (escribe el commit message en convencional)
```

Los tres son archivos Markdown con frontmatter. Claude Code los detecta
automáticamente cuando los pones en `.claude/commands/` de tu proyecto
(o `~/.claude/commands/` si los quieres globales).

---

## Cómo instalarlos

### Opción A: Por proyecto (recomendada)

```bash
# Desde la raíz de tu proyecto
mkdir -p .claude/commands

# Copia los 3 archivos .md a esa carpeta
# (descárgalos del repo o cópialos manualmente)

# Verifica
ls .claude/commands/
# review.md  test.md  commit.md
```

Cuando abras Claude Code en ese proyecto, escribe `/review` y autocompletará.

### Opción B: Globales (para todos tus proyectos)

```bash
mkdir -p ~/.claude/commands
# Copia los 3 archivos .md ahí
```

Estarán disponibles en cualquier proyecto donde uses Claude Code.

---

## Qué hace cada uno

### `/review` — Pre-commit code review

**Cuándo lo uso**: justo antes de `git commit`.

**Qué hace**:
- Lee `git diff --staged` y `git diff`
- Busca problemas en orden de criticidad:
  - 🔴 **Bloqueantes**: secretos, SQL injection, XSS, path traversal
  - 🟡 **Importantes**: N+1 queries, try/catch vacíos, magic numbers
  - 🟢 **Sugerencias**: legibilidad, tipos demasiado permisivos
- Devuelve un veredicto claro: ✅ LISTO / ⚠️ ARREGLA / 🛑 NO COMMITEES

**Por qué importa**: el 80% de los bugs que llegan a producción los habrías
pillado leyendo tu propio diff con cabeza. Pero no lo haces porque tienes
prisa. Esto te lo automatiza.

### `/test` — Generar tests para los cambios

**Cuándo lo uso**: después de implementar comportamiento nuevo, antes del review.

**Qué hace**:
- Detecta el framework de tests del proyecto (vitest, jest, pytest, etc.)
- Lee tests existentes para captar el patrón (importaciones, naming, mocks)
- Identifica qué cambios necesitan tests (comportamiento nuevo sí, refactor no)
- Escribe tests que SIGUEN las convenciones del repo, no genéricos
- Ejecuta los tests y reporta el resultado

**Por qué importa**: la gente no escribe tests porque "es un coñazo". Con
este comando, escribirlos cuesta 30 segundos. Y los tests siguen el patrón
real del proyecto, no el que Claude se inventaría sin contexto.

### `/commit` — Conventional commits sin pensar

**Cuándo lo uso**: al final, cuando ya pasé el `/review` y todo está limpio.

**Qué hace**:
- Lee el diff staged
- Mira `git log --oneline -10` para detectar el estilo del repo (idioma,
  scope, formato)
- Clasifica el cambio (feat, fix, refactor, chore, docs, test, etc.)
- Escribe un mensaje en formato Conventional Commits
- Te lo enseña ANTES de commitear (puedes ajustarlo)
- Hace el commit

**Por qué importa**: pensar el mensaje de commit te roba 30 segundos cada
vez. Por commit. Multiplica por 10 commits al día por 5 días a la semana.
Eso son 25 minutos a la semana en algo que se puede automatizar bien.

---

## Cómo está construido cada comando

Los 3 comparten estructura. Mira la cabecera de uno:

```markdown
---
description: Revisa el código que acabas de tocar antes de hacer commit.
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep
---

# /review — Pre-commit code review

[instrucciones para Claude...]
```

Las claves:

- **`description`**: lo que ves en el autocompletado de `/`. Sé específico.
- **`allowed-tools`**: limita las tools que el comando puede usar. Más seguro
  y más rápido. `/review` no necesita poder editar archivos, solo leerlos.
- **Cuerpo**: las instrucciones para Claude. Cuanto más específicas, mejor
  el resultado. Listas paso a paso > párrafos.

---

## Reglas para escribir tus propios slash commands

Si te animas a crear los tuyos, sigue estas reglas:

### 1. Un comando, un trabajo

`/review` solo revisa. NO commitea por ti. NO escribe tests.
Cuando un comando hace 5 cosas, hace mal todas.

### 2. Limita tools con `allowed-tools`

Si tu comando solo lee, NO le des Edit. Si solo necesita git, NO le des
Bash genérico. Es más rápido, más predecible, y más seguro.

### 3. Estructura por pasos numerados

Claude sigue mejor "Paso 1, Paso 2, Paso 3" que un párrafo continuo.
Verás cómo respeta el orden cuando lo escribes así.

### 4. Reglas claras al final

Cierra siempre con un bloque de "NUNCA hagas X" / "Reglas finales".
Es ahí donde se va a evitar las cagadas más típicas.

### 5. Idempotencia

Un comando bien escrito puede ejecutarse 5 veces seguidas sin romper nada.
Si el tuyo deja estado raro a la mitad, repiénsalo.

---

## Errores típicos que veo

❌ **Slash commands gigantes** que intentan hacer todo el flujo. Mejor
3 comandos pequeños encadenables.

❌ **Sin `allowed-tools`** definido. Le estás dando a Claude permiso para
todo. Innecesario y arriesgado.

❌ **Instrucciones vagas** tipo "haz un buen commit". Claude no es telépata.
Sé específico: idioma, formato, qué incluir, qué no.

❌ **Comandos que asumen contexto** que solo tú tienes en la cabeza. El
comando debe funcionar para cualquiera del equipo, no solo para ti.

---

## Si quieres más

En el [curso completo de Claude Code](https://claudecodecurso.com) profundizamos
en:

- Slash commands con argumentos dinámicos (`/deploy {{env}}`)
- Comandos que llaman a otros comandos (composición)
- Comandos por componente en monorepos
- Integración con MCPs personalizados desde dentro de un comando
- Casos reales: comandos para review de PRs, deploys, debugging

Y por LinkedIn voy soltando trucos sueltos cada semana:
[linkedin.com/in/jose-gilarte-alvarez](https://www.linkedin.com/in/jose-gilarte-alvarez/)

---

Un saludo,
José
