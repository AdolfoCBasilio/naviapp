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

`thicknessYields` contiene exclusivamente los rendimientos de Adeblok Constructor de 40 kg proporcionados para esta v1: 3 mm → 9.4; 4 mm → 7.1; 5 mm → 5.7; 6 mm → 4.7; 7 mm → 4.0 m² por bulto. Se exige elegir el espesor. `plusThicknessYields` contiene los rendimientos de Adeblok Plus de 40 kg: 3 mm → 10.2; 4 mm → 7.6; 5 mm → 6.1; 6 mm → 5.1; 7 mm → 4.3 m² por bulto. `thicknessYieldsByProduct` selecciona la tabla según el producto, sin preseleccionar espesor. Fuente: [ficha oficial de Adeblok Plus 40 kg](https://www.cemix.com/wp-content/uploads/2022/12/cemix-adeblok-plus-ft.pdf), contrastada con [el PDF de 40 kg enlazado actualmente por Cemix](https://www.cemix.com/wp-content/uploads/2026/06/FT-Adeblok.Plus-40kg.26.pdf) el 17 de noviembre de 2026; ambos publican los mismos rendimientos. El PDF más reciente lleva el encabezado Constructor, aunque corresponde al código 30023 y al procedimiento de Plus. Los valores son aproximados y dependen de la superficie, la llana y la instalación. Para los demás productos se solicita el rendimiento confirmado de su ficha técnica según la aplicación y manos; la app no lo inventa ni lo guarda.

## Cómo funciona el estimado

La lógica independiente está en `src/calculate.ts`. Suma superficies directas o largo por alto/ancho, acepta coma y punto decimal y exige medidas positivas. Cantidad = redondeo hacia arriba de área / rendimiento por envase. Total = envases completos × precio unitario. No incluye merma. Los precios y la disponibilidad se confirman con la tienda.

Catálogo, medidas y estimado son vistas independientes. El catálogo conserva búsqueda, categoría y desplazamiento mientras la app permanece abierta. Cotizar desde una tarjeta selecciona el producto y abre las medidas sin volver a pedir el trabajo.

El resultado reemplaza el formulario y recibe el foco. Editar medidas recupera producto, superficies y espesor. Copiar cotización confirma el éxito al terminar la escritura en el portapapeles. Si el navegador bloquea el portapapeles, se presenta un resumen seleccionable. Resanador de Grietas e Impercool Cemento Plástico tienen estimadores de volumen por dimensiones. No se implementa envío de fotos o mensajes.


## Diseño y fotos

La referencia móvil vigente está en `public/referencias/mockup-navi-mobile-v2.png`. Los números y las tres columnas del mockup no forman parte de la interfaz: son tres estados del recorrido.

La interfaz usa grafito, texto claro y verde lima `#B8F55E`, cuadrícula de dos columnas desde 320 px y cuatro en escritorio. Las categorías Todas, Muros, Pisos, Resanes e Impermeabilización están siempre visibles y combinan su filtro con la búsqueda, sin desplegable adicional. El logo oficial se alinea a la derecha del encabezado.

El contenedor ocupa el alto visible de la ventana. Encabezado, contenido desplazable y navegación inferior son filas separadas: la barra opaca no se superpone al contenido. Se usan `100dvh`, `visualViewport` para el teclado y las barras del navegador, y `env(safe-area-inset-bottom)` para el área segura. Las medidas se abren directamente desde una tarjeta; entrar sin producto permite elegir el trabajo y tocar un material sugerido. La ficha reemplaza la selección y Cambiar permite elegir otro material.

El estimado muestra primero cantidad y total, después el resumen y las acciones Copiar cotización / Editar medidas. El desglose técnico va en Ver detalles, plegado por defecto.

Adeblok Constructor y Adeblok Plus usan las fotos de 40 kg: `adeblokconstructor40kg.png` y `ADEBLOKPLUS40kg.png`. Yeso y Blanco de España usan `yesodeaxochiapan.png` y `blancoespana.png`. Las fotos se muestran completas con `object-fit: contain`; `imageScale` compensa sus márgenes blancos para que los empaques ocupen aproximadamente el 80% del recuadro.

Verificación del rediseño: pruebas de componentes y cálculo; Chrome a 320, 390, 430 y 1440 px para los recorridos de 14 m² / 4 mm y 500 m² / 3 mm (54 bultos, $13,500 MXN), copia, edición, filtros, desplazamiento, teclado y ausencia de desbordamiento horizontal. También se prueba una altura reducida de 380 px y espacio inferior simulado de 34 px; queda pendiente verificar el teclado y las barras de Safari en un iPhone físico. La app no se publica automáticamente.


## Mortero Nivelador de 25 kg

`morteroThicknessYields` en `src/catalog.ts` usa la tabla de la página 1 de la [ficha oficial de Cemix](https://www.cemix.com/wp-content/uploads/2024/03/FT-MORTERO-NIVELADOR-_2024-web-min.pdf), consultada el 17 de noviembre de 2026: 10 mm → 1.33; 20 mm → 0.66; 30 mm → 0.44; 40 mm → 0.33; 50 mm → 0.27 m² por saco de 25 kg. Se conservan los valores publicados, sin extrapolar ni interpolar otros espesores. Son aproximados y dependen del método de instalación y las condiciones de la superficie.

El cotizador exige elegir espesor, usa largo × ancho para pisos y conserva los dos decimales del rendimiento en la ayuda, el desglose y el resumen copiado. Ejemplo: 10 m² a 10 mm requieren 8 bultos completos, $1,600 MXN al precio de $200 por bulto, sin merma.


### Opción teórica para capas de 3–7 mm

El Mortero Nivelador inicia en modo Rendimientos Cemix (10–50 mm). Por solicitud de NAVI se agrega un modo separado **Cálculo teórico 3–7 mm**, basado en la extrapolación lineal `rendimiento = 1.33 × 10 / espesor_mm`, suponiendo consumo proporcional al espesor. La función conserva todos los decimales al calcular y redondea hacia arriba únicamente la cantidad final de bultos. La pantalla muestra el rendimiento aproximado a dos decimales.

Estos espesores están fuera del rango de aplicación del fabricante. La extrapolación no es un rendimiento publicado ni validado por Cemix y no confirma la aptitud del producto para capas delgadas. Esa condición se muestra en medidas, en el resultado visible y en el resumen copiado. Cambiar el modo borra el espesor y obliga a calcular de nuevo; Editar medidas conserva el modo seleccionado. Las cotizaciones nuevas vuelven al modo Cemix.


## Cotizador de Resanador de Grietas, 2 kg

Se mide cada grieta por largo en metros y ancho/profundidad promedio en milímetros. Se aproxima un hueco rectangular: `litros = largo_m × ancho_mm × profundidad_mm / 1000`. Se suman los volúmenes de todas las grietas y se redondea una sola vez hacia arriba a bolsas completas. El precio del catálogo es $145 por bolsa. El resultado conserva las medidas para editar y las incluye en el resumen copiado.

La [ficha enlazada por Cemix](https://www.cemix.com/wp-content/uploads/2020/09/CEMIX-RESANADOR-DE-GRIETAS.pdf), consultada el 17 de noviembre de 2026, publica **1 L por cada 2 kg de producto preparado**. Como base aproximada del cotizador se toma 1 L por bolsa comercial de 2 kg, indicando esa suposición en medidas, resultado y resumen. La ficha también menciona 18–20 metros lineales a 1 cm × 1 cm; esas dimensiones equivalen a 1.8–2 L y no coinciden con el dato volumétrico. No se mezclan ambas referencias ni se afirma que la conversión a bolsa sea una garantía de rendimiento. La [guía Cemix 2024](https://www.cemix.com/wp-content/uploads/2024/09/Guia.Productos-CEMIX.2024.pdf) reitera 1 L por cada 2 kg de producto preparado.

Se informa que no es para grietas con movimiento ni juntas de expansión. El estimado es de consumo y no diagnostica causas o estabilidad de la grieta. Ejemplo: 15 m × 10 mm × 10 mm = 1.5 L → 2 bolsas, $290 MXN sin merma. Impercool Cemento Plástico usa el mismo formulario volumétrico con su contenido nominal y sus propias indicaciones.


## Cotizador de Impercool Cemento Plástico, 1 galón

La [página oficial de Cemix](https://www.cemix.com/producto/cemento-plastico/) identifica el galón como **3.78 L**. La [ficha técnica](https://www.cemix.com/wp-content/uploads/2020/09/cementoplastico.pdf) indica rendimiento variable según el uso (y redondea la presentación a 3.8 L). Consulta: 17 de noviembre de 2026. Se conserva el precio de NAVI, $350 por galón.

El estimador usa `litros = largo_m × ancho_mm × profundidad_mm / 1000` para cada tramo de sellado. Suma todos los tramos y divide por **3.78 L de contenido nominal**, redondeando al envase completo. Es una estimación geométrica sin merma, pérdidas ni contracción, no un rendimiento oficial en m². Esa aclaración aparece en medidas, resultado y cotización copiada. Se pueden agregar, eliminar y editar tramos; no se hereda la advertencia de grietas móviles del Resanador, pues es otro producto. Se indica no diluir y aplicar en seco, conforme a su ficha.

Ejemplos: 37.8 m × 10 mm × 10 mm = 3.78 L → 1 cubeta, $350 MXN; 38 m con la misma sección = 3.8 L → 2 cubetas, $700 MXN. `estimateVolume` corrige solo el ruido de coma flotante en límites exactos (por ejemplo, 3.7800000000000002), sin truncar excesos reales.


## Cotizador de Impercool Fibratado 5 años, 19 L

La [ficha oficial enlazada por Cemix para el Fibratado 5 años](https://www.cemix.com/wp-content/uploads/2021/07/impercool-5-an%CC%83os-fibratado-ft.pdf), consultada el 17 de noviembre de 2026, publica 19 m² por cubeta de 19 L y prescribe primera y segunda capa. La app toma **19 m² por cubeta para el sistema a dos manos**, con rendimiento aproximado según superficie y aplicación. Corresponde al Fibratado de la foto del catálogo, sin sustituirlo por las variantes Ecológico o 5A VV.

`areaCoverage` en `src/catalog.ts` guarda el rendimiento y las 2 manos. Se ingresa el área una sola vez (o se suman superficies por largo × ancho); no se duplica por las dos manos. Cantidad = techo(área / 19), precio NAVI $1,300 por cubeta. La aplicación a dos manos se muestra en medidas, resultado y cotización copiada. No se solicita rendimiento ni espesor manual. El estimado contempla solo este producto, sin merma ni materiales complementarios. Ejemplos: 19 m² → 1 cubeta/$1,300; 38 m² → 2/$2,600; 500 m² → 27/$35,100.


## Cotizador de Impercool Fibratado 7 años, 19 L

La [ficha específica del Fibratado 7 años enlazada por Cemix](https://www.cemix.com/wp-content/uploads/2021/07/impercool-7-an%CC%83os-fibratado-ft.pdf), consultada el 18 de noviembre de 2026, publica 19 m² por cubeta de 19 L y prescribe primera y segunda capa. Se integra como **19 m² por cubeta para el sistema a dos manos**, con rendimiento aproximado según superficie y aplicación. `areaCoverage` del producto `siete` contiene los datos; usa el precio NAVI de $1,600 por cubeta.

Se ingresa el área una sola vez, directamente o por largo × ancho, sumando las superficies antes de redondear. No se solicita rendimiento ni espesor manual. Copiar incluye las dos manos y el precio propio de 7 años; Editar conserva las medidas. Ejemplos sin merma ni materiales complementarios: 19 m² → 1 cubeta/$1,600; 38 m² → 2/$3,200; 100 m² → 6/$9,600; 500 m² → 27/$43,200. Cambiar entre 5 y 7 años conserva las superficies pero recalcula usando el precio del producto seleccionado.

## Cotizador de Impercool Base Cemento 10 años, saco de 10 kg

Fuente: [ficha oficial enlazada por Cemix](https://www.cemix.com/wp-content/uploads/2023/02/cemix-impercool-base-cemento-ft.pdf), consultada el 18 de noviembre de 2026. Las tablas y la preparación dependen del uso y no se mezclan. Los datos viven en `baseCementoApplications` de `src/catalog.ts`:

| Uso | Espesor (mm) → m²/saco de 10 kg | Agua por saco |
| --- | --- | --- |
| Membrana | 0.5 → 17.62; 1 → 8.81; 2 → 4.40; 3 → 2.94 | 2.5–3.5 L |
| Sellador | 0.5 → 33.3 | 10 L |
| Resanador superficial | 0.5 → 16.22; 1 → 8.11; 2 → 4.05; 3 → 2.70 | 2 L |

El selector comienza en Membrana, sin preseleccionar espesor. El espesor se define explícitamente **por mano**: para membrana se aplica el modelo `cantidad = techo(área × 2 manos / rendimiento de tabla al espesor elegido)`; sellador y resane superficial calculan una aplicación. La ficha prescribe dos manos para membrana; el factor de dos corresponde a la elección de introducir espesor por mano y no espesor acumulado. El precio NAVI es $1,100 por saco. Uso, manos, agua, espesor y base de cálculo se incluyen en el resultado y el resumen copiado; Editar conserva las selecciones y superficies.

Para aplicación directa expuesta, la ficha requiere sellado (10 L de agua por saco), malla y dos manos de membrana de 2 mm. La app lo informa: la cotización de membrana **no incluye el producto para sellado previo ni la malla**. Los usos se cotizan por separado; no se presenta el resultado como precio del sistema completo. El modo Resanador es superficial por área/espesor, no un cálculo de grietas profundas. Se informa respetar juntas de movimiento. Los rendimientos son aproximados y se usan los valores publicados, sin interpolar.

Ejemplos: 10 m², membrana a 2 mm por mano × 2 manos → 5 bultos/$5,500; 33.3 m², sellador a 0.5 mm → 1 bulto/$1,100; 8.11 m², resane a 1 mm → 1 bulto/$1,100. No se confunde con los rendimientos de los impermeabilizantes acrílicos de 5 y 7 años.
