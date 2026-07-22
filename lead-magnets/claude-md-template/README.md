# Mi template de CLAUDE.md (el que uso de verdad)

Este es el archivo que dejo en cada proyecto donde uso Claude Code.

No es genérico. Está pensado siguiendo las mejores prácticas que la comunidad
y el equipo de Anthropic han documentado durante 2026, y refinado con los
errores que he visto en proyectos reales.

---

## Por qué importa este archivo

Claude Code lee `CLAUDE.md` al empezar cada sesión. Es la diferencia entre:

**Sin CLAUDE.md** → Claude llega frío, te pide contexto cada vez, no sabe
qué librerías usas, escribe código que no encaja con tus convenciones.

**Con un buen CLAUDE.md** → Claude sabe el stack, las convenciones, qué
NO debe tocar, y cómo verificar su trabajo antes de declarar algo terminado.

La diferencia entre los dos es el 80% de lo que la gente atribuye a "Claude
Code es mejor en unos proyectos que en otros". Spoiler: no es Claude. Es
el contexto que le has dado.

---

## La regla que casi nadie aplica

> **Mantén el archivo por debajo de 80 líneas.**

Si pasas de ahí, Claude empieza a ignorar partes. Está documentado, no me
lo invento.

¿Por qué? Porque los modelos frontier pueden seguir ~150-200 instrucciones
con consistencia, y el system prompt de Claude Code ya gasta unas 50.
Cada línea de tu CLAUDE.md compite por la atención del modelo.

**La pregunta para cada línea**: si la borro, ¿hace que Claude la cague?
Si la respuesta es no, fuera.

---

## Las 3 dimensiones que tiene que cubrir

Cualquier CLAUDE.md decente responde a tres preguntas:

| Dimensión | Pregunta | Ejemplo |
|-----------|----------|---------|
| **WHAT** | ¿Qué es este proyecto? | "API REST para gestionar reservas de un SaaS de citas médicas" |
| **WHY** | ¿Para qué existe cada parte? | "src/lib/auth/ usa OAuth porque el cliente lo requiere por compliance" |
| **HOW** | ¿Cómo se trabaja aquí? | "bun test antes de cerrar, los hooks corren el linter solos" |

Si cualquiera de las tres falta, tu CLAUDE.md está cojo.

---

## Lo que NO debe ir nunca

Esto es donde la gente la caga. Errores típicos que veo en CLAUDE.md
ajenos:

❌ **Reglas de estilo de código**
"Usa 2 espacios de indentación" — eso es trabajo del linter, no del LLM.
Mandar a Claude a hacer trabajo de Prettier es lento, caro y poco fiable.

❌ **Listar todo el árbol de directorios**
Claude lo ve solo. Solo documenta lo que carga peso o lo que NO debe tocar.

❌ **Repetir el README**
Si ya está en el README, no lo dupliques. Referéncialo: "ver README para setup".

❌ **Instrucciones genéricas tipo "escribe código limpio"**
Inútil. Claude ya intenta hacerlo. Sé específico: "errores no se capturan
en servicios, suben al handler".

❌ **Auto-generar el CLAUDE.md con IA**
Sale plástico, redundante y largo. El template debe estar curado a mano,
porque afecta a CADA sesión.

❌ **Secretos, paths absolutos, datos personales**
Esto se commitea al repo. No metas claves, tokens, ni rutas locales.

---

## Lo que SÍ debe ir

✅ **Comandos concretos**: `bun install`, `bun test`, `bun typecheck`.
   Claude los ejecuta antes de cerrar tareas.

✅ **Convenciones que ahorran correcciones repetidas**: si te has visto
   corrigiendo lo mismo dos veces, escríbelo.

✅ **Reglas duras del estilo "no toques esto"**: archivos sensibles,
   migraciones que ya están en producción, integraciones de terceros.

✅ **Cómo verificar que algo está terminado**: tests que pasan, typecheck
   limpio, lint sin warnings.

✅ **La línea de auto-mejora** (al final del template): le dice a Claude
   que actualice el archivo cuando le corrijas algo dos veces. Es magia.

---

## La jerarquía de tres niveles

Claude Code lee CLAUDE.md de tres ubicaciones, y las combina:

```
~/.claude/CLAUDE.md          ← global (tus preferencias personales)
.claude/CLAUDE.md            ← proyecto (compartido en git con tu equipo)
./CLAUDE.local.md            ← local (overrides personales, gitignoreado)
```

**Recomendación**:
- Pon en el **global** cómo te gusta que te hablen, qué herramientas prefieres
- Pon en el **proyecto** las convenciones del equipo y la arquitectura
- Usa el **local** para experimentos y overrides personales

---

## Cómo usar este template

1. Copia el archivo `CLAUDE.md` que está en esta misma carpeta
2. Pégalo en la raíz de tu proyecto (o en `.claude/CLAUDE.md` si quieres
   que sea team-shared)
3. Borra los comentarios HTML (`<!-- ... -->`)
4. Rellena cada sección con info real de TU proyecto
5. Aplica la checklist final del archivo antes de guardar

---

## Progressive disclosure (avanzado)

Si tu proyecto es grande y hay docs que solo importan a veces, usa este
patrón en vez de meter todo en CLAUDE.md:

```
proyecto/
├── CLAUDE.md                       ← <80 líneas, lo esencial
└── agent_docs/
    ├── architecture-deep-dive.md   ← cómo está montado todo (largo)
    ├── deployment.md               ← guía de despliegue
    ├── troubleshooting.md          ← bugs conocidos
    └── api-conventions.md          ← convenciones de la API
```

Y en CLAUDE.md, solo referencias:

```markdown
## Documentación adicional
- agent_docs/architecture-deep-dive.md — léelo si tocas servicios cross-domain
- agent_docs/deployment.md — léelo si te pido desplegar
```

Claude solo carga esos archivos cuando los necesita. Eso es **progressive
disclosure**: contexto justo a tiempo, sin saturar la sesión.

---

## Hooks > reglas de estilo en CLAUDE.md

Si te ves tentado a escribir reglas de formato/lint en CLAUDE.md, para.

Mejor configura hooks. Un hook `post-edit` que corre `prettier` y `eslint`
después de cada edición es:

- Más rápido (es código, no LLM)
- Más barato (cero tokens)
- Más fiable (determinístico)

Hablo de hooks en detalle en uno de los próximos emails de la serie.

---

## Si necesitas más

Esto es solo el principio. En el [curso completo de Claude Code](https://ccodecurso.com)
cubrimos:

- CLAUDE.md por componentes en monorepos
- Configuración de hooks avanzados con MCPs personalizados
- Slash commands a medida
- Cómo dirigir agentes (no solo prompts)
- Casos reales de proyectos en producción

Y por LinkedIn voy soltando casos sueltos cada semana:
[linkedin.com/in/jose-gilarte-alvarez](https://www.linkedin.com/in/jose-gilarte-alvarez/)

---

## Fuentes en las que se basa este template

He cruzado estas referencias para que el template no sea opinión mía sola:

- [Best Practices for Claude Code — docs oficiales de Anthropic](https://code.claude.com/docs/en/best-practices)
- [Writing a good CLAUDE.md — HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)
- [CLAUDE.md Best Practices — UX Planet](https://uxplanet.org/claude-md-best-practices-1ef4f861ce7c)
- [claude-md-templates — Abhishek Ray](https://github.com/abhishekray07/claude-md-templates)
- [Project Memory Guide — Claude Code for PMs](https://ccforpms.com/fundamentals/project-memory)

Un saludo,
José
