---
description: Genera tests para los cambios que has hecho, siguiendo las convenciones del repo.
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob, Edit, Write
---

# /test — Generar tests para los cambios actuales

Tu trabajo es generar tests para el código que el usuario acaba de cambiar. NO tests genéricos: tests que sigan las convenciones reales del proyecto.

## Paso 1: Detectar el framework de tests

Antes de escribir nada, averigua qué framework usa este proyecto:

1. Lee `package.json` o `pyproject.toml` para detectar: vitest, jest, playwright, pytest, etc.
2. Busca tests existentes con Glob: `**/*.test.*`, `**/*.spec.*`, `**/test_*.py`
3. Lee 2-3 tests existentes para ENTENDER el patrón:
   - ¿Cómo importan? ¿`describe/it` o `test()`?
   - ¿Usan mocks? ¿qué librería?
   - ¿Cómo nombran los archivos de test? (`foo.test.ts` vs `__tests__/foo.ts`)
   - ¿Hay helpers/fixtures compartidos que reutilizar?
   - ¿Usan AAA (Arrange-Act-Assert) o un patrón distinto?

**Si no encuentras ningún test existente**, pregunta al usuario qué framework usar antes de escribir nada.

## Paso 2: Identificar qué testar

Mira los cambios:
- `git diff --staged`
- `git diff` (cambios sin stage)

Para cada función/clase/componente nuevo o modificado, identifica:

- ¿Es **comportamiento nuevo**? → Necesita tests.
- ¿Es **refactor sin cambio de comportamiento**? → Tests existentes deberían cubrir, no añadas duplicados.
- ¿Es **bugfix**? → Test que reproduzca el bug + verifique el fix.
- ¿Es **typo, comentario, formato**? → No hace falta test.

## Paso 3: Escribir tests

Sigue ESTRICTAMENTE el patrón del proyecto. Reglas:

### SÍ haz

- Reutiliza helpers/fixtures existentes
- Usa el mismo estilo de naming que los otros tests
- Tests de comportamiento, no de implementación
- Casos edge: empty, null, undefined, errores
- Un test por comportamiento, no varios asserts mezclados

### NO hagas

- NO mockees lo que no haga falta. Si la función es pura, llámala directa.
- NO añadas tests "por completar coverage" que no testean nada útil
- NO escribas tests que repliquen la implementación (los rompes en cuanto refactores)
- NO uses snapshot testing salvo que el proyecto ya lo use
- NO inventes nombres de funciones o módulos — léelos del código real

## Paso 4: Verificar

Después de escribir los tests:

1. Ejecuta los tests del archivo afectado para confirmar que pasan
2. Si fallan, arréglalos antes de declarar terminado
3. Reporta al usuario:
   - Qué archivos de test creaste/modificaste
   - Qué cubren (lista corta)
   - Resultado de la ejecución (pass/fail)

## Reglas finales

- Si no estás seguro de un patrón, lee MÁS tests existentes antes de inventar
- Si hay convenciones contradictorias, ve con la más reciente
- Si el código está mal estructurado para testear, AVISA al usuario y propón refactor — no fuerces tests sobre código no testeable
