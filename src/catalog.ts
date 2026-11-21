export const categories = ['Muros y acabados','Pisos','Resanes','Impermeabilización','Construcción'] as const;
export type Product = {id:string; name:string; presentation:string; category:typeof categories[number]; use:string; price?:number; quotable?:boolean; unit:string; plural:string; work:string; image?:string; imageScale?:number; imageNote?:string; volumeYieldLitres?:number; areaCoverage?:{m2PerContainer:number;coats:number;note:string}; spot?:boolean; technical?:{sheet:string; note:string; manufacturer?:string}};
// imageScale compensa los márgenes blancos de cada foto para que el empaque
// ocupe aproximadamente el 80% del recuadro, sin deformarlo ni recortarlo.
export const products: Product[] = [
 {id:'constructor',imageScale:1,image:'/images/adeblokconstructor40kg.png',name:'Adeblok Constructor Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para dar acabado a muros de block.',price:250,unit:'bulto',plural:'bultos',work:'block'},
 {id:'plus',imageScale:0.84,image:'/images/ADEBLOKPLUS40kg.png',name:'Adeblok Plus Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para recubrir concreto liso.',price:280,unit:'bulto',plural:'bultos',work:'concreto'},
 {id:'yeso',quotable:false,imageScale:0.86,image:'/images/yesodeaxochiapan.png',name:'Yeso de Axochiapan',presentation:'Bulto de 25 kg',category:'Muros y acabados',use:'Para acabados interiores de yeso.',price:148,unit:'bulto',plural:'bultos',work:'otros'},
 {id:'blanco',quotable:false,imageScale:0.87,image:'/images/blancoespana.png',name:'Blanco de España',presentation:'Bulto de 20 kg',category:'Muros y acabados',use:'Para preparar pastas y acabados; confirma su aplicación con NAVI.',price:130,unit:'bulto',plural:'bultos',work:'otros'},
 {id:'mortero',imageScale:0.94,image:"/images/morteronivelador.jpeg",name:'Mortero Nivelador Cemix',presentation:'Bulto de 25 kg',category:'Pisos',use:'Para nivelar un piso.',price:200,unit:'bulto',plural:'bultos',work:'piso'},
 {
  id:'psp',name:'PSP+ Porcelánico Cemix',presentation:'Bulto de 20 kg',image:'/images/psp-porcelanico.jpg',
  category:'Pisos',price:340,unit:'bulto',plural:'bultos',work:'revestimientos',
  use:'Para pegar porcelanato, cerámica y piedra natural en pisos y muros. También permite instalar piso sobre piso en interiores.',
  technical:{
   sheet:'https://www.cemix.com/wp-content/uploads/2026/09/FT-PSP.pdf',
   note:'Usa el espesor del adhesivo después de colocar la pieza. Para piso sobre piso, Cemix indica un máximo de 7 mm. El consumo puede variar con la superficie, la llana y la aplicación de adhesivo al reverso.',
  },
 },
 {id:'resanador',imageScale:0.96,image:"/images/resanadordegrietas.jpeg",name:'Resanador de Grietas Cemix',presentation:'Bolsa de 2 kg',category:'Resanes',use:'Para resanes puntuales de grietas.',price:145,unit:'bolsa',plural:'bolsas',work:'resanes',volumeYieldLitres:1},
 {id:'plastico',imageScale:0.84,image:"/images/impercoolcementoplastico.webp",name:'Impercool Cemento Plástico',presentation:'Cubeta de 1 galón',category:'Resanes',use:'Para sellados puntuales en azoteas.',price:350,unit:'cubeta',plural:'cubetas',work:'sellados',volumeYieldLitres:3.78},
 {id:'cinco',imageScale:0.99,image:"/images/impercool5anos.jpeg",name:'Impercool 5 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1300,areaCoverage:{m2PerContainer:19,coats:2,note:'Rendimiento aproximado de Cemix para el sistema a dos manos. Ingresa el área una sola vez: las dos manos ya están contempladas. El consumo puede variar según la superficie y la aplicación.'},unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'siete',imageScale:0.99,image:"/images/impercool7anos.jpeg",name:'Impercool 7 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1600,areaCoverage:{m2PerContainer:19,coats:2,note:'Rendimiento aproximado de Cemix para el sistema a dos manos. Ingresa el área una sola vez: las dos manos ya están contempladas. El consumo puede variar según la superficie y la aplicación.'},unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'diez',imageScale:0.91,image:"/images/impercoolbasecemento10anos.jpeg",name:'Impercool Base Cemento 10 años',presentation:'Bulto de 10 kg',category:'Impermeabilización',use:'Para impermeabilizar con base cemento.',price:1100,unit:'bulto',plural:'bultos',work:'azotea'},
 {
  id:'moctezuma',name:'Cemento Gris Moctezuma CPC 30 R RS',presentation:'Bulto de 25 kg',
  image:'/images/cemento-moctezuma-25kg.webp',category:'Construcción',price:120,unit:'bulto',plural:'bultos',work:'colado',
  use:'Cemento Portland compuesto de resistencia inicial rápida y resistente a sulfatos, para preparar concreto en pisos, losas y otros colados.',
  technical:{
   manufacturer:'Moctezuma',
   sheet:'https://s2c57e1e8a048a550.jimcontent.com/download/version/1579285233/module/8968027869/name/CPC30RS.pdf',
   note:'Estimación de cemento sin merma, basada en la tabla de Moctezuma. El concreto también requiere agua, arena y grava. Para elementos estructurales, usa la dosificación indicada por el responsable de la obra.',
  },
 },
];
export const thicknessYields: Record<string,number> = {'3':9.4,'4':7.1,'5':5.7,'6':4.7,'7':4.0};

