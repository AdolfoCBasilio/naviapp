# NAVI Materiales y Acabados

App local en español de México: React, TypeScript, Vite y Tailwind CSS. No utiliza cuentas, pagos, base de datos ni servicios externos. El encabezado muestra el logo oficial de `public/images/logo.png` mediante `BrandLogo.tsx`: conserva el arte original y elimina su fondo oscuro con un filtro SVG al renderizarlo.

## Requisitos e instalación en Mac

Usa Node 24 y npm. Con nvm:

```sh
cd /Users/goconer/Desktop/NAVI/NAVIAPP
nvm install 24
nvm use
node -v
npm -v
npm install
npm run dev
```

Abre http://127.0.0.1:5173 en tu navegador. Para abrirlo desde otra terminal en Mac: `open http://127.0.0.1:5173`.

## Verificación

```sh
npm test
npm run build
```

La compilación queda en `dist/`. Las pruebas usan Vitest y React Testing Library e incluyen clics reales en el botón del cotizador, validación, suma de superficies, redondeo y precios sin confirmar.

## Editar el catálogo

Edita `src/catalog.ts`. Cada producto tiene identificador, nombre, presentación, categoría, descripción de uso, unidad comercial, plural y tipo de trabajo. `price` es opcional: omítelo cuando no esté confirmado para mostrar «Consulta precio» y «Total por confirmar». No uses cero como precio desconocido. `spot: true` activa la orientación para resanes o sellados puntuales. No se muestran existencias.

`thicknessYields` contiene exclusivamente los rendimientos de Adeblok Constructor de 40 kg proporcionados para esta v1: 3 mm → 9.4; 4 mm → 7.1; 5 mm → 5.7; 6 mm → 4.7; 7 mm → 4.0 m² por bulto. Se exige elegir el espesor. Para los demás productos se solicita el rendimiento confirmado de su ficha técnica según la aplicación y manos; la app no lo inventa ni lo guarda.

## Cómo funciona el estimado

La lógica independiente está en `src/calculate.ts`. Suma superficies directas o largo por alto/ancho, acepta coma y punto decimal y exige medidas positivas. Cantidad = redondeo hacia arriba de área / rendimiento por envase. Total = envases completos × precio unitario. No incluye merma. Los precios y la disponibilidad se confirman con la tienda.

Catálogo, medidas y estimado son vistas independientes. El catálogo conserva búsqueda, categoría y desplazamiento mientras la app permanece abierta. Cotizar desde una tarjeta selecciona el producto y abre las medidas sin volver a pedir el trabajo.

El resultado reemplaza el formulario y recibe el foco. Editar medidas recupera producto, superficies y espesor. Copiar cotización confirma el éxito al terminar la escritura en el portapapeles. Si el navegador bloquea el portapapeles, se presenta un resumen seleccionable. En resanes y sellados se solicita enviar foto y dimensiones a NAVI por el canal habitual; no se implementa envío porque no se proporcionó un contacto oficial y esta versión es local.


## Diseño y fotos

La referencia visual disponible está en `public/images/referencias:mockup-navi-ux.png`. Los números y las tres columnas del mockup no forman parte de la interfaz: son tres estados del recorrido.

La interfaz usa grafito, texto claro y verde lima `#B8F55E`, cuadrícula de dos columnas desde 320 px y cuatro en escritorio. El selector de categorías se abre con un botón y puede cerrarse con Escape; combina su filtro con la búsqueda. La barra móvil reserva espacio inferior y área segura.

Adeblok Constructor y Adeblok Plus usan las fotos de 40 kg: `adeblokconstructor40kg.png` y `ADEBLOKPLUS40kg.png`. Yeso y Blanco de España usan `yesodeaxochiapan.png` y `blancoespana.png`. Las fotos se muestran completas con `object-fit: contain`; `imageScale` compensa sus márgenes blancos para que los empaques ocupen aproximadamente el 80% del recuadro.

Verificación del rediseño: pruebas de componentes y cálculo; Chrome a 320, 390, 430 y 1440 px para el recorrido de 14 m² y 4 mm, copia, edición, filtros, desplazamiento y ausencia de desbordamiento horizontal. La app no se publica automáticamente.
