# Lead Magnets — Curso Claude Code

Recursos que se entregan en la secuencia de email drip de la landing.
Cada subdirectorio corresponde a un email concreto de la secuencia.

## Mapa de entrega

| Email | Día | Lead magnet | Folder |
|-------|-----|-------------|--------|
| 1 | 0 (instant) | PDF "Los 10 Comandos Esenciales" | (en Google Drive del scenario actual) |
| 2 | +1 | Template `CLAUDE.md` + guía | [`claude-md-template/`](./claude-md-template/) |
| 3 | +3 | 3 slash commands (`/review`, `/test`, `/commit`) | [`slash-commands/`](./slash-commands/) |
| 3 (bonus) | +3 | Vídeo Loom 12 min — solo para leads con WhatsApp | [`loom-setup-script/`](./loom-setup-script/) |
| 4 | +5 | Pack de 5 hooks útiles | [`hooks/`](./hooks/) |
| 5 | +7 | (CTA al curso, sin recurso descargable) | — |

## URLs públicas para usar en los emails

Estos archivos son públicos en este repo. Para enlazarlos desde los emails,
usa la URL de GitHub directa o la versión "raw":

- **Browse-friendly** (developers ven el README primero):
  `https://github.com/tete-cordobes/landing-curso-claude-code/tree/main/lead-magnets/<folder>`

- **Raw** (descarga directa de un archivo concreto):
  `https://raw.githubusercontent.com/tete-cordobes/landing-curso-claude-code/main/lead-magnets/<folder>/<archivo>`

## Próximos pasos

- [ ] Grabar vídeo Loom siguiendo `loom-setup-script/GUION.md` y obtener URL
- [ ] (Opcional) Mover el repo de hooks a privado si quieres gatear por LinkedIn follow
- [ ] Convertir los 5 emails del drip a HTML email-compatible
- [ ] Montar la arquitectura Make (3 scenarios: welcome ampliado, drip diario, unsubscribe)