// Adeblok Plus, código 30023, saco de 40 kg. Rendimientos aproximados.
// Fuente: https://www.cemix.com/wp-content/uploads/2022/12/cemix-adeblok-plus-ft.pdf
// Coinciden con la ficha de 40 kg enlazada por Cemix al consultar el 2026-11-17:
// https://www.cemix.com/wp-content/uploads/2026/06/FT-Adeblok.Plus-40kg.26.pdf
export const plusThicknessYields: Record<string,number> = {'3':10.2,'4':7.6,'5':6.1,'6':5.1,'7':4.3};
// Mortero Nivelador, saco de 25 kg. Valores publicados, sin interpolar.
// Fuente: https://www.cemix.com/wp-content/uploads/2024/03/FT-MORTERO-NIVELADOR-_2024-web-min.pdf
// Tabla de rendimientos, página 1. Consulta: 2026-11-17.
export const morteroThicknessYields: Record<string,number> = {'10':1.33,'20':0.66,'30':0.44,'40':0.33,'50':0.27};
export const thicknessYieldsByProduct: Partial<Record<string,Record<string,number>>> = {
 constructor: thicknessYields,
 plus: plusThicknessYields,
 mortero: morteroThicknessYields,
 psp: {'5':3.1,'7':2.3,'9':1.7,'12':1.3},
};

// Extrapolación lineal de consumo: rendimiento a t mm = 1.33 × 10 / t.
// No es una tabla Cemix: 3–7 mm quedan fuera del rango de aplicación de 10–50 mm.
// Se conserva la precisión completa para redondear envases solo al final.
export const morteroTheoreticalYields: Record<string,number> = Object.fromEntries(
 [3,4,5,6,7].map(mm=>[String(mm),morteroThicknessYields['10']*10/mm]),
);

// Resanador 2 kg: base aproximada de estimación, 1 L por bolsa.
// Cemix publica 1 L por cada 2 kg de producto preparado. No se emplea la
// referencia lineal de 18–20 m a 1×1 cm, que no coincide geométricamente.
// https://www.cemix.com/wp-content/uploads/2020/09/CEMIX-RESANADOR-DE-GRIETAS.pdf

// Impercool Cemento Plástico: galón nominal de 3.78 L, base de cálculo
// geométrico de consumo. Cemix declara rendimiento variable según uso.
// No representa un rendimiento oficial en m² ni contempla pérdidas/contracción.
// https://www.cemix.com/producto/cemento-plastico/
// https://www.cemix.com/wp-content/uploads/2020/09/cementoplastico.pdf

// Impercool Fibratado 5 años, cubeta de 19 L: 19 m² para el sistema a dos manos.
// La ficha publica 19 m²/cubeta e indica primera y segunda capa; se cotiza
// el sistema completo, sin duplicar el área ni agregar un selector de manos.
// https://www.cemix.com/wp-content/uploads/2021/07/impercool-5-an%CC%83os-fibratado-ft.pdf
// Enlazada desde https://www.cemix.com/impercool-usuario-final/ (2026-11-17).

// Impercool Fibratado 7 años, cubeta de 19 L: 19 m² por cubeta y aplicación
// a dos manos, según la ficha específica de 7 años; no se duplica el área.
// https://www.cemix.com/wp-content/uploads/2021/07/impercool-7-an%CC%83os-fibratado-ft.pdf
// Enlazada desde https://www.cemix.com/impercool-usuario-final/ (2026-11-18).

// Impercool Base Cemento 10 kg, ficha oficial (consulta: 2026-11-18), página 1.
// https://www.cemix.com/wp-content/uploads/2023/02/cemix-impercool-base-cemento-ft.pdf
// La tabla relaciona espesor con m²/saco. En membrana la UI pide espesor
// POR MANO y multiplica el área por 2, según el procedimiento de dos manos.
export const baseCementoApplications = {
 membrane: {
  label:'Membrana impermeable',coats:2,water:'2.5–3.5 L de agua por bulto de 10 kg',
  yields:{'0.5':17.62,'1':8.81,'2':4.40,'3':2.94} as Record<string,number>,
  note:'El espesor elegido es por mano. Se calculan dos manos sobre el área ingresada. Para aplicación directa expuesta, Cemix requiere sellado, malla y dos manos de 2 mm; este estimado incluye solo las manos de membrana, sin sellado previo ni malla.',
 },
 sealer: {
  label:'Sellador',coats:1,water:'10 L de agua por bulto de 10 kg',
  yields:{'0.5':33.3} as Record<string,number>,
  note:'Rendimiento de la tabla Cemix como sellador a 0.5 mm. Este estimado corresponde solo al sellado; no incluye membrana ni resanes.',
 },
 repair: {
  label:'Resanador superficial',coats:1,water:'2 L de agua por bulto de 10 kg',
  yields:{'0.5':16.22,'1':8.11,'2':4.05,'3':2.70} as Record<string,number>,
  note:'Estimado de resane superficial por área y espesor, usando la tabla Cemix. No representa el relleno de grietas profundas por volumen. No cubrir juntas de movimiento con impermeabilizante.',
 },
};
export type BaseCementoUse=keyof typeof baseCementoApplications;

// The CPC 30 R RS sheet uses 5–9 batches with one 50 kg sack per m³.
// Each batch corresponds to two of NAVI's 25 kg bags.
export const concreteDosages=[
 {label:'Muros y pisos',strength:100,bags:10},
 {label:'Trabes, castillos y dalas',strength:150,bags:12},
 {label:'Losas y zapatas',strength:200,bags:14},
 {label:'Columnas y losas especiales',strength:250,bags:16},
 {label:'Alta resistencia',strength:300,bags:18},
];
