Generado automáticamente. No editar a mano.

Todo lo que hay en este directorio lo produce `scripts/build-blog.mjs` a partir
de `posts/*.json`, que es la única fuente de verdad. Cualquier cambio hecho aquí
se pierde en el siguiente build.

Para cambiar un artículo, edita su JSON en `posts/` (o usa `admin.html`) y el
workflow `build-blog` regenera esta carpeta, `posts/index.json` y `sitemap.xml`.
