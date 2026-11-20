import {act,render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import App from './App';
import {products,thicknessYields,plusThicknessYields,morteroThicknessYields} from './catalog';

beforeEach(()=>{vi.restoreAllMocks();window.history.replaceState(null,'','#catalogo');Element.prototype.scrollTo=vi.fn(function(this:Element,options?:ScrollToOptions|number){if(options&&typeof options==='object')this.scrollTop=options.top ?? 0;});});
const card=(id:string)=>screen.getAllByRole('article').find(c=>c.dataset.productId===id)!;
async function openCard(user:ReturnType<typeof userEvent.setup>,id='constructor'){
 await user.click(within(card(id)).getByRole('link',{name:'Cotizar'}));
 if(products.find(p=>p.id===id)?.category==='Muros y acabados'||id==='mortero')await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));
}
const workLabels:Record<string,string>={
 block:'Dar acabado a un muro de block',
 concreto:'Recubrir concreto liso',
 piso:'Nivelar un piso o losa',
 azotea:'Impermeabilizar una azotea',
 resanes:'Resanar grietas',
 sellados:'Hacer sellados puntuales',
};
async function pickWork(user:ReturnType<typeof userEvent.setup>,work:string){
 const back=screen.queryByRole('button',{name:/Cambiar tipo de trabajo/});
 if(back)await user.click(back);
 await user.click(screen.getByRole('button',{name:workLabels[work]}));
}
async function openWork(user:ReturnType<typeof userEvent.setup>,work:string){
 await user.click(screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector('a[href="#cotizador"]')!);
 await pickWork(user,work);
 await user.click(screen.getByRole('button',{name:new RegExp(products.find(p=>p.work===work)!.name)}));
 if(products.find(p=>p.work===work)?.category==='Muros y acabados')await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));
}
const calculateButton=()=>screen.getByRole('button',{name:/^Calcular (estimado|material y costo|bolsas y costo|cubetas y costo|bultos y costo)$/});
const areaInput=(i=1)=>screen.queryByLabelText(`Área de muro ${i} (m²)`)??screen.getByLabelText(`Área de superficie ${i} (m²)`);
const lengthInput=(i=1)=>screen.queryByLabelText(`Largo de muro ${i} (m)`)??screen.getByLabelText(`Largo de superficie ${i} (m)`);
describe('Entrada a NaviApp',()=>{
 it('muestra las tres opciones de inicio en orden',()=>{
  window.history.replaceState(null,'','/');
  render(<App/>);
  expect(screen.getAllByRole('link').map(link=>link.textContent)).toEqual([
   'Mándanos un WhatsApp','Ver dónde está NAVI','Ir a catálogo y cotizador',
  ]);
  expect(screen.getByRole('link',{name:'Ver dónde está NAVI'})).toHaveAttribute('href','https://maps.app.goo.gl/ahz15b6kWgyagmPd6');
  expect(screen.getByRole('link',{name:'Mándanos un WhatsApp'})).toHaveAttribute('href','https://wa.me/522321749491');
 });
 it('abre el catálogo, permite ir al cotizador y vuelve a inicio con el historial',async()=>{
  window.history.replaceState(null,'','/');
  const user=userEvent.setup();render(<App/>);
  expect(screen.getByRole('heading',{name:'Bienvenido a NAVI'})).toBeVisible();
  expect(screen.queryByRole('navigation',{name:'Navegación móvil'})).not.toBeInTheDocument();
  const link=screen.getByRole('link',{name:'Ir a catálogo y cotizador'});
  expect(link).toHaveAttribute('href','#catalogo');
  await user.click(link);
  expect(window.location.hash).toBe('#catalogo');
  expect(screen.getByRole('heading',{name:'Materiales para tu obra'})).toHaveFocus();
  const navigation=screen.getByRole('navigation',{name:'Navegación móvil'});
  await user.click(within(navigation).getByRole('link',{name:'Cotizador'}));
  expect(window.location.hash).toBe('#cotizador');
  expect(screen.getByRole('heading',{name:'¿Qué quieres hacer?'})).toHaveFocus();
  act(()=>{
   window.history.replaceState(null,'','/');
   window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading',{name:'Bienvenido a NAVI'})).toHaveFocus();
 });
 it.each([
  ['#catalogo','Materiales para tu obra'],
  ['#cotizador','¿Qué quieres hacer?'],
 ])('respeta el enlace directo %s', (hash,title)=>{
  window.history.replaceState(null,'',hash);
  render(<App/>);
  expect(screen.getByRole('heading',{name:title})).toBeVisible();
  expect(screen.queryByRole('heading',{name:'Bienvenido a NAVI'})).not.toBeInTheDocument();
 });
});

it('confirma Maps y WhatsApp en las pantallas internas y conserva la bienvenida',async()=>{
 const user=userEvent.setup();render(<App/>);
 const check=(container:HTMLElement)=>{
  const element=container.querySelector('dialog')!;
  if(!element.showModal)element.showModal=()=>{element.open=true;};
  if(!element.close)element.close=()=>{element.open=false;element.dispatchEvent(new Event('close'));};
  return within(container);
 };
 const header=check(screen.getByRole('banner'));
 const maps=header.getByRole('button',{name:'Cómo llegar'});
 await user.click(maps);
 const location=screen.getByRole('dialog',{name:'¿Quieres ver cómo llegar a NAVI?'});
 expect(within(location).getByRole('link',{name:'Sí, quiero ver la ubicación'})).toHaveAttribute('href','https://maps.app.goo.gl/ahz15b6kWgyagmPd6');
 await user.click(within(location).getByRole('button',{name:'No por el momento'}));
 expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
 await user.click(within(screen.getByRole('navigation',{name:'Navegación móvil'})).getByRole('link',{name:'Cotizador'}));
 const quoteHeader=check(screen.getByRole('banner'));
 await user.click(quoteHeader.getByRole('button',{name:'WhatsApp'}));
 const whatsapp=screen.getByRole('dialog',{name:'¿Quieres mandar el WhatsApp ahora?'});
 const url=new URL(within(whatsapp).getByRole('link',{name:'Sí, quiero enviar WhatsApp'}).getAttribute('href')!);
 expect(url.origin).toBe('https://wa.me');
 expect(url.pathname).toBe('/522321749491');
 expect(url.searchParams.get('text')).toBe('hola buen dia Navi');
 await user.click(within(whatsapp).getByRole('button',{name:'No por el momento'}));
 await user.click(screen.getByRole('link',{name:/Inicio/}));
 expect(screen.queryByRole('banner')).not.toBeInTheDocument();
 expect(screen.getByRole('link',{name:'Mándanos un WhatsApp'})).toBeVisible();
});


function expectWhatsAppQuote(summary:unknown){
 const link=screen.getByRole('link',{name:'Enviar por WhatsApp'});
 const url=new URL(link.getAttribute('href')!);
 expect(url.origin).toBe('https://wa.me');
 expect(url.pathname).toBe('/522321749491');
 expect(url.searchParams.get('text')).toBe(summary);
}

describe('Tipos de trabajo del cotizador',()=>{
 it('muestra las seis opciones en orden, abre sus materiales y permite volver a Inicio',async()=>{
  window.history.replaceState(null,'','/#cotizador');
  const user=userEvent.setup();render(<App/>);
  const list=screen.getByRole('list',{name:'Tipos de trabajo'});
  expect(within(list).getAllByRole('button').map(button=>button.textContent)).toEqual(Object.values(workLabels));
  for(const [work,label] of Object.entries(workLabels)){
   const card=screen.getByRole('button',{name:label});
   card.focus();
   await user.keyboard('{Enter}');
   expect(screen.getByRole('heading',{name:'Elige un material'})).toHaveFocus();
   const shown=within(screen.getByRole('region',{name:'Elegir material'}));
   const expected=products.filter(product=>product.work===work&&product.quotable!==false);
   expect(shown.getAllByRole('button')).toHaveLength(expected.length);
   for(const product of expected)expect(shown.getByRole('button',{name:new RegExp(product.name)})).toBeVisible();
   await user.click(screen.getByRole('button',{name:/Cambiar tipo de trabajo/}));
  }
  await user.click(screen.getByRole('link',{name:/Inicio/}));
  expect(window.location.hash).toBe('');
  expect(screen.getByRole('heading',{name:'Bienvenido a NAVI'})).toHaveFocus();
 });
});

describe('Navegación y cotización',()=>{
 it('cada tarjeta abre medidas con su producto sin volver a pedir trabajo',async()=>{
  const user=userEvent.setup();render(<App/>);
  for(const product of products.filter(p=>p.quotable!==false)){
   await openCard(user,product.id);
   expect(screen.getByRole('heading',{level:1,name:product.category==='Muros y acabados'?'Cotiza el acabado de tu muro':product.id==='mortero'?'¿Cuánto mide tu piso o losa?':product.id==='diez'?'Mide tu superficie':product.work==='azotea'&&product.areaCoverage?'¿Cuánto mide tu azotea?':product.id==='resanador'?'¿Cuánto necesitas para resanar?':product.id==='plastico'?'¿Cuánto necesitas para sellar?':'Tus medidas'})).toBeVisible();
   expect(screen.getByRole('heading',{level:2,name:product.name})).toBeVisible();
   expect(screen.queryByRole('list',{name:'Tipos de trabajo'})).not.toBeInTheDocument();
   await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));
  }
 });
 it.each([['14','4','2','$500 MXN'],['162','5','29','$7,250 MXN'],['500','3','54','$13,500 MXN']])('calcula %s m² a %s mm',async(area,mm,quantity,total)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);
  expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
  await user.type(areaInput(1),area);
  await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());
  expect(screen.getByRole('heading',{level:1,name:'Tu estimado'})).toHaveFocus();
  const result=screen.getByRole('region',{name:'Resultado del estimado'});
  expect(result).toHaveTextContent(`${quantity} bultos completos`);expect(within(result).getByText(total,{selector:'.result-total'})).toBeVisible();
  expect(screen.queryByLabelText('Área de superficie 1 (m²)')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector('[aria-current="page"]')).toHaveTextContent('Cotizador');
 });
 it('muestra errores junto a los campos y lleva el foco al primero',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.click(calculateButton());
  expect(screen.getByText('Ingresa un área mayor que cero.')).toBeVisible();expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();
  expect(areaInput(1)).toHaveFocus();
 });
 it('sugiere por trabajo y redondea 2.1 cubetas a 3',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'azotea');
  expect(screen.getByRole('heading',{name:'Impercool 5 años'})).toBeVisible();
  expect(screen.queryByRole('list',{name:'Tipos de trabajo'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Usar este material'})).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(1),'39.9');expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();await user.click(calculateButton());
  expect(screen.getByText('3 cubetas completas')).toBeVisible();expect(screen.getByText('$3,900 MXN',{selector:'.result-total'})).toBeVisible();
 });
 it('conserva yeso y blanco en el catálogo sin opción de cotizar ni sugerirlos',async()=>{
  const user=userEvent.setup();render(<App/>);
  for(const [id,price] of [['yeso','$148 MXN'],['blanco','$130 MXN']]){
   const card=document.querySelector(`[data-product-id="${id}"]`)!;
   expect(card).toHaveTextContent(price);expect(within(card as HTMLElement).queryByRole('link',{name:'Cotizar'})).not.toBeInTheDocument();
  }
  await user.click(screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector('a[href="#cotizador"]')!);
  expect(screen.queryByRole('option',{name:'Otros acabados'})).not.toBeInTheDocument();
 });
 it('suma superficies con dimensiones y decimales con coma, y permite editarlas',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);
  await user.click(screen.getByRole('button',{name:'Largo × alto'}));
  await user.type(lengthInput(1),'2,5');await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'4');
  await user.click(screen.getByRole('button',{name:/Agregar (superficie|otro muro)/}));await user.click(screen.getAllByRole('button',{name:'Ya sé los m²'})[1]);await user.type(areaInput(2),'4');
  await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());
  expect(within(screen.getByRole('list',{name:'Medidas del estimado'})).getByText(/^14 m²/)).toBeVisible();expect(screen.getByText('2 bultos completos')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));
  expect(lengthInput(1)).toHaveValue('2,5');expect(screen.getByLabelText('Alto de muro 1 (m)')).toHaveValue('4');expect(areaInput(2)).toHaveValue('4');
  expect(screen.getByRole('button',{name:'4 mm'})).toHaveAttribute('aria-pressed','true');
  await user.type(areaInput(2),'0');expect(screen.queryByText('$500 MXN')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:/Eliminar (superficie|muro) 2/}));expect(screen.queryByLabelText('Área de superficie 2 (m²)')).not.toBeInTheDocument();
 });
 it('sellados puntuales abre el cálculo volumétrico de Cemento Plástico',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'sellados');expect(screen.getByLabelText('Largo (m) · Tramo 1')).toBeVisible();expect(screen.getByRole('button',{name:'Calcular cubetas y costo'})).toBeVisible();expect(screen.queryByLabelText('Área de superficie 1 (m²)')).not.toBeInTheDocument();
 });
 it('combina búsqueda y categoría, conserva ambas y restaura el desplazamiento',async()=>{
  const user=userEvent.setup();render(<App/>);await user.type(screen.getByLabelText('Buscar por nombre'),'Impercool');expect(screen.getAllByRole('article')).toHaveLength(4);
  await user.click(screen.getByRole('button',{name:'Impermeabilización'}));
  expect(screen.getAllByRole('article')).toHaveLength(3);expect(screen.getByRole('button',{name:'Impermeabilización'})).toHaveAttribute('aria-pressed','true');
  screen.getByRole('main').scrollTop=440;await openCard(user,'siete');await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));
  expect(screen.getByLabelText('Buscar por nombre')).toHaveValue('Impercool');expect(screen.getByText(/Impermeabilización · 3 resultados/)).toBeVisible();expect(screen.getByRole('main').scrollTop).toBe(440);
  await user.click(screen.getByRole('button',{name:'Todas'}));expect(screen.getAllByRole('article')).toHaveLength(4);
 });
 it('copia el resumen y confirma solamente cuando el portapapeles responde',async()=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user);
  await user.type(areaInput(1),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());await user.click(screen.getByRole('button',{name:/Copiar cotización/}));
  expect(write).toHaveBeenCalledWith(expect.stringContaining('Cantidad: 2 bultos completos'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Espesor: 4 mm'));expect(screen.getByRole('status')).toHaveTextContent('Cotización copiada');
 });
 it('pide confirmación de Maps en el estimado y permite cancelar sin perderlo',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);
  await user.type(areaInput(1),'16');await user.click(screen.getByRole('button',{name:'3 mm'}));await user.click(calculateButton());
  const result=screen.getByRole('region',{name:'Resultado del estimado'});
  const nativeDialog=result.querySelector('dialog')!;
  if(!nativeDialog.showModal)nativeDialog.showModal=()=>{nativeDialog.open=true;};
  if(!nativeDialog.close)nativeDialog.close=()=>{nativeDialog.open=false;nativeDialog.dispatchEvent(new Event('close'));};
  const maps=within(result).getByRole('button',{name:'Cómo llegar'});
  await user.click(maps);
  const dialog=screen.getByRole('dialog',{name:'¿Quieres ver cómo llegar?'});
  expect(within(dialog).getByRole('link',{name:'Sí, quiero ver dónde está NAVI'})).toHaveAttribute('href','https://maps.app.goo.gl/ahz15b6kWgyagmPd6');
  await user.click(within(dialog).getByRole('button',{name:'No por ahora'}));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(maps).toHaveFocus();
  expect(within(result).getByRole('link',{name:'Enviar por WhatsApp'})).toHaveAttribute('href',expect.stringContaining('https://wa.me/522321749491?text='));
 });
 it('conserva Consulta precio cuando el catálogo no tiene importe',async()=>{
  const user=userEvent.setup();
  const product=products.find(item=>item.id==='constructor')!;
  const price=product.price;
  product.price=undefined;
  try{
   render(<App/>);await openCard(user);
   await user.type(areaInput(1),'16');
   await user.click(screen.getByRole('button',{name:'3 mm'}));
   await user.click(calculateButton());
   expect(screen.getByText('Consulta precio',{selector:'.result-total'})).toBeVisible();
   await user.click(screen.getByText('Ver desglose'));
   expect(screen.getByText('2 × Consulta precio')).toBeVisible();
   const target=new URL(screen.getByRole('link',{name:'Enviar por WhatsApp'}).getAttribute('href')!);
   expect(target.searchParams.get('text')).toContain('Total: Consulta precio');
  }finally{product.price=price;}
 });
 it('no afirma que copió si falla el portapapeles',async()=>{
  const user=userEvent.setup();vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('denied'));render(<App/>);await openCard(user);await user.type(areaInput(1),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(screen.getByRole('status')).toHaveTextContent('No se pudo copiar');expect((screen.getByLabelText('Resumen para copiar') as HTMLTextAreaElement).value).toContain('Total: $500 MXN');
 });
 it('Cambiar recupera la selección y una cotización nueva no hereda medidas ni espesor',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.type(areaInput(1),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));
  await user.click(screen.getByRole('button',{name:'Cambiar'}));expect(screen.getByRole('button',{name:/Adeblok Constructor Cemix/})).toBeVisible();await pickWork(user,'piso');await user.click(screen.getByRole('button',{name:/Mortero Nivelador Cemix/}));expect(screen.getByRole('button',{name:'Largo × ancho'})).toBeVisible();
  await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));await openCard(user);expect(areaInput(1)).toHaveValue('');for(const mm of Object.keys(thicknessYields))expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
 });
 it('muestra el desglose antes de compartir y conserva las medidas al editar',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.type(areaInput(1),'500');await user.click(screen.getByRole('button',{name:'3 mm'}));await user.click(calculateButton());
  const details=screen.getByText('Ver desglose').closest('details')!;
  expect(details).not.toHaveAttribute('open');
  expect(details.compareDocumentPosition(screen.getByRole('button',{name:/Copiar cotización/}))&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(screen.getByRole('button',{name:'Editar medidas'}).compareDocumentPosition(details)&Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  await user.click(screen.getByText('Ver desglose'));expect(details).toHaveAttribute('open');expect(screen.getByText('9.4 m² por envase')).toBeVisible();
  expect(screen.getByText('54 × $250 MXN')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(areaInput(1)).toHaveValue('500');expect(screen.getByRole('button',{name:'3 mm'})).toHaveAttribute('aria-pressed','true');
  expect(screen.queryByRole('link',{name:'Enviar por WhatsApp'})).not.toBeInTheDocument();
  await user.clear(areaInput(1));await user.type(areaInput(1),'16');await user.click(calculateButton());
  const message=new URL(screen.getByRole('link',{name:'Enviar por WhatsApp'}).getAttribute('href')!).searchParams.get('text');
  expect(message).toContain('Área: 16 m²');
  expect(message).toContain('Muro 1: 16 m² (área directa)');
  expect(message).toContain('Total: $500 MXN');
  expect(message).not.toContain('500 m²');

 });
 it('muestra todas las categorías sin desplegable y permite elegir con teclado',async()=>{
  const user=userEvent.setup();render(<App/>);
  expect(screen.queryByRole('button',{name:/Filtros/})).not.toBeInTheDocument();
  const group=screen.getByRole('group',{name:'Categorías rápidas'});expect(within(group).getAllByRole('button')).toHaveLength(5);
  within(group).getByRole('button',{name:'Impermeabilización'}).focus();await user.keyboard('{Enter}');expect(screen.getAllByRole('article')).toHaveLength(3);expect(within(group).getByRole('button',{name:'Impermeabilización'})).toHaveAttribute('aria-pressed','true');
 });
 it('las categorías rápidas combinan su filtro con la búsqueda',async()=>{
  const user=userEvent.setup();render(<App/>);await user.type(screen.getByLabelText('Buscar por nombre'),'Cemix');await user.click(screen.getByRole('button',{name:'Muros'}));expect(screen.getAllByRole('article')).toHaveLength(2);await user.click(screen.getByRole('button',{name:'Pisos'}));expect(screen.getAllByRole('article')).toHaveLength(1);expect(card('mortero')).toBeVisible();await user.click(screen.getByRole('button',{name:'Todas'}));expect(screen.getAllByRole('article')).toHaveLength(4);
 });
 it.each(Object.entries(plusThicknessYields))('Adeblok Plus a %s mm usa %s m² por bulto de 40 kg',async(mm,yieldValue)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'plus');
  expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
  await user.click(screen.getByRole('button',{name:`${mm} mm`}));expect(screen.getByText(`${yieldValue.toFixed(1)} m² por bulto de 40 kg`)).toBeVisible();
 });
 it.each([['500','3','50','$14,000 MXN'],['14','4','2','$560 MXN']])('cotiza Adeblok Plus con %s m² y %s mm',async(area,mm,quantity,total)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'plus');await user.type(areaInput(1),area);await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());
  expect(screen.getByText(`${quantity} bultos completos`)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByRole('heading',{name:'Adeblok Plus Cemix'})).toBeVisible();expect(areaInput(1)).toHaveValue(area);expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','true');
 });
 it('exige elegir el espesor de Plus y no reutiliza el de Constructor',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.click(screen.getByRole('button',{name:'3 mm'}));await user.click(screen.getByRole('button',{name:'Cambiar'}));await pickWork(user,'concreto');await user.click(screen.getByRole('button',{name:/Adeblok Plus Cemix/}));
  await user.type(areaInput(1),'14');await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();
 });
 it.each(Object.entries(morteroThicknessYields))('Mortero Nivelador a %s mm muestra %s m² por bulto de 25 kg',async(mm,yieldValue)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'mortero');expect(screen.getByRole('group',{name:'Espesor de nivelación'})).toBeVisible();
  expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
  await user.click(screen.getByRole('button',{name:`${mm} mm`}));expect(screen.getByText(`${yieldValue.toFixed(2)} m² por bulto de 25 kg`)).toBeVisible();
 });
 it.each([['10','10','8','$1,600 MXN','1.33'],['10','20','16','$3,200 MXN','0.66'],['10','50','38','$7,600 MXN','0.27']])('cotiza Mortero Nivelador con %s m² a %s mm',async(area,mm,quantity,total,coverage)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'mortero');await user.type(areaInput(1),area);await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());
  expect(screen.getByText(`${quantity} bultos completos`)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();await user.click(screen.getByText('Ver desglose'));expect(screen.getByText(`${coverage} m² por envase`)).toBeVisible();await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining(`Rendimiento: ${coverage} m² por envase`));
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(areaInput(1)).toHaveValue(area);expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','true');
 });
 it('Mortero exige espesor y mide pisos con largo por ancho',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'mortero');await user.click(screen.getByRole('button',{name:'Largo × ancho'}));await user.type(lengthInput(1),'2,5');await user.type(screen.getByLabelText('Ancho de superficie 1 (m)'),'4');await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'10 mm'}));await user.click(calculateButton());expect(screen.getByText('8 bultos completos')).toBeVisible();expect(screen.getByText('$1,600 MXN',{selector:'.result-total'})).toBeVisible();
 });
 it.each([['3','3','$600 MXN'],['4','4','$800 MXN'],['5','4','$800 MXN'],['6','5','$1,000 MXN'],['7','6','$1,200 MXN']])('Mortero teórico a %s mm extrapola y etiqueta su estimado',async(mm,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'mortero');expect(screen.getByRole('button',{name:'Rendimientos Cemix'})).toHaveAttribute('aria-pressed','true');expect(screen.queryByRole('button',{name:`${mm} mm`})).not.toBeInTheDocument();
  await user.click(screen.getByText('Ver cálculo teórico (avanzado)'));await user.click(screen.getByRole('button',{name:'Cálculo teórico 3–7 mm'}));expect(screen.getByText(/Cálculo teórico no validado por Cemix/)).toBeVisible();await user.type(areaInput(1),'10');await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());expect(screen.getByText(`${quantity} bultos completos`)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();expect(screen.getByText('Estimado teórico · No oficial')).toBeVisible();
  await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('Cálculo teórico no validado por Cemix'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Espesor fuera del rango de aplicación de 10–50 mm'));
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByRole('button',{name:'Cálculo teórico 3–7 mm'})).toHaveAttribute('aria-pressed','true');expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','true');expect(areaInput(1)).toHaveValue('10');
 });
 it('cambiar de modo exige otro espesor y elimina el estimado previo',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'mortero');await user.type(areaInput(1),'10');await user.click(screen.getByRole('button',{name:'10 mm'}));await user.click(screen.getByText('Ver cálculo teórico (avanzado)'));await user.click(screen.getByRole('button',{name:'Cálculo teórico 3–7 mm'}));await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();await user.click(screen.getByRole('button',{name:'3 mm'}));await user.click(calculateButton());await user.click(screen.getByRole('button',{name:'Editar medidas'}));await user.click(screen.getByRole('button',{name:'Rendimientos Cemix'}));expect(screen.queryByText('Estimado teórico · No oficial')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'10 mm'})).toHaveAttribute('aria-pressed','false');expect(screen.queryByRole('button',{name:'3 mm'})).not.toBeInTheDocument();await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();
  await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));await openCard(user,'mortero');expect(screen.getByRole('button',{name:'Rendimientos Cemix'})).toHaveAttribute('aria-pressed','true');
 });
 it.each([['10','10','10','1','1 bolsa completa','$145 MXN'],['15','10','10','1.5','2 bolsas completas','$290 MXN'],['20','10','10','2','2 bolsas completas','$290 MXN'],['2,5','4','5','0.05','1 bolsa completa','$145 MXN']])('Resanador calcula %s m × %s mm × %s mm por volumen',async(length,width,depth,volume,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'resanador');expect(screen.queryByLabelText('Área de superficie 1 (m²)')).not.toBeInTheDocument();expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();
  await user.type(screen.getByLabelText('Largo (m) · Grieta 1'),length);await user.type(screen.getByLabelText('Ancho promedio (mm) · Grieta 1'),width);await user.type(screen.getByLabelText('Profundidad promedio (mm) · Grieta 1'),depth);await user.click(calculateButton());
  expect(screen.getByText(quantity)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();expect(screen.getByText(`${volume} L de relleno · 1 grieta`)).toBeVisible();expect(screen.getByRole('heading',{name:'Tu estimado'})).toHaveFocus();await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('No usar para grietas con movimiento'));expect(write).toHaveBeenCalledWith(expect.stringContaining(`Volumen estimado: ${volume} L`));expectWhatsAppQuote(write.mock.calls[0][0]);
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Largo (m) · Grieta 1')).toHaveValue(length);expect(screen.getByLabelText('Ancho promedio (mm) · Grieta 1')).toHaveValue(width);expect(screen.getByLabelText('Profundidad promedio (mm) · Grieta 1')).toHaveValue(depth);expect(screen.queryByText(total,{selector:'.result-total'})).not.toBeInTheDocument();
 });
 it('Resanador valida cada dimensión y permite sumar y eliminar grietas',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'resanes');await user.click(calculateButton());expect(screen.getByLabelText('Largo (m) · Grieta 1')).toHaveFocus();expect(screen.getByText('Ingresa un largo mayor que cero.')).toBeVisible();expect(screen.getByText('Ingresa un ancho mayor que cero.')).toBeVisible();expect(screen.getByText('Ingresa una profundidad mayor que cero.')).toBeVisible();
  for(const [label,value] of [['Largo (m) · Grieta 1','5'],['Ancho promedio (mm) · Grieta 1','10'],['Profundidad promedio (mm) · Grieta 1','10']])await user.type(screen.getByLabelText(label),value);
  await user.click(screen.getByRole('button',{name:/Agregar otra grieta/}));for(const [label,value] of [['Largo (m) · Grieta 2','6'],['Ancho promedio (mm) · Grieta 2','10'],['Profundidad promedio (mm) · Grieta 2','10']])await user.type(screen.getByLabelText(label),value);
  await user.click(calculateButton());expect(screen.getByText('1.1 L de relleno · 2 grietas')).toBeVisible();expect(screen.getByText('2 bolsas completas')).toBeVisible();expect(screen.getByText('$290 MXN',{selector:'.result-total'})).toBeVisible();await user.click(screen.getByText('Ver desglose'));expect(screen.getByText('5 m × 10 mm × 10 mm')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));await user.click(screen.getByRole('button',{name:'Eliminar grieta 2'}));expect(screen.queryByLabelText('Largo (m) · Grieta 2')).not.toBeInTheDocument();await user.click(calculateButton());expect(screen.getByText('1 bolsa completa')).toBeVisible();expect(screen.getByText('$145 MXN',{selector:'.result-total'})).toBeVisible();
 });
 it('sincroniza las cotas del Resanador y conserva las otras grietas al borrar',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'resanador');
  const length=screen.getByLabelText('Largo (m) · Grieta 1');
  const width=screen.getByLabelText<HTMLInputElement>('Ancho promedio (mm) · Grieta 1');
  const depth=screen.getByLabelText('Profundidad promedio (mm) · Grieta 1');
  expect(length).toHaveValue('');
  await user.type(length,'2');
  await user.type(width,'5');
  await user.type(depth,'10');
  expect(screen.getByText(/1 grieta · Volumen estimado/)).toHaveTextContent('0.1 L');
  const gauge=screen.getByRole('button',{name:'Ancho 5 mm'});
  gauge.focus();
  await user.keyboard('{Enter}');
  expect(width).toHaveFocus();
  expect(width.selectionStart).toBe(0);
  expect(width.selectionEnd).toBe(1);
  expect(gauge).toHaveAttribute('data-active','true');
  await user.keyboard('10');
  expect(screen.getByRole('button',{name:'Ancho 10 mm'})).toBeVisible();
  expect(screen.getByText(/1 grieta · Volumen estimado/)).toHaveTextContent('0.2 L');
  await user.clear(width);
  await user.type(width,'5');
  await user.clear(depth);
  await user.type(depth,'20');
  expect(screen.getByText(/1 grieta · Volumen estimado/)).toHaveTextContent('0.2 L');
  await user.click(screen.getByRole('button',{name:/Agregar otra grieta/}));
  const second=screen.getByLabelText('Largo (m) · Grieta 2');
  expect(second).toHaveFocus();
  expect(screen.getByText(/2 grietas · Volumen estimado/)).toHaveTextContent('Pendiente');
  await user.type(second,',5');
  await user.type(screen.getByLabelText('Ancho promedio (mm) · Grieta 2'),'2');
  await user.type(screen.getByLabelText('Profundidad promedio (mm) · Grieta 2'),'5');
  expect(screen.getByText(/2 grietas · Volumen estimado/)).toHaveTextContent('0.205 L');
  await user.click(screen.getByRole('button',{name:'Eliminar grieta 1'}));
  expect(screen.getByLabelText('Largo (m) · Grieta 1')).toBe(second);
  expect(second).toHaveValue(',5');
  expect(screen.getByText(/1 grieta · Volumen estimado/)).toHaveTextContent('0.005 L');
  await user.click(calculateButton());
  expect(screen.getByText('1 bolsa completa')).toBeVisible();
  const editLink=screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector<HTMLAnchorElement>('[href="#cotizador"]')!;
  await user.click(editLink);
  await user.clear(screen.getByLabelText('Largo (m) · Grieta 1'));
  act(()=>{
   window.history.pushState(null,'','#estimado');
   window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading',{name:'¿Cuánto necesitas para resanar?'})).toBeVisible();
  expect(screen.queryByText('1 bolsa completa')).not.toBeInTheDocument();
 });
 it.each([['37.8','1 cubeta completa','$350 MXN'],['75.6','2 cubetas completas','$700 MXN'],['38','2 cubetas completas','$700 MXN'],['80','3 cubetas completas','$1,050 MXN']])('Cemento Plástico: %s m a 10×10 mm cotiza envases completos',async(length,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'plastico');
  await user.type(screen.getByLabelText('Largo (m) · Tramo 1'),length);await user.type(screen.getByLabelText('Ancho promedio (mm) · Tramo 1'),'10');await user.type(screen.getByLabelText('Profundidad promedio (mm) · Tramo 1'),'10');await user.click(calculateButton());expect(screen.getByText(quantity)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();expect(screen.getByText(/Estimación geométrica de consumo/)).toBeVisible();
  await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('3.78 L por cubeta'));expect(write).toHaveBeenCalledWith(expect.stringContaining('no es un rendimiento oficial en m²'));expect(write).not.toHaveBeenCalledWith(expect.stringContaining('bolsa de 2 kg'));expect(write).not.toHaveBeenCalledWith(expect.stringContaining('No usar para grietas con movimiento'));
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Largo (m) · Tramo 1')).toHaveValue(length);expect(screen.getByLabelText('Ancho promedio (mm) · Tramo 1')).toHaveValue('10');expect(screen.getByLabelText('Profundidad promedio (mm) · Tramo 1')).toHaveValue('10');
 });
 it('Cemento Plástico suma tramos antes de redondear, acepta coma y valida dimensiones',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'plastico');await user.click(calculateButton());expect(screen.getByLabelText('Largo (m) · Tramo 1')).toHaveFocus();
  for(const [label,value] of [['Largo (m) · Tramo 1','20'],['Ancho promedio (mm) · Tramo 1','10'],['Profundidad promedio (mm) · Tramo 1','10']])await user.type(screen.getByLabelText(label),value);
  await user.click(screen.getByRole('button',{name:/Agregar otro tramo/}));for(const [label,value] of [['Largo (m) · Tramo 2','17,8'],['Ancho promedio (mm) · Tramo 2','10'],['Profundidad promedio (mm) · Tramo 2','10']])await user.type(screen.getByLabelText(label),value);
  await user.click(calculateButton());expect(screen.getByText('3.78 L de relleno · 2 tramos de sellado')).toBeVisible();expect(screen.getByText('1 cubeta completa')).toBeVisible();expect(screen.getByText('$350 MXN',{selector:'.result-total'})).toBeVisible();await user.click(screen.getByText('Ver desglose'));expect(screen.getByText('3.78 L por cubeta')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));await user.click(screen.getByRole('button',{name:'Eliminar tramo 2'}));expect(screen.queryByLabelText('Largo (m) · Tramo 2')).not.toBeInTheDocument();expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();
 });
 it('actualiza cotas, volumen y geometría de sellado con los mismos campos',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'plastico');
  const length=screen.getByLabelText('Largo (m) · Tramo 1');
  const width=screen.getByLabelText<HTMLInputElement>('Ancho promedio (mm) · Tramo 1');
  const depth=screen.getByLabelText('Profundidad promedio (mm) · Tramo 1');
  const geometry=()=>document.querySelector<SVGRectElement>('[data-seal-fill]')!.style.transform;
  const axes=()=>geometry().match(/scale\(([^,]+), ([^)]+)\)/)!.slice(1).map(Number);
  expect(length).toHaveValue('');
  expect(screen.getByRole('button',{name:'Largo — m'})).toBeVisible();
  await user.type(length,'3');
  await user.type(width,'10');
  await user.type(depth,'5');
  expect(screen.getByText(/1 tramo · Volumen estimado/)).toHaveTextContent('0.15 L');
  expect(screen.queryByText('1 cubeta completa')).not.toBeInTheDocument();
  const [initialWidth,initialDepth]=axes();
  screen.getByRole('button',{name:'Ancho 10 mm'}).focus();
  await user.keyboard('{Enter}');
  expect(width).toHaveFocus();
  expect(width.selectionEnd).toBe(2);
  await user.keyboard('20');
  expect(axes()[0]).toBeGreaterThan(initialWidth);
  expect(axes()[1]).toBe(initialDepth);
  expect(screen.getByText(/1 tramo · Volumen estimado/)).toHaveTextContent('0.3 L');
  await user.clear(width);
  await user.type(width,'10');
  await user.clear(depth);
  await user.type(depth,'10');
  expect(axes()[0]).toBe(initialWidth);
  expect(axes()[1]).toBeGreaterThan(initialDepth);
  expect(screen.getByText(/1 tramo · Volumen estimado/)).toHaveTextContent('0.3 L');
  await user.click(screen.getByRole('button',{name:/Agregar otro tramo/}));
  const second=screen.getByLabelText('Largo (m) · Tramo 2');
  expect(second).toHaveFocus();
  expect(screen.getByText(/2 tramos · Volumen estimado/)).toHaveTextContent('Pendiente');
  await user.type(second,'1,5');
  await user.type(screen.getByLabelText('Ancho promedio (mm) · Tramo 2'),'2');
  await user.type(screen.getByLabelText('Profundidad promedio (mm) · Tramo 2'),'5');
  expect(screen.getByText(/2 tramos · Volumen estimado/)).toHaveTextContent('0.315 L');
  await user.click(screen.getByRole('button',{name:'Eliminar tramo 1'}));
  expect(screen.getByLabelText('Largo (m) · Tramo 1')).toBe(second);
  expect(second).toHaveValue('1,5');
  await user.click(calculateButton());
  expect(screen.getByText('1 cubeta completa')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));
  await user.clear(screen.getByLabelText('Largo (m) · Tramo 1'));
  act(()=>{
   window.history.pushState(null,'','#estimado');
   window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading',{name:'¿Cuánto necesitas para sellar?'})).toBeVisible();
 });
 it.each([['19','1 cubeta completa','$1,300 MXN'],['38','2 cubetas completas','$2,600 MXN'],['38.1','3 cubetas completas','$3,900 MXN'],['500','27 cubetas completas','$35,100 MXN']])('Impercool 5 años cotiza %s m² a dos manos sin duplicar el área',async(area,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'cinco');expect(screen.getByText('19 m² por cubeta de 19 L · 2 manos')).toBeVisible();expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();expect(screen.queryByRole('group',{name:'Espesor del acabado'})).not.toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(1),area);await user.click(calculateButton());
  expect(screen.getByText(quantity)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();expect(screen.getByText(/Sistema a 2 manos/)).toBeVisible();await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('Rendimiento: 19 m² por envase'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Aplicación: 2 manos (incluidas en el rendimiento)'));
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(areaInput(1)).toHaveValue(area);expect(screen.getByRole('heading',{name:'Impercool 5 años'})).toBeVisible();
 });
 it('Impercool 5 años suma superficies con largo por ancho y conserva la edición',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'cinco');await user.click(calculateButton());expect(lengthInput(1)).toHaveFocus();await user.type(lengthInput(1),'5');await user.type(screen.getByLabelText('Ancho de superficie 1 (m)'),'3,8');await user.click(screen.getByRole('button',{name:/Agregar (superficie|otro muro)/}));await user.click(within(screen.getByRole('group',{name:'Superficie 2'})).getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(2),'19');await user.click(calculateButton());expect(screen.getByText('2 cubetas completas')).toBeVisible();expect(screen.getByText('$2,600 MXN',{selector:'.result-total'})).toBeVisible();await user.click(screen.getByText('Ver desglose'));expect(screen.getByText('19.0 m² por envase')).toBeVisible();expect(screen.getByText('2 manos',{selector:'dd'})).toBeVisible();expect(screen.getByRole('button',{name:'Cómo llegar'})).toHaveAttribute('aria-haspopup','dialog');const message=new URL(screen.getByRole('link',{name:'Enviar por WhatsApp'}).getAttribute('href')!).searchParams.get('text');expect(message).toContain('Superficie 1: 5 m de largo × 3.8 m de ancho · 19 m²');expect(message).toContain('Superficie 2: 19 m² (área directa)');expect(screen.queryByRole('dialog')).not.toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Ancho de superficie 1 (m)')).toHaveValue('3,8');expect(areaInput(2)).toHaveValue('19');await user.type(areaInput(2),'0');expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();
 });
 it('la azotea conserva los dos modos y calcula solo las superficies completas',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'cinco');
  const roof=screen.getByRole('complementary',{name:'Resumen de tu azotea'});
  const length=screen.getByLabelText('Largo de superficie 1 (m)') as HTMLInputElement;
  const width=screen.getByLabelText('Ancho de superficie 1 (m)');
  expect(length).toHaveValue('');
  await user.type(length,'5');
  await user.type(width,'4');
  expect(within(roof).getByText('20 m²')).toBeVisible();
  screen.getByRole('button',{name:'Largo 5 m'}).focus();
  await user.keyboard('{Enter}');
  expect(length).toHaveFocus();
  expect(length.selectionEnd).toBe(1);
  await user.keyboard('8');
  expect(within(roof).getByText('32 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));
  expect(screen.queryByRole('button',{name:/^Largo .* m$/})).not.toBeInTheDocument();
  await user.type(areaInput(1),'19');
  expect(within(roof).getByText('19 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Largo × ancho'}));
  expect(lengthInput(1)).toHaveValue('8');
  expect(within(roof).getByText('32 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:/Agregar superficie/}));
  expect(within(roof).getByText('Pendiente')).toBeVisible();
  const second=screen.getByLabelText('Largo de superficie 2 (m)');
  await user.type(second,'5');
  await user.type(screen.getByLabelText('Ancho de superficie 2 (m)'),'4');
  expect(within(roof).getByText('52 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Eliminar superficie 1'}));
  expect(lengthInput(1)).toBe(second);
  expect(within(roof).getByText('20 m²')).toBeVisible();
  await user.click(calculateButton());
  expect(screen.getByText('2 cubetas completas')).toBeVisible();
  const quoteTab=within(screen.getByRole('navigation',{name:'Navegación móvil'})).getByRole('link',{name:'Cotizador'});
  await user.click(quoteTab);
  await user.clear(lengthInput(1));
  act(()=>{
   window.history.pushState(null,'','#estimado');
   window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(screen.getByRole('heading',{name:'¿Cuánto mide tu azotea?'})).toBeVisible();
  expect(screen.queryByText('2 cubetas completas')).not.toBeInTheDocument();
 });
 it('confirma o cancela medidas en el editor móvil sin mezclar superficies',async()=>{
  vi.stubGlobal('matchMedia',(query:string)=>({
   matches:query.includes('pointer: coarse')||query.includes('prefers-reduced-motion'),
   addEventListener:vi.fn(),removeEventListener:vi.fn(),
  }));
  try{
   const user=userEvent.setup();render(<App/>);await openCard(user,'siete');
   const dialog=()=>screen.getByRole('dialog',{name:'Editar superficie 1'});
   await user.click(screen.getByRole('button',{name:'Largo — m'}));
   const length=within(dialog()).getByRole('textbox',{name:'Largo de superficie 1 (m)'});
   expect(length).toHaveFocus();
   expect(length).toHaveAttribute('inputmode','decimal');
   await user.type(length,'10');
   expect(within(dialog()).getByText('Largo 10 m')).toBeVisible();
   await user.click(within(dialog()).getByRole('button',{name:'Aceptar medida'}));
   expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
   expect(length).toHaveValue('10');
   expect(screen.getByText('Ancho (m)').closest('label')).toHaveAttribute('data-next','true');
   const width=screen.getByLabelText('Ancho de superficie 1 (m)');
   await user.type(width,'8');
   expect(within(dialog()).getByText('Ancho 8 m')).toBeVisible();
   expect(within(dialog()).getByText('80 m²')).toBeVisible();
   expect(within(screen.getByRole('complementary',{name:'Resumen de tu azotea'})).getByText('Pendiente')).toBeInTheDocument();
   await user.tab();
   expect(within(dialog()).getByRole('button',{name:'Cancelar'})).toHaveFocus();
   await user.click(within(dialog()).getByRole('button',{name:'Aceptar medida'}));
   expect(within(screen.getByRole('complementary',{name:'Resumen de tu azotea'})).getByText('80 m²')).toBeVisible();
   await user.click(screen.getByRole('button',{name:/Agregar superficie/}));
   const second=screen.getByRole('group',{name:'Superficie 2'});
   await user.click(within(second).getByRole('button',{name:'Ya sé los m²'}));
   await user.type(screen.getByLabelText('Área de superficie 2 (m²)'),'2,5');
   const secondDialog=screen.getByRole('dialog',{name:'Editar superficie 2'});
   expect(within(secondDialog).getByText('2.5 m²')).toBeVisible();
   await user.click(within(secondDialog).getByRole('button',{name:'Aceptar medida'}));
   expect(screen.getByLabelText('Área de superficie 2 (m²)')).toHaveValue('2,5');
   await user.clear(width);
   await user.type(width,'8,');
   expect(within(dialog()).getByText('Pendiente')).toBeVisible();
   await user.click(within(dialog()).getByRole('button',{name:'Aceptar medida'}));
   expect(within(dialog()).getByRole('alert')).toHaveTextContent('Ingresa un ancho mayor que cero.');
   await user.click(within(dialog()).getByRole('button',{name:'Cancelar'}));
   expect(width).toHaveValue('8');
   expect(screen.getByLabelText('Área de superficie 2 (m²)')).toHaveValue('2,5');
  }finally{vi.unstubAllGlobals();}
 });
 it('el rendimiento automático de 5 años no se hereda a otros productos',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'cinco');await user.click(screen.getByRole('button',{name:'Cambiar'}));await pickWork(user,'block');await user.click(screen.getByRole('button',{name:/Adeblok Constructor Cemix/}));expect(screen.queryByText('19 m² por cubeta de 19 L · 2 manos')).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'4 mm'})).toHaveAttribute('aria-pressed','false');
 });
 it.each([['19','1 cubeta completa','$1,600 MXN'],['38','2 cubetas completas','$3,200 MXN'],['38.1','3 cubetas completas','$4,800 MXN'],['100','6 cubetas completas','$9,600 MXN'],['500','27 cubetas completas','$43,200 MXN']])('Impercool 7 años calcula %s m² a dos manos',async(area,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'siete');expect(screen.getByText('19 m² por cubeta de 19 L · 2 manos')).toBeVisible();expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(1),area);await user.click(calculateButton());expect(screen.getByText(quantity)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();expect(screen.getByText(/Sistema a 2 manos/)).toBeVisible();await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('Impercool 7 años'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Aplicación: 2 manos (incluidas en el rendimiento)'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Precio unitario: $1,600 MXN'));expectWhatsAppQuote(write.mock.calls[0][0]);
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(areaInput(1)).toHaveValue(area);expect(screen.getByRole('heading',{name:'Impercool 7 años'})).toBeVisible();
 });
 it('Impercool 7 años suma dimensiones con coma y cambiar a 5 años actualiza el precio',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'azotea');await user.click(screen.getByRole('button',{name:'Cambiar'}));await user.click(screen.getByRole('button',{name:/Impercool 7 años/}));await user.click(calculateButton());expect(lengthInput(1)).toHaveFocus();await user.type(lengthInput(1),'5');await user.type(screen.getByLabelText('Ancho de superficie 1 (m)'),'3,8');await user.click(screen.getByRole('button',{name:/Agregar (superficie|otro muro)/}));await user.click(within(screen.getByRole('group',{name:'Superficie 2'})).getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(2),'19');await user.click(calculateButton());expect(screen.getByText('2 cubetas completas')).toBeVisible();expect(screen.getByText('$3,200 MXN',{selector:'.result-total'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Ancho de superficie 1 (m)')).toHaveValue('3,8');expect(areaInput(2)).toHaveValue('19');await user.click(screen.getByRole('button',{name:'Cambiar'}));await user.click(screen.getByRole('button',{name:/Impercool 5 años/}));expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();await user.click(calculateButton());expect(screen.getByText('$2,600 MXN',{selector:'.result-total'})).toBeVisible();
 });
 it.each([['membrane','0.5','17.62','2 bultos completos','$2,200 MXN'],['membrane','1','100','23 bultos completos','$25,300 MXN'],['membrane','2','10','5 bultos completos','$5,500 MXN'],['sealer','0.5','33.3','1 bulto completo','$1,100 MXN'],['repair','1','8.11','1 bulto completo','$1,100 MXN']])('Base Cemento en %s a %s mm para %s m²',async(use,mm,area,quantity,total)=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user,'diez');await user.selectOptions(screen.getByLabelText('Uso de Base Cemento'),use);expect(screen.queryByLabelText('Rendimiento de ficha técnica (m² por envase)')).not.toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(1),area);await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());expect(screen.getByText(quantity)).toBeVisible();expect(screen.getByText(total,{selector:'.result-total'})).toBeVisible();await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(write).toHaveBeenCalledWith(expect.stringContaining('Preparación:'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Manos: '+(use==='membrane'?2:1)));
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Uso de Base Cemento')).toHaveValue(use);expect(areaInput(1)).toHaveValue(area);expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','true');
 });
 it('Base Cemento vincula las capas al espesor y suma antes de redondear',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'diez');
  const review=screen.getByRole('complementary',{name:'Resumen del estimado'});
  const layers=()=>Array.from(document.querySelectorAll<SVGRectElement>('[data-cement-layer]'));
  const layerHeights=()=>layers().map(layer=>parseFloat(layer.style.height));
  const base=document.querySelector('[data-cement-base]')!.outerHTML;
  expect(layerHeights()).toEqual([0,0]);
  await user.type(lengthInput(1),'5');
  await user.type(screen.getByLabelText('Ancho de superficie 1 (m)'),'4');
  expect(within(review).getByText('20 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'1 mm'}));
  const thin=layerHeights();
  await user.click(screen.getByRole('button',{name:'2 mm'}));
  const thick=layerHeights();
  expect(thick[0]).toBeGreaterThan(thin[0]);
  expect(thick[1]).toBe(thick[0]);
  expect(document.querySelector('[data-cement-base]')!.outerHTML).toBe(base);
  await user.click(calculateButton());
  expect(screen.getByText('10 bultos completos')).toBeVisible();
  expect(screen.getByText('$11,000 MXN',{selector:'.result-total'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));
  await user.selectOptions(screen.getByLabelText('Uso de Base Cemento'),'sealer');
  expect(layerHeights()).toEqual([0]);
  expect(screen.queryByText(/sellado previo ni malla/)).not.toBeInTheDocument();
  await user.click(screen.getByText('Preparación y aplicación'));
  expect(screen.getByText('10 L de agua por bulto de 10 kg')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'0.5 mm'}));
  const first=screen.getByRole('group',{name:'Superficie 1'});
  await user.click(within(first).getByRole('button',{name:'Ya sé los m²'}));
  await user.type(areaInput(1),'10');
  await user.click(screen.getByRole('button',{name:/Agregar superficie/}));
  expect(within(screen.getByRole('complementary',{name:'Resumen del estimado'})).getByText('Pendiente')).toBeVisible();
  const second=screen.getByRole('group',{name:'Superficie 2'});
  await user.click(within(second).getByRole('button',{name:'Ya sé los m²'}));
  await user.type(areaInput(2),'10');
  await user.click(calculateButton());
  expect(screen.getByText('1 bulto completo')).toBeVisible();
 });
 it('Base Cemento exige espesor nuevo al cambiar de uso y ordena las opciones',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user,'diez');const group=screen.getByRole('group',{name:'Espesor por mano'});expect(within(group).getAllByRole('button').map(b=>b.textContent)).toEqual(['0.5','1','2','3']);await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(areaInput(1),'10');await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();await user.click(screen.getByRole('button',{name:'2 mm'}));await user.selectOptions(screen.getByLabelText('Uso de Base Cemento'),'sealer');expect(screen.queryByRole('button',{name:'2 mm'})).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'0.5 mm'})).toHaveAttribute('aria-pressed','false');await user.click(calculateButton());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();
 });
 it.each(Object.entries(thicknessYields))('espesor %s muestra el rendimiento real %s',async(mm,yieldValue)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.click(screen.getByRole('button',{name:`${mm} mm`}));expect(screen.getByText(`${yieldValue.toFixed(1)} m² por bulto de 40 kg`)).toBeVisible();
 });
});
