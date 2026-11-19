import {useRef,useState} from 'react';
import {ContactConfirmation} from './ContactConfirmation';
import {money} from './calculate';
import type {Product} from './catalog';
import {crackMeasure,formatVolume,volumeReference} from './CrackMeasurements';
import {mapsUrl,whatsappMessageUrl} from './contact';
import {LocationIcon,WhatsAppIcon} from './HeaderContact';
import {ProductMedia} from './ProductMedia';
import {coverageDisplay,format,quantityLabel,theoreticalNote,type QuoteResult} from './quoteResult';

const measureIcons={
 area:'M3 20V5h18v15H3ZM3 12h18M9 5v7m6 0v8',
 thickness:'m2 8 10-5 10 5-10 5-10-5Zm0 4 10 5 10-5M2 16l10 5 10-5',
 volume:'M12 2c-2.5 4-7 8.1-7 12a7 7 0 1 0 14 0c0-3.9-4.5-8-7-12Z',
 hands:'M4 5h15v5H4zM19 7h3v6H12v3m-2 0h4v6h-4z',
 use:'M4 19V9l8-5 8 5v10H4Zm5 0v-5h6v5',
};

function EstimateIcon({path}:{path:string}){
 return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path}/></svg>;
}

const directionsAction={
 title:'¿Quieres ver cómo llegar?',
 confirm:'Sí, quiero ver dónde está NAVI',
 cancel:'No por ahora',
 url:mapsUrl,
};

