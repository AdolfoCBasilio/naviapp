export const categories = ['Muros y acabados','Pisos','Resanes','Impermeabilización'] as const;
export type Product = {id:string; name:string; presentation:string; category:typeof categories[number]; use:string; price?:number; unit:string; plural:string; work:string; image?:string; imageScale?:number; imageNote?:string; spot?:boolean};
// imageScale compensa los márgenes blancos de cada foto para que el empaque
// ocupe aproximadamente el 80% del recuadro, sin deformarlo ni recortarlo.
export const products: Product[] = [
 {id:'constructor',imageScale:1,image:'/images/adeblokconstructor40kg.png',name:'Adeblok Constructor Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para dar acabado a muros de block.',price:250,unit:'bulto',plural:'bultos',work:'block'},
 {id:'plus',imageScale:0.84,image:'/images/ADEBLOKPLUS40kg.png',name:'Adeblok Plus Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para recubrir concreto liso.',price:280,unit:'bulto',plural:'bultos',work:'concreto'},
 {id:'yeso',imageScale:0.86,image:'/images/yesodeaxochiapan.png',name:'Yeso de Axochiapan',presentation:'Bulto de 25 kg',category:'Muros y acabados',use:'Para acabados interiores de yeso.',price:148,unit:'bulto',plural:'bultos',work:'otros'},
 {id:'blanco',imageScale:0.87,image:'/images/blancoespana.png',name:'Blanco de España',presentation:'Bulto de 20 kg',category:'Muros y acabados',use:'Para preparar pastas y acabados; confirma su aplicación con NAVI.',price:130,unit:'bulto',plural:'bultos',work:'otros'},
 {id:'mortero',imageScale:0.94,image:"/images/morteronivelador.jpeg",name:'Mortero Nivelador Cemix',presentation:'Bulto de 25 kg',category:'Pisos',use:'Para nivelar un piso.',price:200,unit:'bulto',plural:'bultos',work:'piso'},
 {id:'resanador',imageScale:0.96,image:"/images/resanadordegrietas.jpeg",name:'Resanador de Grietas Cemix',presentation:'Bolsa de 2 kg',category:'Resanes',use:'Para resanes puntuales de grietas.',price:145,unit:'bolsa',plural:'bolsas',work:'resanes',spot:true},
 {id:'plastico',imageScale:0.84,image:"/images/impercoolcementoplastico.webp",name:'Impercool Cemento Plástico',presentation:'Cubeta de 1 galón',category:'Resanes',use:'Para sellados puntuales en azoteas.',price:350,unit:'cubeta',plural:'cubetas',work:'sellados',spot:true},
 {id:'cinco',imageScale:0.99,image:"/images/impercool5anos.jpeg",name:'Impercool 5 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1300,unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'siete',imageScale:0.99,image:"/images/impercool7anos.jpeg",name:'Impercool 7 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1600,unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'diez',imageScale:0.91,image:"/images/impercoolbasecemento10anos.jpeg",name:'Impercool Base Cemento 10 años',presentation:'Bulto de 10 kg',category:'Impermeabilización',use:'Para impermeabilizar con base cemento.',price:1100,unit:'bulto',plural:'bultos',work:'azotea'},
];
export const thicknessYields: Record<string,number> = {'3':9.4,'4':7.1,'5':5.7,'6':4.7,'7':4.0};
