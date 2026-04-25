# Guion del Loom — "Mi setup completo de Claude Code"

> Vídeo bonus que reciben SOLO los leads que dejaron WhatsApp en la suscripción.
> Duración objetivo: **12 minutos**.
> Tono: cercano, sin guion plástico, como si le enseñaras a un colega que viene a tu casa.

---

## Antes de grabar — checklist

- [ ] Cierra Slack, mail, notificaciones del sistema
- [ ] Activa modo "no molestar" del Mac
- [ ] Abre **un solo proyecto real** (uno tuyo, no algo de mentira) — recomendación: `landing-curso-claude-code` o similar
- [ ] Ten preparado el `CLAUDE.md`, los slash commands y los hooks YA configurados en ese proyecto
- [ ] Limpia el historial de la terminal: `clear && history -c`
- [ ] Pestaña del navegador abierta SOLO en LinkedIn tu perfil (por si quieres mostrarlo)
- [ ] Camera + micro: prueba 30 segundos, escucha el audio
- [ ] Hidratado, frase de bienvenida ensayada UNA vez

---

## Estructura — 12 minutos

### 🎬 Intro (0:00 — 0:45) · 45s

**Pantalla**: tu cara grande, sin pantalla compartida.

**Lo que dices** (no leas, di con tus palabras):

> "Hola, soy José, y te doy la bienvenida a este vídeo extra que recibes
> por haber dejado tu WhatsApp.
>
> Te lo prometí en el email y aquí está. En los próximos 12 minutos te
> voy a enseñar mi setup completo de Claude Code, el que uso cada día
> en proyectos reales de clientes.
>
> No es teoría. Es lo que tengo abierto ahora mismo en mi máquina.
>
> Vamos a verlo todo de un tirón: cómo está estructurado el archivo
> CLAUDE.md, los tres slash commands que me ahorran tiempo, los hooks
> que me protegen de cagadas, y el flujo concreto que sigo desde que
> abro el editor hasta que hago commit.
>
> Vamos."

**Tip**: corta cualquier "eeehh" en edición. Mejor pausa que muletilla.

---

### 🏗️ Bloque 1 — El CLAUDE.md (0:45 — 3:00) · 2:15

**Pantalla**: terminal + editor con el archivo `CLAUDE.md` abierto.

**Lo que muestras**:

1. Abre el `CLAUDE.md` del proyecto
2. Scroll lento por las secciones
3. Resalta: **Stack**, **Cómo trabajar**, **Convenciones**, **Lo que NUNCA debes hacer**

**Lo que dices** (puntos clave, no literal):

- "Esto eh lo primero que Claude lee cada vez que abre el proyecto"
- "Fíjate que está por debajo de 80 líneas — eh la regla de oro"
- "Cada sección tiene una razón. Voy a ir rápido pero quédate con esto:"
  - WHAT (qué es) → contexto del proyecto en 1 frase
  - HOW (cómo trabajar) → comandos concretos
  - Convenciones → solo las que ahorran correcciones repetidas
  - NUNCA hagas → reglas duras de cosas que te han mordido antes
- "La última línea, la de auto-mejora — esto eh oro puro. Le digo a Claude
  que actualice el archivo cuando le corrija dos veces. Magia."

**Detalle a mostrar en pantalla**: el comentario `<!-- ... -->` que explica
cada sección. Mostrar que cuando lo borras queda limpio para producción.

---

### ⚡ Bloque 2 — Los 3 slash commands (3:00 — 6:00) · 3:00

**Pantalla**: editor con la carpeta `.claude/commands/` abierta.

**Lo que muestras y dices**:

#### `/review` (3:00 — 4:00)

- Abre `.claude/commands/review.md`
- Muestra la estructura: frontmatter + paso 1 / paso 2 / paso 3
- Resalta `allowed-tools` — "esto limita qué puede hacer el comando"
- **DEMO en vivo**:
  - Toca un archivo a propósito (mete una `console.log` con una API key fake)
  - `git add .`
  - En Claude: `/review`
  - Muestra cómo lo pilla y veta el commit

#### `/test` (4:00 — 5:00)

- Abre `.claude/commands/test.md`
- Punto clave: "Lee tests existentes ANTES de escribir, para captar el patrón"
- **DEMO en vivo**:
  - Modifica una función simple (suma + edge case)
  - `/test`
  - Muestra cómo genera el test siguiendo el estilo del repo

#### `/commit` (5:00 — 6:00)

- Abre `.claude/commands/commit.md`
- Punto clave: "Mira `git log --oneline -10` para detectar el idioma del repo"
- **DEMO en vivo**:
  - `git add .`
  - `/commit`
  - Muestra cómo genera el mensaje en convencional, te lo enseña ANTES, y al
    confirmar hace el commit

**Frase clave para cerrar el bloque**:
> "Estos tres comandos juntos me ahorran fácil 1 hora al día. No exagero."

---

### 🪝 Bloque 3 — Los hooks (6:00 — 9:00) · 3:00

**Pantalla**: editor con `.claude/settings.json` abierto.

**Lo que muestras y dices**:

#### Settings.json (6:00 — 6:30)

- Muestra el archivo entero
- Explica la estructura: `hooks > EventName > matcher > command`
- "Tres eventos: PreToolUse para bloquear, PostToolUse para automatizar,
  Stop para resumir"

#### Hook 1 — block-secrets-on-commit (6:30 — 7:30)

