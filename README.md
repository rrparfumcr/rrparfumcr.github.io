# RR Parfum — Edición Editorial

Sitio web responsive en HTML, CSS y JavaScript con estética editorial de lujo, catálogo consultable, filtros, búsqueda, fichas detalladas y enlaces de consulta por WhatsApp.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: diseño, responsive y animaciones.
- `app.js`: filtros, búsqueda, modal de producto y enlaces comerciales.
- `products.json`: catálogo editable de productos.

## Importante antes de publicar
1. Abrí `app.js` y configurá `whatsappNumber` con el número comercial en formato internacional, solo dígitos (Costa Rica: `506` + número). Configurá `instagramUrl` con el enlace real del perfil.
2. Las entradas originales del catálogo se conservan. La base anterior solo traía tres categorías principales (`Diseñador`, `Árabe`, `Body`) y no identificaba de forma consistente la concentración/versión en campos separados; el sitio permite buscar por esos datos si se agregan, pero no inventa versiones. Los duplicados de nombre se conservan intencionalmente hasta verificar si son variantes reales.
3. Varias entradas del catálogo anterior usan imágenes genéricas repetidas. La web mantiene las imágenes disponibles y una imagen de respaldo; las fotos de portada y colecciones son fotografías editoriales de referencia, no garantizan que representen el frasco exacto de cada producto. Para imágenes exactas hay que asociar cada variante con su fotografía verificada.
4. El catálogo se carga con `fetch`, por lo que no conviene abrir `index.html` directamente con doble clic. Probalo con Live Server en VS Code o publicalo en GitHub Pages.

## Publicación en GitHub Pages
Subí el contenido de esta carpeta a la raíz de un repositorio, entrá en **Settings → Pages**, elegí la rama principal y `/ (root)`, y guardá. Cuando termine el despliegue, usá la URL que GitHub Pages indique.


Nota: el catálogo también está integrado en products-data.js para que los productos aparezcan al abrir index.html directamente. Si abrís la página con doble clic, los cambios hechos solo en products.json no se verán: actualizá también products-data.js o usá Live Server para que la página cargue el JSON. En hosting, app.js puede seguir leyendo products.json.

### Fichas detalladas de perfumes
El modal muestra acordes principales como etiquetas de colores, junto con datos del perfume y composición. Para completar cada ficha, agregá al objeto correspondiente en `products.json` y en `products-data.js` los campos `acordesPrincipales` (lista de nombres), `segmento`, `concentracion` (también se acepta `concentración`), `persistencia`, `familia` y `notasSalida`, `notasCorazon`, `notasFondo` (listas de notas). Los acordes no dirigen a sitios externos. Los campos no disponibles se muestran como “Por consultar”; no se generan datos de fragancias automáticamente.

Para mostrar dos fotos en el modal, agregá al perfume el campo `imagenes` con una lista de dos URL, por ejemplo: `"imagenes": ["https://ejemplo.com/perfume-frente.jpg", "https://ejemplo.com/perfume-lado.jpg"]`. Si el campo no existe, se usa `imagen` como antes.


Actualización de catálogo: las tarjetas tienen espaciado, jerarquía tipográfica, estados hover/focus y adaptación móvil refinados. Como el archivo original repetía la misma fotografía genérica en los 600 productos, se asignan fotografías editoriales variadas para evitar que toda la cuadrícula se vea idéntica. Estas imágenes son ilustrativas y no garantizan representar el frasco exacto de cada referencia.
