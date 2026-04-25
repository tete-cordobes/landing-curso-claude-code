---
description: Revisa el código que acabas de tocar antes de hacer commit. Pilla seguridad, performance y errores típicos.
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep
---

# /review — Pre-commit code review

Tu trabajo es revisar el código que está a punto de commitearse y pillar problemas ANTES de que entren al repo.

## Paso 1: Recopilar contexto

Ejecuta estos comandos en paralelo y léelos:

- `git status --short` para ver qué archivos están modificados
- `git diff --staged` para ver los cambios staged
- `git diff` para ver los cambios sin stage (por si se le ha olvidado al usuario)

Si no hay cambios staged ni unstaged, dile al usuario que no hay nada que revisar y para.

## Paso 2: Revisar en este orden

Por cada archivo cambiado, busca problemas en este orden de criticidad:

### 🔴 Bloqueantes (no debe commitearse así)

1. **Secretos expuestos**: API keys, tokens, contraseñas, URLs con credenciales, archivos `.env`
2. **SQL injection**: queries construidas con concatenación de strings o template literals con input de usuario
3. **XSS**: `innerHTML`, `dangerouslySetInnerHTML`, `eval()` con input no sanitizado
4. **Path traversal**: paths construidos con input de usuario sin validación
5. **Console.log con datos sensibles** que se quedan en producción

### 🟡 Importantes (cuestiónalos)

1. **N+1 queries**: bucles que hacen queries dentro
2. **try/catch vacíos** o que solo hacen `console.log`
3. **Variables sin usar**, imports sin usar
4. **Hardcoded magic numbers/strings** que deberían ser constantes
5. **Funciones que han crecido demasiado** (>50 líneas suele ser señal)
6. **Tests que están skipeados** (`.skip`, `xit`, `xdescribe`)
7. **TODO/FIXME** sin issue de tracking asociado

### 🟢 Sugerencias (mencionar si las hay)

1. Mejoras de legibilidad obvias
2. Oportunidades de extraer una función reutilizable
3. Tipos demasiado permisivos (`any`, `unknown` sin razón clara)

## Paso 3: Reportar

Devuelve un reporte ESTRUCTURADO así:

```
## 🔴 Bloqueantes
[lista — si hay alguno, AVISA al usuario que no debe commitear hasta arreglarlos]

## 🟡 Importantes
[lista con archivo:línea]

## 🟢 Sugerencias
[lista breve]

## Veredicto
✅ LISTO PARA COMMIT  |  ⚠️ ARREGLA ANTES  |  🛑 NO COMMITEES
```

## Reglas

- Si encuentras un bloqueante, NO sugieras commitear. Para y avisa.
- Si todo es verde, NO inventes problemas. Di que está limpio y se puede commitear.
- Sé conciso. Cada hallazgo en 1-2 líneas máximo, con `archivo:línea`.
- NO escribas el commit por el usuario. Solo revisa.
