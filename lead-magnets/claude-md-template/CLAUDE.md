# CLAUDE.md

<!--
  Este es el archivo que Claude Code lee al empezar cada sesión.
  REGLAS CLAVE:
  - Máximo 80 líneas. Más allá, Claude ignora partes.
  - Solo lo que cambia el comportamiento. Si Claude ya lo sabe, no lo escribas.
  - Específico > genérico. "Usa Prisma para queries" > "escribe buen SQL".
  - Tres dimensiones: QUÉ es, POR QUÉ existe, CÓMO trabajar.

  Borra estos comentarios HTML antes de guardar.
-->

## Qué es este proyecto

<!-- 1-2 frases. Si no lo puedes explicar en 30 segundos, hay un problema. -->

[Nombre del proyecto] es una [tipo: API REST / app móvil / SaaS / dashboard interno]
para [problema que resuelve / usuario objetivo]. [Restricción técnica importante si la hay].

## Stack

<!-- Solo lo que afecta a las decisiones de Claude. NO listes todo el package.json. -->

- Runtime: [Bun 1.x / Node 22 / Python 3.12]
- Framework: [Next.js 15 App Router / FastAPI / Hono]
- Base de datos: [PostgreSQL via Prisma / Supabase]
- Tests: [Vitest / pytest / Playwright]
- Despliegue: [Vercel / Cloudflare Pages / Fly.io]

## Cómo trabajar

<!-- Comandos concretos. Lo que Claude debería ejecutar antes de declarar algo terminado. -->

- Instalar: `bun install`
- Dev: `bun dev` (puerto 3000)
- Tests: `bun test` — corre antes de dar nada por terminado
- Typecheck: `bun typecheck`
- Lint y formato: los hooks lo hacen solos, no lo corras a mano

## Arquitectura — las piezas que cargan peso

<!-- Solo los directorios que Claude tiene que conocer. NO documentes todo el árbol. -->

- `src/app/` — rutas del App Router de Next.js
- `src/lib/db/` — cliente de Prisma + queries reutilizables
- `src/lib/auth/` — handlers de auth (no tocar salvo que se pida explícitamente)
- `agent_docs/` — documentación adicional que Claude puede leer cuando haga falta

## Convenciones que importan

<!-- Solo las que te ahorran correcciones repetidas. Si Claude las pillaría leyendo el código, sobran. -->

- DB: nunca escribas SQL crudo, usa el cliente de Prisma
- Errores: deja que suban hasta el route handler, no envuelvas en try/catch dentro de servicios
- Tests: comportamiento nuevo necesita test; refactor no
- Commits: conventional commits (`feat:`, `fix:`, `refactor:`, `chore:`)

## Lo que NUNCA debes hacer

<!-- Reglas duras. Cada una debería venir de un dolor real pasado. -->

- No añadas librerías sin preguntar — revisa antes `package.json`
- No desactives reglas del linter para que pase CI
- No commitees `.env` ni secretos (el pre-commit hook lo va a rechazar igual)
- No refactorices código adyacente mientras arreglas un bug

## Auto-mejora

<!-- Esta línea hace que CLAUDE.md evolucione contigo. Es magia pura. -->

Si te corrijo dos veces sobre lo mismo, actualiza este archivo con la regla.
Mejor que la próxima sesión ya lo sepas tú solo.

<!--
  ─────────────────────────────────────────────────────────
  CHECKLIST antes de guardar:
  □ Está por debajo de 80 líneas?
  □ Cada línea, si la borro, ¿hace que Claude la cague? Si no, fuera.
  □ He metido alguna regla genérica de estilo? → Bórrala, eso lo hace el linter.
  □ He repetido algo que está ya en el README del proyecto? → Borra una.
  □ He puesto secretos, paths absolutos, datos personales? → FUERA.
  ─────────────────────────────────────────────────────────
-->
