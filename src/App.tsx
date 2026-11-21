import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {categories,products,thicknessYieldsByProduct,morteroTheoreticalYields,baseCementoApplications,type BaseCementoUse,type Product} from './catalog';
import {estimate,estimateVolume,money,positive} from './calculate';
import {searchCatalog} from './catalogSearch';
import {ProductMedia} from './ProductMedia';
import {ProductDetails} from './ProductDetails';
import {BrandLogo} from './BrandLogo';
import {Welcome} from './Welcome';
import {HeaderContact} from './HeaderContact';
import {EstimateResult} from './EstimateResult';
import {MultiProductQuote} from './MultiProductQuote';
import {readQuoteProgress,storeQuoteProgress,type QuoteProgress,type SavedQuoteItem} from './quoteProgress';
import {coverageDisplay,format,capturedMeasure,quantityLabel,theoreticalNote,type QuoteResult} from './quoteResult';
import {WorkPicker} from './WorkPicker';
import {BaseCementApplication,BaseCementReview} from './BaseCementQuote';
import {RoofMeasurements,RoofReview} from './RoofMeasurements';
import {FloorMeasurements} from './FloorMeasurements';
import {MortarSection} from './FloorDiagram';
import {WallFinishDetail} from './WallDiagram';
import {WallMeasurements} from './WallMeasurements';
import {blankSurface as blank,surfaceArea,type Surface} from './surfaces';
import {VolumeMeasurements} from './RepairMeasurements';
import {blankCrack,volumeReference,crackFieldId,crackMeasure,crackVolume,formatVolume,type Crack} from './CrackMeasurements';

type View='inicio'|'catalogo'|'cotizador'|'estimado'|'cotizacion';
function viewFromLocation(hasResult=false):View {
 switch(window.location.hash){
  case '#catalogo': return 'catalogo';
  case '#cotizador': return 'cotizador';
  case '#cotizacion': return 'cotizacion';
  case '#estimado': return hasResult?'estimado':'cotizador';
  default: return 'inicio';
 }
}
const getRoofCoverage=(product?:Product)=>product?.work==='azotea'?product.areaCoverage:undefined;


