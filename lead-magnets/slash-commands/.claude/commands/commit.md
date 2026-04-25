---
description: Genera el mensaje de commit en formato convencional según el diff staged. Cero pensar en cómo redactarlo.
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

# /commit — Commit con conventional commits

Tu trabajo es escribir un mensaje de commit en formato conventional commits a partir de lo que hay staged, y hacer el commit.

## Paso 1: Verificar estado

Ejecuta en paralelo:

- `git status --short` para ver qué hay staged y unstaged
- `git diff --staged` para leer los cambios staged
- `git log --oneline -10` para ver el estilo de commits recientes del repo

## Paso 2: Decidir si hay algo que commitear

- Si NO hay nada staged → para y dile al usuario que stagee algo primero (`git add ...`)
- Si hay cambios unstaged además de los staged → AVISA al usuario y pregúntale si quiere incluirlos antes de commitear
- Si los cambios staged incluyen archivos sensibles (`.env`, claves, secretos) → PARA y avisa, no commitees

## Paso 3: Analizar los cambios

Mira el diff staged y clasifica:

| Tipo | Cuándo usar |
|------|-------------|
| `feat` | Funcionalidad nueva visible para el usuario |
| `fix` | Bug fix |
| `refactor` | Cambio de código sin cambiar comportamiento |
| `chore` | Tareas de mantenimiento, dependencias, configuración |
| `docs` | Solo cambios en documentación |
| `test` | Solo añadir/modificar tests |
| `style` | Formato, espacios, comas — sin cambio de lógica |
| `perf` | Mejora de rendimiento |
| `build` | Cambios en build system, CI/CD |

Si hay varios tipos mezclados, usa el más significativo. Si están muy mezclados, sugiere al usuario partir el commit.

## Paso 4: Escribir el mensaje

Formato:

```
<tipo>(<scope opcional>): <resumen corto en imperativo>

<cuerpo opcional explicando el POR QUÉ, no el qué>

<footer opcional con BREAKING CHANGE: o referencias a issues>
```

Reglas:

- **Resumen**: máximo 70 caracteres, en imperativo ("añade", "corrige"), sin punto final
- **Cuerpo**: solo si el resumen no es suficiente. Explica POR QUÉ se hizo el cambio, no qué hace (eso ya está en el diff)
- **Scope**: opcional, úsalo cuando es claro qué módulo afecta (`feat(auth):`, `fix(checkout):`)
- **Idioma**: usa el mismo idioma que los commits recientes del repo (mira `git log --oneline -10`)

## Paso 5: Mostrar y commitear

ANTES de hacer commit, MUESTRA el mensaje al usuario y pregunta si está OK.

Si dice que sí:

```bash
git commit -m "tipo(scope): resumen

cuerpo si lo hay"
```

Usa heredoc si el mensaje tiene varias líneas:

```bash
git commit -m "$(cat <<'EOF'
feat(auth): añade login con Google OAuth

Reemplaza el login con email/password por OAuth porque el cliente
lo requiere para compliance de la nueva regulación.
EOF
)"
```

Después del commit, ejecuta `git status` para confirmar y muestra el resultado.

## NUNCA hagas

- NO añadas líneas de "Co-Authored-By", "Generated with", ni atribuciones de IA
- NO uses `--amend` salvo que el usuario lo pida explícitamente
- NO uses `--no-verify` (saltarse hooks) salvo petición explícita del usuario
- NO hagas push automático después del commit. El push lo decide el usuario.
