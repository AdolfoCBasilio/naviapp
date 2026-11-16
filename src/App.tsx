import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {categories,products,thicknessYields} from './catalog';
import {estimate,money,positive} from './calculate';
import {ProductMedia} from './ProductMedia';
import {BrandLogo} from './BrandLogo';

const works=[['block','Dar acabado a un muro de block'],['concreto','Recubrir concreto liso'],['piso','Nivelar un piso'],['azotea','Impermeabilizar una azotea'],['resanes','Resanar grietas'],['sellados','Hacer sellados puntuales'],['otros','Otros acabados']];
type View='catalogo'|'cotizador'|'estimado';
type Surface={mode:'area'|'dimensions';area:string;length:string;side:string};
const blank=():Surface=>({mode:'area',area:'',length:'',side:''});
const initialView=():View=>window.location.hash==='#cotizador'||window.location.hash==='#estimado'?'cotizador':'catalogo';
type Result=ReturnType<typeof estimate>&{productId:string;thickness:string;coverage:number;summary:string};
const format=(n:number)=>n.toLocaleString('es-MX',{maximumFractionDigits:3});
const quantityLabel=(quantity:number,unit:string,plural:string)=>`${quantity} ${quantity===1?unit:plural} ${unit==='bulto'?(quantity===1?'completo':'completos'):(quantity===1?'completa':'completas')}`;