export default function App(){
 const [saved]=useState(readQuoteProgress);
 const [view,setView]=useState<View>(()=>viewFromLocation(!!saved?.result));
 const [search,setSearch]=useState(''),[category,setCategory]=useState('Todas');
 const [detailsProduct,setDetailsProduct]=useState<Product|null>(null);
 const detailsTrigger=useRef<HTMLButtonElement>(null);
 const [work,setWork]=useState(saved?.work??''),[productId,setProductId]=useState(saved?.productId??'');
 const [changing,setChanging]=useState(saved?.changing??false);
 const [surfaces,setSurfaces]=useState<Surface[]>(()=>saved?.surfaces??[blank()]);
 const [thickness,setThickness]=useState(saved?.thickness??''),[coverage,setCoverage]=useState(saved?.coverage??'');
 const [cracks,setCracks]=useState<Crack[]>(()=>saved?.cracks??[blankCrack()]);
 const [baseUse,setBaseUse]=useState<BaseCementoUse>(saved?.baseUse??'membrane');
 const [morteroMode,setMorteroMode]=useState<'cemix'|'theoretical'>(saved?.morteroMode??'cemix');
 const [errors,setErrors]=useState<Record<string,string>>({});
 const [result,setResult]=useState<QuoteResult|null>(saved?.result??null);
 const [quoteItems,setQuoteItems]=useState<SavedQuoteItem[]>(saved?.quoteItems??[]);
 const [editingItem,setEditingItem]=useState<number|null>(saved?.editingItem??null);
 const [storageFailed,setStorageFailed]=useState(false);
 const lastProgress=useRef<string>(undefined);
 const nextItemId=useRef(quoteItems.reduce((next,item)=>Math.max(next,item.id+1),1));
 const content=useRef<HTMLElement>(null);
 const catalogScroll=useRef(0),heading=useRef<HTMLHeadingElement>(null),form=useRef<HTMLFormElement>(null);
 const previousView=useRef<View>(view);
 const product=products.find(p=>p.id===productId);
 const pickingProduct=view==='cotizador'&&(!product||changing);
 const pickingWork=pickingProduct&&!work;
 const wallProduct=product?.category==='Muros y acabados';
 const floorProduct=product?.id==='mortero';
 const wallFlow=(wallProduct||floorProduct)&&view==='cotizador'&&!changing;
 const roofCoverage=getRoofCoverage(product);
 const roofProduct=!!roofCoverage||product?.id==='diez';
 const roofFlow=roofProduct&&view==='cotizador'&&!changing;
 const volumeFlow=!!product?.volumeYieldLitres&&view==='cotizador'&&!changing;
 const theoretical=productId==='mortero'&&morteroMode==='theoretical';
 const baseApplication=productId==='diez'?baseCementoApplications[baseUse]:undefined;
 const baseFlow=roofFlow&&!!baseApplication;
 const baseThicknessLabel=baseApplication?.coats===1?'Espesor':'Espesor por mano';
 const productYields=baseApplication?baseApplication.yields:theoretical?morteroTheoreticalYields:product?thicknessYieldsByProduct[product.id]:undefined;
 const reset=()=>{setResult(null);setErrors({});};
 const navigate=(next:View)=>{
  if(view==='catalogo')catalogScroll.current=content.current?.scrollTop ?? 0;
  if(next===view)return;
  window.history.pushState(null,'',next==='inicio'?'/':`#${next}`);setView(next);
 };
 useEffect(()=>{
  const sync=()=>{
   if(previousView.current==='catalogo')catalogScroll.current=content.current?.scrollTop ?? 0;
   setView(viewFromLocation(!!result));
  };
  window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
  return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
 },[result]);
 useEffect(()=>{
  const progress:QuoteProgress={work,productId,changing,surfaces,thickness,coverage,cracks,baseUse,morteroMode,result,quoteItems,editingItem};
  const serialized=JSON.stringify(progress);
  // Opening the app in another tab should not write back a snapshot before it has changed.
  if(lastProgress.current!==undefined && lastProgress.current!==serialized){
   setStorageFailed(!storeQuoteProgress(serialized));
  }
  lastProgress.current=serialized;
 },[work,productId,changing,surfaces,thickness,coverage,cracks,baseUse,morteroMode,result,quoteItems,editingItem]);
 useLayoutEffect(()=>{
  content.current?.scrollTo({top:view==='catalogo'?catalogScroll.current:0,behavior:'instant'});
  if(previousView.current!==view){
   heading.current?.focus({preventScroll:true});
   if(previousView.current==='catalogo')setDetailsProduct(null);
  }
  previousView.current=view;
 },[view]);
 useEffect(()=>{
  const viewport=window.visualViewport;
  const resize=()=>{
   document.documentElement.style.setProperty('--app-height',`${viewport?.height??window.innerHeight}px`);
   document.documentElement.style.setProperty('--viewport-top',`${viewport?.offsetTop??0}px`);
  };
  const sizeTarget=viewport??window;
  resize();
  sizeTarget.addEventListener('resize',resize);
  viewport?.addEventListener('scroll',resize);
  return()=>{
   sizeTarget.removeEventListener('resize',resize);
   viewport?.removeEventListener('scroll',resize);
   document.documentElement.style.removeProperty('--app-height');
   document.documentElement.style.removeProperty('--viewport-top');
  };
 },[]);
 useLayoutEffect(()=>{
  if(!pickingProduct)return;
  content.current?.scrollTo({top:0,behavior:'instant'});
  heading.current?.focus({preventScroll:true});
 },[pickingProduct,work]);
 useLayoutEffect(()=>{if(view==='cotizador'&&product&&!changing){content.current?.scrollTo({top:0,behavior:'instant'});heading.current?.focus({preventScroll:true});}},[view,productId,changing]);
 useEffect(()=>{if(Object.keys(errors).length)form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();},[errors]);
 const choose=(id:string,fresh=false)=>{
  const selected=products.find(p=>p.id===id);
  if(!selected||selected.quotable===false)return;
  const selectedRoof=!!getRoofCoverage(selected)||selected.id==='diez';
  const crossesRoof=selectedRoof!==roofProduct;
  const empty=surfaces.length===1&&surfaces.every(s=>!s.area&&!s.length&&!s.side);
  if(fresh||selected.category!==product?.category||(crossesRoof&&empty)){
   const dimensions=selected.category==='Muros y acabados'||selected.id==='mortero'||selectedRoof;
   setSurfaces([blank(dimensions?'dimensions':'area')]);
  }
  setProductId(id);setWork(selected.work);setCoverage('');setThickness('');setMorteroMode('cemix');setBaseUse('membrane');setCracks([blankCrack()]);setChanging(false);reset();
 };
 const startQuote=(id:string)=>{setEditingItem(null);choose(id,true);navigate('cotizador');};
 const update=(i:number,key:keyof Surface,value:string)=>{setSurfaces(s=>s.map((v,j)=>i===j?{...v,[key]:value}:v));reset();};
 const totalArea=surfaces.reduce((sum,s)=>sum+(surfaceArea(s) ?? 0),0);
 const dimensionName=product&&['block','concreto','otros'].includes(product.work)?'alto':'ancho';
 const calculate=()=>{
  if(!product||changing)return;
  if(product.volumeYieldLitres){
   const config=volumeReference(product);
   const next:Record<string,string>={};let volume=0;
   cracks.forEach(c=>{
    const values={length:crackMeasure(c.length),width:crackMeasure(c.width),depth:crackMeasure(c.depth)};
    for(const key of ['length','width','depth'] as const)if(!Number.isFinite(values[key]))next[crackFieldId(c,key)]=`Ingresa ${key==='length'?'un largo':key==='width'?'un ancho':'una profundidad'} mayor que cero.`;
    if(Object.values(values).every(Number.isFinite))try{volume+=crackVolume(c);}catch{next[crackFieldId(c,'length')]='Las medidas son demasiado grandes o pequeñas. Revisa este registro.';}
   });
   setErrors(next);setResult(null);if(Object.keys(next).length)return;
   try{
    const calculated=estimateVolume(volume,product.volumeYieldLitres,product.price);
    const dimensions=cracks.map((c,i)=>`${config.itemTitle} ${i+1}: ${capturedMeasure(crackMeasure(c.length))} m de largo × ${capturedMeasure(crackMeasure(c.width))} mm de ancho × ${capturedMeasure(crackMeasure(c.depth))} mm de profundidad · ${formatVolume(crackVolume(c))} L`).join('\n');
    const summary=`NAVI · Estimado sin merma\n${product.name} · ${product.presentation}\n${dimensions}\nVolumen estimado: ${formatVolume(volume)} L\n${config.referenceLabel}: ${product.volumeYieldLitres} L por ${config.container}\nCantidad: ${quantityLabel(calculated.quantity,product.unit,product.plural)}\nPrecio unitario: ${product.price===undefined?'Consulta precio':money(product.price)}\n${calculated.total===undefined?'Total: Consulta precio':'Total: '+money(calculated.total)}\n\n${config.note}`;
    setResult({...calculated,kind:'cracks',productId,thickness:'',coverage:product.volumeYieldLitres,summary,theoretical:false,cracks:cracks.map(c=>({...c}))});navigate('estimado');
   }catch{setErrors({volume:'El volumen está fuera del rango de cálculo. Revisa las medidas.'});}
   return;
  }
  const next:Record<string,string>={};let area=0;
  surfaces.forEach((s,i)=>{
   if(s.mode==='area'){const n=positive(s.area);if(!Number.isFinite(n))next[`${i}-area`]='Ingresa un área mayor que cero.';else area+=n;}
   else{const l=positive(s.length),w=positive(s.side);if(!Number.isFinite(l))next[`${i}-length`]='Ingresa un largo mayor que cero.';if(!Number.isFinite(w))next[`${i}-side`]='Ingresa una medida mayor que cero.';if(Number.isFinite(l)&&Number.isFinite(w)){const measured=surfaceArea(s);if(measured!==null)area+=measured;else next[`${i}-length`]='Las medidas están fuera del rango de cálculo.';}}
  });
  const tableYield=productYields?productYields[thickness]:product.areaCoverage?.m2PerContainer ?? positive(coverage);
  const yieldValue=baseApplication?tableYield/baseApplication.coats:tableYield;
  if(!yieldValue||!Number.isFinite(yieldValue))next.coverage=productYields?'Elige el espesor para conocer el rendimiento.':'Falta el rendimiento confirmado de la ficha técnica, en m² por envase.';
  setErrors(next);setResult(null);if(Object.keys(next).length)return;
  let calculated:ReturnType<typeof estimate>;
  try{calculated=estimate(area,yieldValue,product.price);}catch{setErrors({coverage:'Las medidas son demasiado grandes. Revisa las superficies y el rendimiento.'});return;}
  const dimensions=surfaces.map((surface,index)=>{
   const name=wallProduct?'Muro':'Superficie';
   const measured=`${capturedMeasure(surfaceArea(surface)!)} m²`;
   if(surface.mode==='area')return `${name} ${index+1}: ${measured} (área directa)`;
   return `${name} ${index+1}: ${capturedMeasure(positive(surface.length))} m de largo × ${capturedMeasure(positive(surface.side))} m de ${dimensionName} · ${measured}`;
  }).join('\n');
  const summary=`NAVI · Estimado sin merma\n${product.name} · ${product.presentation}\nÁrea: ${format(area)} m²${thickness?' · Espesor: '+thickness+' mm':''}\n${dimensions}\nRendimiento: ${baseApplication?`${tableYield} m² por bulto y mano\nUso: ${baseApplication.label}\nManos: ${baseApplication.coats}\nEspesor por mano: ${thickness} mm\nPreparación: ${baseApplication.water}\n${baseApplication.note}`:`${yieldValue} m² por envase`}${product.areaCoverage?`\nAplicación: ${product.areaCoverage.coats} manos (incluidas en el rendimiento)\n${product.areaCoverage.note}`:''}\nCantidad: ${quantityLabel(calculated.quantity,product.unit,product.plural)}\nPrecio unitario: ${product.price===undefined?'Consulta precio':money(product.price)}\n${calculated.total===undefined?'Total: Consulta precio':'Total: '+money(calculated.total)}${theoretical?'\n\n'+theoreticalNote+'\nBase: 1.33 m² a 10 mm por bulto de 25 kg. Rendimiento teórico = 1.33 × 10 ÷ espesor (mm).':''}`;
  setResult({...calculated,kind:'area',productId,thickness,coverage:yieldValue,summary,theoretical,application:baseApplication?{label:baseApplication.label,coats:baseApplication.coats,water:baseApplication.water,note:baseApplication.note,tableCoverage:tableYield}:undefined});navigate('estimado');
 };
 const field=(i:number,key:'area'|'length'|'side',label:string)=><label htmlFor={`surface-${i}-${key}`}>{label}<input id={`surface-${i}-${key}`} aria-label={label} inputMode="decimal" value={surfaces[i][key]} placeholder="0" aria-invalid={!!errors[`${i}-${key}`]} aria-describedby={errors[`${i}-${key}`]?`error-${i}-${key}`:undefined} onChange={e=>update(i,key,e.target.value)}/>{errors[`${i}-${key}`]&&<small className="error" id={`error-${i}-${key}`}>{errors[`${i}-${key}`]}</small>}</label>;
 const yieldSelector=!product?null:productYields?<fieldset className="thickness" aria-describedby="coverage-help coverage-error"><legend>{wallProduct?'Espesor de la capa':baseApplication?baseThicknessLabel:product.id==='mortero'?'Espesor de nivelación':'Espesor del acabado'} <span>(mm)</span></legend><div className="thickness-options" style={{gridTemplateColumns:`repeat(${Math.min(5,Object.keys(productYields).length)}, minmax(0, 1fr))`}} role="group" aria-label={wallProduct?'Espesor de la capa':baseApplication?baseThicknessLabel:product.id==='mortero'?'Espesor de nivelación':'Espesor del acabado'}>{Object.keys(productYields).sort((a,b)=>Number(a)-Number(b)).map(mm=><button type="button" key={mm} aria-label={`${mm} mm`} aria-pressed={thickness===mm} aria-invalid={!!errors.coverage} onClick={()=>{setThickness(mm);reset();}}>{wallProduct||floorProduct?`${mm} mm`:mm}</button>)}</div><p id="coverage-help" className="muted">{thickness?`${coverageDisplay(productYields[thickness],product.id)} m² por ${product.presentation.toLowerCase()}${baseApplication?' y mano':''}`:`Elige un espesor para ver el rendimiento por ${product.presentation.toLowerCase()}.`}</p></fieldset>:product.areaCoverage?<aside className="coverage-reference" id="coverage-help"><h2>Rendimiento Cemix</h2><p><strong>{product.areaCoverage.m2PerContainer} m² por cubeta de 19 L · {product.areaCoverage.coats} manos</strong></p><p>{product.areaCoverage.note}</p></aside>:<label>Rendimiento de ficha técnica (m² por envase)<input aria-label="Rendimiento de ficha técnica (m² por envase)" value={coverage} inputMode="decimal" placeholder="Rendimiento confirmado" aria-invalid={!!errors.coverage} aria-describedby="coverage-help coverage-error" onChange={e=>{setCoverage(e.target.value);reset();}}/><small id="coverage-help">Consulta la ficha técnica para tu aplicación, espesor y número de manos. No tenemos un rendimiento confirmado para este producto.</small></label>;
 const visibleProducts=searchCatalog(search,category);
 const resultProduct=result?products.find(p=>p.id===result.productId):undefined;
 const showingEstimate=view==='estimado'&&!!result&&!!resultProduct;
 const editEstimate=()=>{reset();navigate('cotizador');};
 const saveQuoteItem=()=>{
  if(!result||!resultProduct)return;
  const id=editingItem??nextItemId.current++;
  const item={id,product:resultProduct,result,surfaces,coverage,cracks,baseUse,morteroMode};
  setQuoteItems(items=>editingItem===null?[...items,item]:items.map(saved=>saved.id===id?item:saved));
  setEditingItem(id);
  navigate('cotizacion');
 };
 const editQuoteItem=(id:number)=>{
  const item=quoteItems.find(saved=>saved.id===id);
  if(!item)return;
  setEditingItem(id);
  setProductId(item.product.id);setWork(item.product.work);setChanging(false);
  setSurfaces(item.surfaces);setCracks(item.cracks);
  setThickness(item.result.thickness);setCoverage(item.coverage);
  setBaseUse(item.baseUse);setMorteroMode(item.morteroMode);
  editEstimate();
 };
 const removeQuoteItem=(id:number)=>{
  setQuoteItems(items=>items.filter(item=>item.id!==id));
  if(editingItem===id)setEditingItem(null);
 };
 if(view==='inicio')return <Welcome contentRef={content} headingRef={heading} onNavigate={()=>navigate('catalogo')}/>;
 const tabs=<>{(['catalogo','cotizador'] as const).map(tab=><a key={tab} href={`#${tab}`} aria-current={(view===tab||(view==='estimado'&&tab==='cotizador'))?'page':undefined} onClick={e=>{e.preventDefault();navigate(tab);}}><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">{tab==='catalogo'?<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></>:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h8"/></>}</svg>{tab==='catalogo'?'Catálogo':'Cotizador'}</a>)}</>;
 return <>
  <a className="skip-link" href="#contenido" onClick={event=>{event.preventDefault();heading.current?.focus();}}>Ir al contenido</a>
  <header className={`site-header${pickingWork?' work-header':''}${showingEstimate?' estimate-header':''}`}><div className="header-inner"><div className="header-start">{pickingWork&&<a className="work-home-link" href="/" onClick={event=>{
   if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();navigate('inicio');
  }}>← Inicio</a>}{showingEstimate?<button type="button" className="estimate-edit" onClick={editEstimate}>
   <span aria-hidden="true">←</span> Editar medidas
  </button>:<HeaderContact key={view}/>}</div><nav className="desktop-nav" aria-label="Navegación principal">{tabs}</nav><a className="brand" href="#catalogo" aria-label="NAVI · Ir al catálogo" onClick={e=>{e.preventDefault();navigate('catalogo');}}><BrandLogo/></a></div></header>
  <main ref={content} id="contenido" className={view==='catalogo'?'catalog-view':showingEstimate?'quote-view estimate-page':pickingWork?'quote-view work-view':volumeFlow?'quote-view repair-quote-view':roofFlow?'quote-view roof-quote-view':wallFlow?`quote-view wall-quote-view${wallProduct?' animated-wall-view':''}`:'quote-view'}>
   {storageFailed&&<p className="error" role="status">Este navegador no pudo guardar tu avance. Mantén abierta esta pestaña para conservarlo.</p>}
   {view==='catalogo'?<>
    <div className="eyebrow">CATÁLOGO</div><h1 ref={heading} tabIndex={-1}>Materiales para tu obra</h1><p className="catalog-count">{visibleProducts.length} productos <span>· Precios en MXN</span></p>
    <button type="button" className="secondary multi-quote-link" onClick={()=>navigate('cotizacion')}>Ver mi cotización ({quoteItems.length})</button>
    <div className="catalog-tools"><label className="search"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/></svg><span className="sr-only">Buscar por producto o trabajo</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Busca un producto o trabajo" type="search"/></label>

    </div>
    <div className="quick-filters" role="group" aria-label="Categorías rápidas">{[['Todas','Todas'],...categories.map(value=>[value==='Muros y acabados'?'Muros':value,value])].map(([label,value])=><button key={value} aria-pressed={category===value} onClick={()=>setCategory(value)}>{label}</button>)}</div>
    <p className="active-filter">{category==='Todas'?'Todos los materiales':category} · {visibleProducts.length} resultados</p>
    <div className="products">{visibleProducts.map(p=><article className="product" key={p.id} data-product-id={p.id}>
     <ProductMedia product={p}/>
     <div className="product-content">
      <h2><button type="button" className="product-details-trigger" aria-haspopup="dialog" onClick={event=>{
       detailsTrigger.current=event.currentTarget;setDetailsProduct(p);
      }}>{p.name}</button></h2>
      <p className="presentation">{p.presentation}</p>
      <div className="product-footer"><strong>{p.price===undefined?'Consulta precio':money(p.price)}</strong>{p.quotable!==false&&<a className="quote-link" href="#cotizador" onClick={e=>{e.preventDefault();startQuote(p.id);}}>Cotizar</a>}</div>
     </div>
    </article>)}</div>
    <ProductDetails product={detailsProduct} onQuote={startQuote} onClose={()=>{setDetailsProduct(null);detailsTrigger.current?.focus();}}/>
    {!visibleProducts.length&&<div className="empty-state" role="status"><h2>No encontramos productos</h2><p>Prueba con «gotera», «grieta» o «nivelar piso», o elige Todas las categorías.</p><button className="secondary" onClick={()=>{setSearch('');setCategory('Todas');}}>Mostrar todos</button></div>}
   </>:view==='cotizacion'?<>
    <h1 ref={heading} tabIndex={-1}>Mi cotización</h1>
    <MultiProductQuote items={quoteItems} onCatalog={()=>navigate('catalogo')} onEdit={editQuoteItem} onRemove={removeQuoteItem}/>
   </>:<>
    {pickingProduct?(work&&<button type="button" className="back-link work-back" onClick={()=>setWork('')}>← Cambiar tipo de trabajo</button>):
     !showingEstimate&&<a className="back-link" href="#catalogo" onClick={e=>{e.preventDefault();navigate('catalogo');}}>← Volver al catálogo</a>}
    <div className="eyebrow">COTIZADOR</div><h1 ref={heading} tabIndex={-1}>{view==='estimado'&&result?'Tu estimado':product&&!changing?(wallProduct?'Cotiza el acabado de tu muro':floorProduct?'¿Cuánto mide tu piso o losa?':baseFlow?'Mide tu superficie':roofFlow?'¿Cuánto mide tu azotea?':volumeFlow?(product.id==='plastico'?'¿Cuánto necesitas para sellar?':'¿Cuánto necesitas para resanar?'):'Tus medidas'):pickingWork?'¿Qué quieres hacer?':'Elige un material'}</h1>
    {showingEstimate&&result&&resultProduct?<EstimateResult product={resultProduct} result={result} onSave={saveQuoteItem} editingItem={editingItem!==null}/>:<form ref={form} className={roofFlow?`roof-quote-form${baseFlow?' base-cement-form':''}`:wallFlow?`wall-quote-form${wallProduct?' animated-wall-form':''}`:undefined} noValidate onSubmit={e=>{e.preventDefault();calculate();}}>
     {pickingProduct&&<section className={pickingWork?'work-picker':'product-picker'} aria-label={pickingWork?'Elegir tipo de trabajo':'Elegir material'}>
      {pickingWork?<WorkPicker onPick={setWork}/>:<>
       <h2 className="suggestion-heading">Material sugerido</h2>
       <div className="material-options">{products.filter(p=>p.work===work&&p.quotable!==false).map(p=><button type="button" className="material-option" key={p.id} onClick={()=>choose(p.id)}><ProductMedia product={p}/><span><strong>{p.name}</strong><small>{p.presentation} · {p.price===undefined?'Consulta precio':money(p.price)}</small></span><span aria-hidden="true">→</span></button>)}</div>
      </>}
      {product&&<button type="button" className="text-button" onClick={()=>{setWork(product.work);setChanging(false);}}>Cancelar cambio</button>}
     </section>}
     {product&&!changing&&<>
      <div className={roofFlow?'roof-quote-main':wallFlow?`wall-form-main${wallProduct?' wall-composition':''}`:undefined}>
      <div className="selected-product"><ProductMedia key={product.id} product={product}/><div><h2>{product.name}</h2><p>{product.presentation}</p><p>{product.price===undefined?'Consulta precio':`${money(product.price)} por ${product.unit}`}</p></div><button type="button" className="change-button" onClick={()=>{setChanging(true);reset();}}>Cambiar</button></div>
      {roofFlow?<RoofMeasurements heading={baseFlow?'1. Superficie a impermeabilizar':undefined} surfaces={surfaces} errors={errors} onChange={next=>{setSurfaces(next);reset();}}/>:volumeFlow?<VolumeMeasurements product={product} cracks={cracks} errors={errors} onChange={next=>{setCracks(next);reset();}}/>:product.spot?<div className="spot" role="status"><h2>Veamos el daño de cerca</h2><p>Envía a NAVI una foto y las medidas del daño: largo, ancho y profundidad. Para resanes y sellados puntuales no calculamos la cantidad solo con m².</p><p>Contacta a la tienda por tu canal habitual.</p></div>:<>
       {wallProduct?<WallMeasurements surfaces={surfaces} errors={errors} onChange={next=>{setSurfaces(next);reset();}}/>:floorProduct?<FloorMeasurements surfaces={surfaces} errors={errors} onChange={next=>{setSurfaces(next);reset();}}/>:<>
       <h2 className="measure-heading">Superficies de tu obra</h2>
       {surfaces.map((s,i)=><fieldset className="surface" key={i}><legend>Superficie {i+1}</legend><div className="segmented" role="group" aria-label={`Forma de medir superficie ${i+1}`}><button type="button" aria-pressed={s.mode==='area'} onClick={()=>update(i,'mode','area')}>Área en m²</button><button type="button" aria-pressed={s.mode==='dimensions'} onClick={()=>update(i,'mode','dimensions')}>Largo × {dimensionName}</button></div><div className="measurements">{s.mode==='area'?field(i,'area',`Área de superficie ${i+1} (m²)`):<>{field(i,'length',`Largo de superficie ${i+1} (m)`)}{field(i,'side',`${dimensionName==='alto'?'Alto':'Ancho'} de superficie ${i+1} (m)`)}</>}</div>{surfaces.length>1&&<button type="button" className="remove text-button" onClick={()=>{setSurfaces(s=>s.filter((_,j)=>i!==j));reset();}}>Eliminar superficie {i+1}</button>}</fieldset>)}
       <div className="surface-total"><button type="button" className="text-button" onClick={()=>{setSurfaces(s=>[...s,blank()]);reset();}}>＋ Agregar superficie</button><p>Área total <strong>{Number.isFinite(totalArea)?format(totalArea):'—'} m²</strong></p></div>
       </>}
       {floorProduct&&<section className="yield-mode floor-thickness" aria-label="Método de cálculo del mortero">
        <h2>2. Espesor de nivelación</h2><div className="mortar-intro"><MortarSection thickness={thickness}/><p>Grosor de la capa de mortero</p></div>
        <button type="button" className="text-button" aria-pressed={!theoretical} onClick={()=>{setMorteroMode('cemix');setThickness('');reset();}}>Rendimientos Cemix</button>
        <p className="muted">Tabla de Cemix para espesores de aplicación de 10 a 50 mm.</p>
        {!theoretical&&yieldSelector}
        <details className="thickness-help" open={theoretical||undefined}><summary>Ver cálculo teórico (avanzado)</summary><button type="button" className="text-button" aria-pressed={theoretical} onClick={()=>{setMorteroMode('theoretical');setThickness('');reset();}}>Cálculo teórico 3–7 mm</button><aside className="theoretical-note"><strong>Referencia matemática · No oficial</strong><p>{theoreticalNote}</p><p>Base: 1.33 m² a 10 mm por bulto de 25 kg. Se supone consumo proporcional al espesor.</p></aside>{theoretical&&yieldSelector}</details>
        <p className="method-status" role="status">Método activo: {theoretical?'Estimación teórica · No oficial':'Tabla Cemix'}</p>
       </section>}
       {wallProduct&&<section className="wall-thickness-panel" aria-label="Espesor de la capa"><h2>2. Espesor de la capa</h2><p>Selecciona el espesor del acabado.</p>{yieldSelector}<small id="coverage-error" className="error" role={errors.coverage?'alert':undefined}>{errors.coverage}</small><WallFinishDetail thickness={thickness}/><details className="thickness-help"><summary>No sé qué espesor elegir</summary><p>Confirma el espesor con quien realizará la aplicación y con la ficha técnica del producto. Depende del acabado que necesitas y de las condiciones, irregularidades y preparación del muro. Esta ayuda no selecciona ni recomienda un espesor automáticamente.</p></details></section>}
       {!floorProduct&&!wallProduct&&yieldSelector}
       {!wallProduct&&<small id="coverage-error" className="error" role={errors.coverage?'alert':undefined}>{errors.coverage}</small>}
       {!wallProduct&&!floorProduct&&<><button type="submit" className="primary calculate">Calcular estimado</button><p className="form-note">Envases completos. Estimado sin merma.</p></>}
      </>}
      </div>
      {baseFlow&&baseApplication&&<>
       <BaseCementApplication use={baseUse} application={baseApplication} thickness={thickness}
        selector={yieldSelector} error={errors.coverage}
        onChange={use=>{setBaseUse(use);setThickness('');reset();}}/>
       <BaseCementReview surfaces={surfaces} application={baseApplication} thickness={thickness}/>
      </>}
      {roofFlow&&roofCoverage&&<RoofReview product={{...product,areaCoverage:roofCoverage}} surfaces={surfaces} error={errors.coverage}/>}
      {wallFlow&&<aside className="wall-review" aria-label="Revisa tus datos"><h2>Revisa tus datos</h2><p className="wall-review-product">{product.name}<span>{product.presentation}</span></p><dl><div><dt>{floorProduct?'Superficies':'Muros'}</dt><dd>{surfaces.length}</dd></div><div><dt>Área total</dt><dd>{surfaces.some(s=>surfaceArea(s)!==null)&&Number.isFinite(totalArea)?format(totalArea):'—'} m²</dd></div><div><dt>Espesor</dt><dd>{thickness?`${thickness} mm`:'Por elegir'}</dd></div>{floorProduct&&<div><dt>Método</dt><dd>{theoretical?'Teórico · No oficial':'Tabla Cemix'}</dd></div>}<div><dt>Precio por {product.unit}</dt><dd>{product.price===undefined?'Consulta precio':money(product.price)}</dd></div></dl>{surfaces.some(s=>surfaceArea(s)===null)&&<p className="wall-review-pending">Hay superficies con medidas pendientes o inválidas.</p>}<button type="submit" className="primary calculate">Calcular material y costo</button><p className="form-note">Envases completos · Estimado sin merma</p></aside>}
     </>}
    </form>}
   </>}
   {!showingEstimate&&<footer>NAVI · Materiales y Acabados<span>Martínez de la Torre, Veracruz</span></footer>}
  </main>
  <nav className="mobile-nav" aria-label="Navegación móvil">{tabs}</nav>
 </>;
}
