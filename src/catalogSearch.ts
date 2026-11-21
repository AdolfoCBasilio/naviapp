import {products} from './catalog';

const workTerms:Record<string,string>={
 block:'aplanar aplanado repellar repello repellado aplanados paredes barda bloques muro block',
 concreto:'recubrir recubrimiento aplanar aplanado hormigón concreto liso',
 piso:'nivelar nivelación emparejar alisar firme piso pisos suelo losa desnivel',
 azotea:'impermeabilizar impermeabilizante impermeabilizantes gotera goteras filtración filtraciones reparar techo techos azotea azoteas',
 resanes:'resanar resane reparar reparación rellenar tapar grieta grietas fisura fisuras rajadura rajaduras',
 sellados:'sellar sellador sellado tapar reparar gotera goteras filtración filtraciones techo techos azotea azoteas',
};

const ignoredWords=new Set(['a','al','con','de','del','el','en','la','las','lo','los','o','para','por','que','se','un','una','y',
 'busco','necesito','puedo','quiero','como','mi','mis','sirve','tengo']);

function words(text:string){
 return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu,'').match(/[a-z0-9]+/g)??[];
}

const searchableProducts=products.map(product=>({
 product,
 name:words(product.name).join(' '),
 terms:words([product.name,product.category,product.presentation,product.use,workTerms[product.work]].join(' ')),
}));

export function searchCatalog(search:string,category:string){
 const input=words(search);
 const phrase=input.join(' ');
 const query=input.filter(word=>!ignoredWords.has(word));
 return searchableProducts.filter(({product,name,terms})=>
  (category==='Todas'||product.category===category)
  && (name.includes(phrase)||query.every(word=>terms.some(term=>term.startsWith(word)))),
 ).map(({product})=>product);
}
