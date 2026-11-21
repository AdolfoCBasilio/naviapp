import {money} from './calculate';
import {whatsappMessageUrl} from './contact';
import {WhatsAppIcon} from './HeaderContact';
import {format,quantityLabel,type QuoteResult} from './quoteResult';
import {formatVolume} from './CrackMeasurements';
import type {Product} from './catalog';

export type QuoteItem={
 id:number;
 product:Product;
 result:QuoteResult;
};

export function MultiProductQuote({items,onCatalog,onEdit,onRemove}:{
 items:QuoteItem[];
 onCatalog:()=>void;
 onEdit:(id:number)=>void;
 onRemove:(id:number)=>void;
}){
 const subtotal=items.reduce((sum,{result})=>sum+(result.total??0),0);
 const pending=items.filter(({result})=>result.total===undefined).length;
 const totalLabel=pending?'Subtotal con precios disponibles':'Total estimado';
 const lines=items.map(({id,product,result})=>{
  const size=result.kind==='area'?`${format(result.area)} m²`:`${formatVolume(result.volumeLitres)} L`;
  const details=[
   size,
   result.thickness&&`${result.thickness} mm${result.application?' por mano':''}`,
   result.application?.label,
   result.theoretical&&'Cálculo teórico',
  ].filter(Boolean).join(' · ');
  return {
   id,product,
   details,
   quantity:quantityLabel(result.quantity,product.unit,product.plural),
   cost:result.total===undefined?'Consulta precio':money(result.total),
  };
 });
 const summary=[
  'NAVI · Cotización de materiales sin merma',
  ...lines.map(({product,details,quantity,cost},index)=>
   `${index+1}. ${product.name} · ${product.presentation}\n${details}\n${quantity} · ${cost}`),
  `${totalLabel}: ${money(subtotal)}`,
  ...(pending?['Quedan materiales por confirmar precio.']:[]),
 ].join('\n\n');

 return <>
  {items.length>0?<>
   <ul className="multi-quote-items" aria-label="Materiales de mi cotización">
    {lines.map(({id,product,details,quantity,cost},index)=>{
     const label=`${product.name}, partida ${index+1}`;
     return <li key={id} className="estimate-card multi-quote-item">
      <h2>{product.name}</h2>
      <p className="muted">{product.presentation} · {details}</p>
      <p className="multi-quote-cost"><span>{quantity}</span><strong>{cost}</strong></p>
      <div className="multi-quote-actions">
       <button type="button" className="secondary" aria-label={`Editar ${label}`} onClick={()=>onEdit(id)}>Editar</button>
       <button type="button" className="secondary" aria-label={`Quitar ${label}`} onClick={()=>onRemove(id)}>Quitar</button>
      </div>
     </li>;
    })}
   </ul>
   <div className="estimate-card multi-quote-total" aria-live="polite">
    <p>{totalLabel}</p>
    <strong>{money(subtotal)}</strong>
    {pending>0&&<p className="muted">Quedan materiales por confirmar precio.</p>}
   </div>
   <p className="form-note">Estimado sin merma. Confirma precio y disponibilidad con NAVI.</p>
   <a className="primary estimate-whatsapp" href={whatsappMessageUrl(summary)} target="_blank" rel="noopener noreferrer">
    <WhatsAppIcon/> Enviar cotización por WhatsApp
   </a>
  </>:<p className="muted">Calcula un estimado y agrégalo aquí para armar tu cotización.</p>}
  <button type="button" className="secondary multi-quote-link" onClick={onCatalog}>{items.length?'Agregar otro material':'Ir al catálogo'}</button>
 </>;
}
