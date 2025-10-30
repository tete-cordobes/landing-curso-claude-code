# Instrucciones para Generar Favicons

## Archivos Necesarios

Tu proyecto ya tiene `claude-color.png`. Necesitas generar:

1. **favicon.ico** (16x16, 32x32, 48x48 multi-size)
2. **apple-touch-icon.png** (180x180)

## Opción 1: Usar herramienta online (RECOMENDADO)

1. Ve a: https://realfavicongenerator.net/
2. Sube tu archivo `claude-color.png`
3. Configura las opciones (mantén los colores del tema: #3b82f6)
4. Descarga el paquete
5. Extrae los archivos en la raíz del proyecto

## Opción 2: Usar ImageMagick (línea de comandos)

Si tienes ImageMagick instalado:

```bash
# Crear favicon.ico multi-size
convert claude-color.png -define icon:auto-resize=16,32,48 favicon.ico

# Crear apple-touch-icon
convert claude-color.png -resize 180x180 apple-touch-icon.png
```

## Opción 3: Usar GIMP (gratis)

1. Abre `claude-color.png` en GIMP
2. Para favicon.ico:
   - Image → Scale Image → 32x32
   - File → Export As → favicon.ico
3. Para apple-touch-icon:
   - Image → Scale Image → 180x180
   - File → Export As → apple-touch-icon.png

## Verificación

Una vez generados, verifica que tengas:
- ✅ favicon.ico (en raíz)
- ✅ apple-touch-icon.png (en raíz)
- ✅ manifest.json (ya creado)
- ✅ claude-color.png (ya existe)

Los archivos HTML ya están actualizados para referenciar estos favicons.
