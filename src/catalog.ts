export const categories = ['Muros y acabados','Pisos','Resanes','Impermeabilización'] as const;
export type Product = {id:string; name:string; presentation:string; category:typeof categories[number]; use:string; price?:number; unit:string; plural:string; work:string; image?:string; imageNote?:string; spot?:boolean};
export const products: Product[] = [
 {id:'constructor',image:'/images/adeblokconstructor40kg.png',name:'Adeblok Constructor Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para dar acabado a muros de block.',price:250,unit:'bulto',plural:'bultos',work:'block'},
 {id:'plus',image:'/images/ADEBLOKPLUS40kg.png',name:'Adeblok Plus Cemix',presentation:'Bulto de 40 kg',category:'Muros y acabados',use:'Para recubrir concreto liso.',unit:'bulto',plural:'bultos',work:'concreto'},
 {id:'yeso',name:'Yeso de Axochiapan',presentation:'Bulto de 25 kg',category:'Muros y acabados',use:'Para acabados interiores de yeso.',unit:'bulto',plural:'bultos',work:'otros'},
 {id:'blanco',name:'Blanco de España',presentation:'Bulto de 20 kg',category:'Muros y acabados',use:'Para preparar pastas y acabados; confirma su aplicación con NAVI.',unit:'bulto',plural:'bultos',work:'otros'},
 {id:'mortero',image:"/images/morteronivelador.jpeg",name:'Mortero Nivelador Cemix',presentation:'Bulto de 25 kg',category:'Pisos',use:'Para nivelar un piso.',unit:'bulto',plural:'bultos',work:'piso'},
 {id:'resanador',image:"/images/resanadordegrietas.jpeg",name:'Resanador de Grietas Cemix',presentation:'Bolsa de 2 kg',category:'Resanes',use:'Para resanes puntuales de grietas.',unit:'bolsa',plural:'bolsas',work:'resanes',spot:true},
 {id:'plastico',image:"/images/impercoolcementoplastico.webp",name:'Impercool Cemento Plástico',presentation:'Cubeta de 1 galón',category:'Resanes',use:'Para sellados puntuales en azoteas.',unit:'cubeta',plural:'cubetas',work:'sellados',spot:true},
 {id:'cinco',image:"/images/impercool5anos.jpeg",name:'Impercool 5 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1300,unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'siete',image:"/images/impercool7anos.jpeg",name:'Impercool 7 años',presentation:'Cubeta de 19 L',category:'Impermeabilización',use:'Para impermeabilizar una azotea.',price:1600,unit:'cubeta',plural:'cubetas',work:'azotea'},
 {id:'diez',image:"/images/impercoolbasecemento10anos.jpeg",name:'Impercool Base Cemento 10 años',presentation:'Bulto de 10 kg',category:'Impermeabilización',use:'Para impermeabilizar con base cemento.',unit:'bulto',plural:'bultos',work:'azotea'},
];
export const thicknessYields: Record<string,number> = {'3':9.4,'4':7.1,'5':5.7,'6':4.7,'7':4.0};