- Abre `.claude/hooks/block-secrets-on-commit.sh`
- Muestra los patrones que detecta (AWS, OpenAI, Anthropic, GitHub)
- **DEMO en vivo**:
  - Crea un archivo `test.js` con `const KEY = "sk-ant-fakekey1234..."`
  - `git add . && git commit -m "test"`
  - Muestra cómo el hook lo bloquea con mensaje claro

#### Hook 2 — auto-format (7:30 — 8:15)

- Abre `.claude/hooks/auto-format.sh`
- "Detecta la extensión y ejecuta el formateador correspondiente"
- **DEMO en vivo**:
  - Pídele a Claude que toque un archivo `.ts` con formato feo
  - Muestra cómo al guardar queda formateado solo
- Frase clave: "Nunca mandes a Claude a hacer trabajo de un linter. Lento,
  caro, poco fiable."

#### Hook 3 — session-summary (8:15 — 9:00)

- Abre `.claude/hooks/session-summary.sh`
- "Async, no bloquea el cierre. Crea un md con el estado al cerrar"
- Muestra ejemplos reales en `.claude/sessions/` (deja 2-3 sesiones de muestra)
- Mencionar el bloque de Telegram comentado: "si quieres notificación, lo
  descomentas y pones tu bot token"

---

### 🔄 Bloque 4 — Mi flujo del día a día (9:00 — 11:00) · 2:00

**Pantalla**: terminal y editor en split.

**Demuestra UN ciclo completo, sin cortes**:

1. (9:00) Abrir Claude Code en el proyecto → carga CLAUDE.md
2. (9:15) "Pídele algo de ejemplo" — algo realista, ej: "añade endpoint
   /health a la API"
3. (9:45) Mientras Claude trabaja, los hooks se disparan automáticamente
   (formato al guardar, etc.)
4. (10:15) Cuando termina: `/test` para generar tests del cambio
5. (10:30) `/review` para auditar antes de commitear
6. (10:45) Si todo OK: `/commit`
7. (11:00) Resumen: "ese flujo entero acaba de hacer en 2 minutos lo que
   antes me llevaba 20"

**Frase clave**:
> "El truco no es uno solo. Es la combinación. CLAUDE.md le da contexto.
> Los slash commands me dan velocidad. Los hooks me dan seguridad. Las
> tres capas juntas son las que hacen la magia."

---

### 🎯 Cierre y CTA (11:00 — 12:00) · 1:00

**Pantalla**: tu cara grande de nuevo.

**Lo que dices**:

> "Si has llegado hasta aquí, ya estás por encima del 95% de la gente que
> usa Claude Code.
>
> Tres cosas antes de cerrar:
>
> Una. Todo lo que has visto está en los emails que te he ido mandando.
> Si te perdiste alguno, búscalos.
>
> Dos. En unos días te paso el siguiente recurso — la configuración avanzada
> de hooks con MCPs personalizados. Eso ya es nivel siguiente.
>
> Tres. Si esto te eh aportao, hazme un favor: respóndeme al email y
> cuéntame qué proyecto estás montando con Claude Code. Lo leo todo y
> me ayuda a saber qué meter en el curso completo.
>
> Y si quieres ir viendo cosas mientras tanto, en LinkedIn comparto trucos
> cada semana. Te dejo el enlace en el email.
>
> Nos vemos pronto. Un saludo, José."

---

## Después de grabar — checklist

- [ ] Revisa el audio (sin saturación, sin cortes)
- [ ] Recorta los silencios largos al inicio/final
- [ ] Elimina los "eeehh" más obvios (Loom permite trim básico)
- [ ] Pon **título descriptivo**: "Mi setup de Claude Code (vídeo bonus)"
- [ ] **Configura como UNLISTED** (link privado, no buscable)
- [ ] Copia el link y pruébalo en incógnito
- [ ] Manda el link a UN amigo de prueba antes de meterlo en el email

---

## Errores típicos a evitar

❌ **No grabes en vacío** — abre proyecto real, datos reales (anonimizados
si hace falta). Suena MUCHO más auténtico.

❌ **No leas literalmente este guion** — son puntos para que no te quedes
en blanco. Habla con tus palabras.

❌ **No expliques cada línea de código** — la gente no quiere ver linea
por linea. Quiere ver EL FLUJO completo.

❌ **No te disculpes** ("perdón por el ruido", "hoy no estoy fino"). Si la
toma sale mal, vuelve a grabar.

❌ **No cierres sin CTA claro** — si no le pides que te responda al email
o que vea LinkedIn, se va a olvidar.

❌ **No pases de 13 minutos** — la atención cae después de 12. Si te alargas,
corta secciones, no extiendas.

---

## Tips de Loom específicos

- Activa **cámara + pantalla** (la cámara en circle, esquina inferior derecha)
- Velocidad de habla: media-rápida. La gente puede acelerar a 1.5x si quiere.
- Si te trabas, di "déjame que vuelva a explicar esto" y sigue. En edición lo cortas.
- **NO pongas música de fondo** — Loom no es para entretenimiento, es para
  enseñar. La música distrae.

---

## Si quieres referencias de tono

Mira estos dos creadores que hacen vídeos técnicos como deberías hacerlo tú:

- **Theo Browne** (t3.gg) — directo, sin pajita, demos reales
- **Fireship** (estilo más rápido, pero misma filosofía)

Tu tono debe ser un mix: la calidez tuya de cuando explicas a un colega +
la precisión técnica de los buenos divulgadores.

---

Un saludo,
José
