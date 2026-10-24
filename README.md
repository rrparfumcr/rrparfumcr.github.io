# RR Parfum — Edición Editorial

Sitio web responsive en HTML, CSS y JavaScript con estética editorial de lujo, catálogo consultable, filtros, búsqueda, fichas detalladas, carrito de compras y pedidos por WhatsApp.

## Archivos
- `index.html`: estructura de la página.
- `styles.css`: diseño, responsive y animaciones.
- `app.js`: filtros, búsqueda, modales de producto y carrito, persistencia del carrito y pedidos por WhatsApp.
- `products.json`: catálogo editable de productos.

## Importante antes de publicar
1. Abrí `app.js` y configurá `whatsappNumber` con el número comercial en formato internacional, solo dígitos (Costa Rica: `506` + número). Configurá `instagramUrl` con el enlace real del perfil.
2. El botón para agregar al carrito está en cada ficha de perfume. El carrito se conserva en el navegador, muestra la imagen y permite abrir la ficha completa o eliminar productos. Para realizar el pedido, solicita nombre completo, cédula, correo y teléfono. Cédula y teléfono solo aceptan dígitos; el teléfono valida 8 dígitos del formato nacional de Costa Rica. También permite indicar entrega normal, entrega solicitada dentro del GAM con dirección y punto en mapa, o envío de Correos de Costa Rica con provincia, cantón, distrito, código postal y señas. La elección entre Uber Flash y entrega personal se coordina con RR Parfum. Si se intenta elegir ambos métodos especiales, aparece una alerta y hay que cambiar el método actual a «No» antes de seleccionar el otro. La ubicación del GAM se valida comparando los campos administrativos de cantón/municipio/distrito-ciudad que devuelve OpenStreetMap/Nominatim con una lista de cantones reconocidos del GAM; no sustituye la confirmación final de cobertura del servicio de entrega. El pedido y los detalles de entrega se envían a WhatsApp para que el cliente lo revise y lo envíe.
3. La búsqueda y los mapas de entrega usan Leaflet, OpenStreetMap y el servicio de búsqueda Nominatim, por lo que requieren conexión a internet. La ubicación y los datos de contacto/dirección que el cliente incluya en el pedido se compartirán en el mensaje de WhatsApp.
4. Las entradas originales del catálogo se conservan. La base anterior solo traía tres categorías principales (`Diseñador`, `Árabe`, `Body`) y no identificaba de forma consistente la concentración/versión en campos separados; el sitio permite buscar por esos datos si se agregan, pero no inventa versiones. Los duplicados de nombre se conservan intencionalmente hasta verificar si son variantes reales.
5. Varias entradas del catálogo anterior usan imágenes genéricas repetidas. La web mantiene las imágenes disponibles y una imagen de respaldo; las fotos de portada y colecciones son fotografías editoriales de referencia, no garantizan que representen el frasco exacto de cada producto. Para imágenes exactas hay que asociar cada variante con su fotografía verificada.
6. El catálogo se carga con `fetch`, por lo que no conviene abrir `index.html` directamente con doble clic. Probalo con Live Server en VS Code o publicalo en GitHub Pages.

## Publicación en GitHub Pages
Subí el contenido de esta carpeta a la raíz de un repositorio, entrá en **Settings → Pages**, elegí la rama principal y `/ (root)`, y guardá. Cuando termine el despliegue, usá la URL que GitHub Pages indique.


Nota: el catálogo también está integrado en products-data.js para que los productos aparezcan al abrir index.html directamente. Si abrís la página con doble clic, los cambios hechos solo en products.json no se verán: actualizá también products-data.js o usá Live Server para que la página cargue el JSON. En hosting, app.js puede seguir leyendo products.json.

### Fichas detalladas de perfumes
El modal muestra acordes principales como etiquetas de colores, junto con datos del perfume y composición. Para completar cada ficha, agregá al objeto correspondiente en `products.json` y en `products-data.js` los campos `acordesPrincipales` (lista de nombres), `segmento`, `concentracion` (también se acepta `concentración`), `persistencia`, `familia` y `notasSalida`, `notasCorazon`, `notasFondo` (listas de notas). Los acordes no dirigen a sitios externos. Los campos no disponibles se muestran como “Por consultar”; no se generan datos de fragancias automáticamente.

Para mostrar dos fotos en el modal, agregá al perfume el campo `imagenes` con una lista de dos URL, por ejemplo: `"imagenes": ["https://ejemplo.com/perfume-frente.jpg", "https://ejemplo.com/perfume-lado.jpg"]`. Si el campo no existe, se usa `imagen` como antes.


Actualización de catálogo: las tarjetas tienen espaciado, jerarquía tipográfica, estados hover/focus y adaptación móvil refinados. Como el archivo original repetía la misma fotografía genérica en los 600 productos, se asignan fotografías editoriales variadas para evitar que toda la cuadrícula se vea idéntica. Estas imágenes son ilustrativas y no garantizan representar el frasco exacto de cada referencia.