export function EstimateResult({result,product}:{result:QuoteResult;product:Product}){
 const [showDirections,setShowDirections]=useState(false);
 const directionsButton=useRef<HTMLButtonElement>(null);
 const [copyStatus,setCopyStatus]=useState<'copied'|'failed'>();
 const volume=result.kind==='cracks'?volumeReference(product):undefined;
 const system=result.kind==='area'?product.areaCoverage:undefined;
 const {application}=result;
 const coats=application?.coats??system?.coats;
 const price=result.price===undefined?'Consulta precio':money(result.price);
 const total=result.total===undefined?'Consulta precio':money(result.total);
 const materialCalculation=result.kind==='cracks'
  ?`${formatVolume(result.volumeLitres)} L ÷ ${result.coverage} L`
  :application
   ?`${format(result.area)} m² × ${application.coats} ${application.coats===1?'mano':'manos'} ÷ ${coverageDisplay(application.tableCoverage,product.id)} m²`
   :`${format(result.area)} m² ÷ ${coverageDisplay(result.coverage,product.id)} m²`;
 const areaUnit=product.category==='Muros y acabados'?' de muro':product.work==='azotea'?' de azotea':product.work==='piso'?' de piso o losa':'';
 const measures:{icon:keyof typeof measureIcons;text:string}[]=[];
 if(result.kind==='area')measures.push({icon:'area',text:`${format(result.area)} m²${areaUnit}`});
 if(result.kind==='cracks'&&volume)measures.push({icon:'volume',text:`${formatVolume(result.volumeLitres)} L de relleno · ${result.cracks.length} ${result.cracks.length===1?volume.item:volume.plural}`});
 if(result.thickness)measures.push({icon:'thickness',text:`${result.thickness} mm ${application?'por mano':'de espesor'}`});
 if(coats)measures.push({icon:'hands',text:`${coats} ${coats===1?'mano':'manos'}`});
 if(application)measures.push({icon:'use',text:application.label});

 const copy=async()=>{
  try{
   await navigator.clipboard.writeText(result.summary);
   setCopyStatus('copied');
  }catch{setCopyStatus('failed');}
 };

 return <section className="estimate-view" aria-label="Resultado del estimado">
  <div className="estimate-card">
   <div className="estimate-product">
    <ProductMedia product={product}/>
    <div><h2>{product.name}</h2><p>{product.presentation}</p></div>
   </div>
   <div className="estimate-highlight">
    <p className="result-quantity">{quantityLabel(result.quantity,product.unit,product.plural)}</p>
    <p className={`result-total${result.total===undefined?' result-unpriced':''}`}>{total}</p>
    <p className="estimate-note">{result.total===undefined?'Estimado sin merma':'Total estimado · Sin merma'}</p>
   </div>
   <ul className="estimate-measures" aria-label="Medidas del estimado">
    {measures.map(({icon,text})=><li key={icon}><EstimateIcon path={measureIcons[icon]}/><span>{text}</span></li>)}
   </ul>
  </div>
  <details className="technical-details">
   <summary><span><strong>Ver desglose</strong><small>Cantidad y precio unitario</small></span><EstimateIcon path="m6 9 6 6 6-6"/></summary>
   <dl className="estimate-details">
    <div><dt>Cantidad × precio unitario</dt><dd>{result.price===undefined?`${result.quantity} × Consulta precio`:`${result.quantity} × ${price}`}</dd></div>
    <div><dt>Total estimado</dt><dd>{total}</dd></div>
    {result.kind==='cracks'&&volume?<>
     <div><dt>{volume.referenceLabel}</dt><dd>{result.coverage} L por {volume.container}</dd></div>
     {result.cracks.map((crack,index)=><div key={crack.id}><dt>{volume.itemTitle} {index+1}</dt>
      <dd>{format(crackMeasure(crack.length))} m × {format(crackMeasure(crack.width))} mm × {format(crackMeasure(crack.depth))} mm</dd></div>)}
     <div><dt>Volumen total</dt><dd>{formatVolume(result.volumeLitres)} L</dd></div>
    </>:<>
     <div><dt>{result.theoretical?'Rendimiento teórico':'Rendimiento'}</dt><dd>{coverageDisplay(application?.tableCoverage??result.coverage,product.id)} m² por {application?'bulto y mano':'envase'}</dd></div>
     {application&&<div><dt>Espesor por mano</dt><dd>{result.thickness} mm</dd></div>}
    </>}
    {coats&&<div><dt>{application?'Manos consideradas':'Aplicación incluida'}</dt><dd>{coats} {coats===1?'mano':'manos'}</dd></div>}
    <div><dt>Cálculo de material</dt><dd>{materialCalculation}</dd></div>
   </dl>
   <p className="muted">{volume&&'Se suman los volúmenes rectangulares: largo (m) × ancho (mm) × profundidad (mm) ÷ 1,000 = litros. '}Confirma precio y disponibilidad con NAVI antes de comprar. Las condiciones de la superficie pueden cambiar el consumo.</p>
  </details>
  <a className="primary estimate-whatsapp" href={whatsappMessageUrl(result.summary)} target="_blank" rel="noopener noreferrer">
   <WhatsAppIcon/><span>Enviar por WhatsApp</span>
  </a>
  <div className="estimate-secondary-actions">
   <button type="button" className="secondary" onClick={copy}><EstimateIcon path="M8 8h12v13H8zM5 16H3V3h12v2"/><span>Copiar cotización</span></button>
   <button type="button" className="secondary" aria-haspopup="dialog" ref={directionsButton} onClick={()=>setShowDirections(true)}><LocationIcon/><span>Cómo llegar</span></button>
  </div>
  <ContactConfirmation action={showDirections?directionsAction:undefined} onClose={()=>{
   setShowDirections(false);directionsButton.current?.focus();
  }}/>
  <p className="copy-status" role="status">{copyStatus==='copied'?'Cotización copiada':copyStatus==='failed'?'No se pudo copiar. Puedes seleccionar y copiar el resumen.':''}</p>
  {copyStatus==='failed'&&<label>Resumen para copiar<textarea readOnly value={result.summary}/></label>}
  {application&&<aside className="coverage-reference"><h2>Preparación y aplicación</h2><p>{application.water}</p><p>{application.note}</p></aside>}
  {system&&<p className="coverage-summary">Sistema a {system.coats} manos · {system.note}</p>}
  {volume&&<aside className="crack-reference"><p>{volume.note}</p></aside>}
  {result.theoretical&&<aside className="theoretical-note"><strong>Estimado teórico · No oficial</strong><p>{theoreticalNote}</p></aside>}
 </section>;
}