export default function App(){
 const [view,setView]=useState<View>(initialView);
 const [search,setSearch]=useState(''),[category,setCategory]=useState('Todas');
 const [categoryOpen,setCategoryOpen]=useState(false);
 const categoryButton=useRef<HTMLButtonElement>(null),categorySelect=useRef<HTMLSelectElement>(null);
 const [work,setWork]=useState(''),[productId,setProductId]=useState('');
 const [changing,setChanging]=useState(false);
 const [surfaces,setSurfaces]=useState<Surface[]>([blank()]);
 const [thickness,setThickness]=useState(''),[coverage,setCoverage]=useState('');
 const [errors,setErrors]=useState<Record<string,string>>({});
 const [result,setResult]=useState<Result|null>(null),[copyStatus,setCopyStatus]=useState('');
 const catalogScroll=useRef(0),heading=useRef<HTMLHeadingElement>(null),form=useRef<HTMLFormElement>(null);
 const previousView=useRef<View>(view);
 const product=products.find(p=>p.id===productId);
 const reset=()=>{setResult(null);setErrors({});setCopyStatus('');};
 const navigate=(next:View)=>{
  if(view==='catalogo')catalogScroll.current=window.scrollY;
  if(next===view)return;
  window.history.pushState(null,'',`#${next}`);setView(next);
 };
 useEffect(()=>{
  const sync=()=>{if(previousView.current==='catalogo')catalogScroll.current=window.scrollY;const hash=window.location.hash;setView(hash==='#estimado'&&result?'estimado':hash==='#cotizador'||hash==='#estimado'?'cotizador':'catalogo');};
  window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[result]);
 useLayoutEffect(()=>{
  window.scrollTo({top:view==='catalogo'?catalogScroll.current:0,behavior:'instant'});
  if(previousView.current!==view)heading.current?.focus({preventScroll:true});
  previousView.current=view;
 },[view]);
 useEffect(()=>{if(categoryOpen)categorySelect.current?.focus();},[categoryOpen]);
 useEffect(()=>{if(Object.keys(errors).length)form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();},[errors]);
 const closeCategories=()=>{setCategoryOpen(false);categoryButton.current?.focus();};
 const choose=(id:string)=>{const selected=products.find(p=>p.id===id)!;setProductId(id);setWork(selected.work);setCoverage('');setThickness('');reset();};
 const startQuote=(id:string)=>{choose(id);setSurfaces([blank()]);setChanging(false);navigate('cotizador');};
 const update=(i:number,key:keyof Surface,value:string)=>{setSurfaces(s=>s.map((v,j)=>i===j?{...v,[key]:value}:v));reset();};
 const totalArea=surfaces.reduce((sum,s)=>sum+(s.mode==='area'?(positive(s.area)||0):(positive(s.length)||0)*(positive(s.side)||0)),0);
 const dimensionName=product&&['block','concreto','otros'].includes(product.work)?'alto':'ancho';
 const calculate=()=>{
  if(!product)return;
  const next:Record<string,string>={};let area=0;
  surfaces.forEach((s,i)=>{
   if(s.mode==='area'){const n=positive(s.area);if(!Number.isFinite(n))next[`${i}-area`]='Ingresa un área mayor que cero.';else area+=n;}
   else{const l=positive(s.length),w=positive(s.side);if(!Number.isFinite(l))next[`${i}-length`]='Ingresa un largo mayor que cero.';if(!Number.isFinite(w))next[`${i}-side`]='Ingresa una medida mayor que cero.';if(Number.isFinite(l)&&Number.isFinite(w)){if(Number.isFinite(l*w))area+=l*w;else next[`${i}-length`]='Las medidas son demasiado grandes.';}}
  });
  const yieldValue=product.id==='constructor'?thicknessYields[thickness]:positive(coverage);
  if(!yieldValue||!Number.isFinite(yieldValue))next.coverage=product.id==='constructor'?'Elige el espesor para conocer el rendimiento.':'Falta el rendimiento confirmado de la ficha técnica, en m² por envase.';
  setErrors(next);setResult(null);if(Object.keys(next).length)return;
  let calculated:ReturnType<typeof estimate>;
  try{calculated=estimate(area,yieldValue,product.price);}catch{setErrors({coverage:'Las medidas son demasiado grandes. Revisa las superficies y el rendimiento.'});return;}
  const summary=`NAVI · Estimado sin merma\n${product.name} · ${product.presentation}\nÁrea: ${format(area)} m²${thickness?' · Espesor: '+thickness+' mm':''}\nRendimiento: ${yieldValue} m² por envase\nCantidad: ${quantityLabel(calculated.quantity,product.unit,product.plural)}\nPrecio unitario: ${product.price===undefined?'Consulta precio':money(product.price)}\n${calculated.total===undefined?'Total por confirmar':'Total: '+money(calculated.total)}`;
  setResult({...calculated,productId,thickness,coverage:yieldValue,summary});setCopyStatus('');navigate('estimado');
 };
 const field=(i:number,key:'area'|'length'|'side',label:string)=><label htmlFor={`surface-${i}-${key}`}>{label}<input id={`surface-${i}-${key}`} aria-label={label} inputMode="decimal" value={surfaces[i][key]} placeholder="0" aria-invalid={!!errors[`${i}-${key}`]} aria-describedby={errors[`${i}-${key}`]?`error-${i}-${key}`:undefined} onChange={e=>update(i,key,e.target.value)}/>{errors[`${i}-${key}`]&&<small className="error" id={`error-${i}-${key}`}>{errors[`${i}-${key}`]}</small>}</label>;
 const visibleProducts=products.filter(p=>(category==='Todas'||p.category===category)&&p.name.toLocaleLowerCase('es-MX').includes(search.trim().toLocaleLowerCase('es-MX')));
 const resultProduct=result?products.find(p=>p.id===result.productId):undefined;
 const tabs=<>{(['catalogo','cotizador'] as const).map(tab=><a key={tab} href={`#${tab}`} aria-current={(view==='catalogo'?tab==='catalogo':tab==='cotizador')?'page':undefined} onClick={e=>{e.preventDefault();navigate(tab);}}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{tab==='catalogo'?<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></>:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></>}</svg>{tab==='catalogo'?'Catálogo':'Cotizador'}</a>)}</>;
 return <>
  <a className="skip-link" href="#contenido">Ir al contenido</a>
  <header className="site-header"><div className="header-inner"><a className="brand" href="#catalogo" aria-label="NAVI · Ir al catálogo" onClick={e=>{e.preventDefault();navigate('catalogo');}}><BrandLogo/></a><nav className="desktop-nav" aria-label="Navegación principal">{tabs}</nav></div></header>
  <main id="contenido" className={view==='catalogo'?'catalog-view':'quote-view'}>
   {view==='catalogo'?<>
    <div className="eyebrow">CATÁLOGO</div><h1 ref={heading} tabIndex={-1}>Materiales para tu obra</h1><p className="catalog-count">{visibleProducts.length} productos <span>· Precios en MXN</span></p>
    <div className="catalog-tools"><label className="search"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><span className="sr-only">Buscar por nombre</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar productos" type="search"/></label>
     <button ref={categoryButton} className="category-button" aria-expanded={categoryOpen} aria-controls="category-selector" onClick={()=>setCategoryOpen(v=>!v)}>☷ <span>Categorías <small>{category}</small></span><span aria-hidden="true">⌄</span></button>
     {categoryOpen&&<div id="category-selector" className="category-selector" onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();closeCategories();}}}><label>Categoría activa<select ref={categorySelect} value={category} onChange={e=>setCategory(e.target.value)}>{['Todas',...categories].map(c=><option key={c}>{c}</option>)}</select></label><button className="secondary" onClick={closeCategories}>Ver resultados</button></div>}
    </div>
    <div className="products">{visibleProducts.map(p=><article className="product" key={p.id} data-product-id={p.id}><ProductMedia product={p}/><div className="product-content"><h2>{p.name}</h2><p className="presentation">{p.presentation}</p><div className="product-footer"><strong>{p.price===undefined?'Consulta precio':money(p.price)}</strong><a className="quote-link" href="#cotizador" onClick={e=>{e.preventDefault();startQuote(p.id);}}>Cotizar</a></div></div></article>)}</div>
    {!visibleProducts.length&&<div className="empty-state" role="status"><h2>No encontramos productos</h2><p>Prueba otro nombre o elige Todas las categorías.</p><button className="secondary" onClick={()=>{setSearch('');setCategory('Todas');}}>Mostrar todos</button></div>}
   </>:<>
    <a className="back-link" href="#catalogo" onClick={e=>{e.preventDefault();navigate('catalogo');}}>← Volver al catálogo</a>
    <div className="eyebrow">COTIZADOR</div><h1 ref={heading} tabIndex={-1}>{view==='estimado'&&result?'Tu estimado':'Cotiza tu obra'}</h1>
    {view==='estimado'&&result&&resultProduct?<section className="estimate-view" aria-label="Resultado del estimado">
     <div className="estimate-highlight"><p className="result-quantity">{quantityLabel(result.quantity,resultProduct.unit,resultProduct.plural)}</p><p className="result-total">{result.total===undefined?'Total por confirmar':money(result.total)}</p></div>
     <div className="selected-product"><ProductMedia key={resultProduct.id} product={resultProduct}/><div><h2>{resultProduct.name}</h2><p>{resultProduct.presentation}</p></div></div>
     <dl className="estimate-details"><div><dt>Área</dt><dd>{format(result.area)} m²</dd></div>{result.thickness&&<div><dt>Espesor</dt><dd>{result.thickness} mm</dd></div>}<div><dt>Rendimiento</dt><dd>{result.coverage.toFixed(1)} m² por envase</dd></div><div><dt>Precio unitario</dt><dd>{result.price===undefined?'Consulta precio':money(result.price)}</dd></div></dl>
     <p className="estimate-note">Estimado sin merma</p><p className="muted">Confirma precio y disponibilidad con NAVI antes de comprar.</p>
     <button className="copy-button" onClick={async()=>{try{await navigator.clipboard.writeText(result.summary);setCopyStatus('Cotización copiada al portapapeles.');}catch{setCopyStatus('No se pudo copiar. Puedes seleccionar y copiar el resumen.');}}}>▣ Copiar cotización</button><p className="copy-status" role="status">{copyStatus}</p>{copyStatus.startsWith('No se')&&<label>Resumen para copiar<textarea readOnly value={result.summary}/></label>}
     <button className="text-button edit-button" onClick={()=>{setResult(null);setCopyStatus('');navigate('cotizador');}}>Editar medidas</button>
    </section>:<form ref={form} noValidate onSubmit={e=>{e.preventDefault();calculate();}}>
     {(!product||changing)&&<section className="product-picker" aria-label="Elegir material"><label>¿Qué quieres hacer?<select value={work} onChange={e=>{const w=e.target.value;if(w){choose(products.find(p=>p.work===w)!.id);setChanging(true);}else{setWork('');setProductId('');reset();}}}><option value="">Elige el tipo de trabajo</option>{works.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>{product&&<><label>Producto sugerido<select value={productId} onChange={e=>choose(e.target.value)}>{products.filter(p=>p.work===work).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>{changing&&<button type="button" className="secondary" onClick={()=>setChanging(false)}>Usar este material</button>}</>}</section>}
     {product&&<>
      <div className="selected-product"><ProductMedia key={product.id} product={product}/><div><h2>{product.name}</h2><p>{product.presentation}</p><p>{product.price===undefined?'Consulta precio':`${money(product.price)} por ${product.unit}`}</p></div>{!changing&&<button type="button" className="change-button" onClick={()=>{setChanging(true);reset();}}>Cambiar</button>}</div>
      {product.spot?<div className="spot" role="status"><h2>Veamos el daño de cerca</h2><p>Envía a NAVI una foto y las medidas del daño: largo, ancho y profundidad. Para resanes y sellados puntuales no calculamos la cantidad solo con m².</p><p>Contacta a la tienda por tu canal habitual.</p></div>:<>
       <h2 className="measure-heading">Tus medidas</h2>
       {surfaces.map((s,i)=><fieldset className="surface" key={i}><legend>Superficie {i+1}</legend><div className="segmented" role="group" aria-label={`Forma de medir superficie ${i+1}`}><button type="button" aria-pressed={s.mode==='area'} onClick={()=>update(i,'mode','area')}>Área en m²</button><button type="button" aria-pressed={s.mode==='dimensions'} onClick={()=>update(i,'mode','dimensions')}>Largo × {dimensionName}</button></div><div className="measurements">{s.mode==='area'?field(i,'area',`Área de superficie ${i+1} (m²)`):<>{field(i,'length',`Largo de superficie ${i+1} (m)`)}{field(i,'side',`${dimensionName==='alto'?'Alto':'Ancho'} de superficie ${i+1} (m)`)}</>}</div>{surfaces.length>1&&<button type="button" className="remove text-button" onClick={()=>{setSurfaces(s=>s.filter((_,j)=>i!==j));reset();}}>Eliminar superficie {i+1}</button>}</fieldset>)}
       <div className="surface-total"><button type="button" className="text-button" onClick={()=>{setSurfaces(s=>[...s,blank()]);reset();}}>＋ Agregar superficie</button><p>Área total <strong>{Number.isFinite(totalArea)?format(totalArea):'—'} m²</strong></p></div>
       {product.id==='constructor'?<fieldset className="thickness" aria-describedby="coverage-help coverage-error"><legend>Espesor del acabado <span>(mm)</span></legend><div className="thickness-options" role="group" aria-label="Espesor del acabado">{Object.keys(thicknessYields).map(mm=><button type="button" key={mm} aria-label={`${mm} mm`} aria-pressed={thickness===mm} aria-invalid={!!errors.coverage} onClick={()=>{setThickness(mm);reset();}}>{mm}</button>)}</div><p id="coverage-help" className="muted">{thickness?`${thicknessYields[thickness].toFixed(1)} m² por bulto de 40 kg`:'Elige un espesor para ver el rendimiento por bulto de 40 kg.'}</p></fieldset>:<label>Rendimiento de ficha técnica (m² por envase)<input aria-label="Rendimiento de ficha técnica (m² por envase)" value={coverage} inputMode="decimal" placeholder="Rendimiento confirmado" aria-invalid={!!errors.coverage} aria-describedby="coverage-help coverage-error" onChange={e=>{setCoverage(e.target.value);reset();}}/><small id="coverage-help">Consulta la ficha técnica para tu aplicación, espesor y número de manos. No tenemos un rendimiento confirmado para este producto.</small></label>}
       <small id="coverage-error" className="error" role={errors.coverage?'alert':undefined}>{errors.coverage}</small>
       <button type="submit" className="primary calculate">Calcular estimado</button><p className="form-note">Envases completos. Estimado sin merma.</p>
      </>}
     </>}
    </form>}
   </>}
  </main>
  <footer>NAVI · Materiales y Acabados<span>Martínez de la Torre, Veracruz</span></footer>
  <nav className="mobile-nav" aria-label="Navegación móvil">{tabs}</nav>
 </>;
}
