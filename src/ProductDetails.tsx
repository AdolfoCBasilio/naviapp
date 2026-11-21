import {useId,useLayoutEffect,useRef} from 'react';
import {baseCementoApplications,thicknessYieldsByProduct,type Product} from './catalog';
import {money} from './calculate';
import {whatsappMessageUrl} from './contact';
import {WhatsAppIcon} from './HeaderContact';
import {ProductMedia} from './ProductMedia';
import {format} from './quoteResult';

function productYield(product:Product){
 const area=product.areaCoverage;
 if(area)return `Aprox. ${format(area.m2PerContainer)} m² por ${product.unit} con ${area.coats} manos.`;

 const thickness=thicknessYieldsByProduct[product.id];
 if(thickness){
  const examples=Object.entries(thickness);
  const [firstMm,firstArea]=examples[0];
  const [lastMm,lastArea]=examples[examples.length-1];
  return `Aprox. ${format(firstArea)} m² por ${product.unit} a ${firstMm} mm o ${format(lastArea)} m² a ${lastMm} mm.`;
 }
 if(product.id==='diez'){
  const {coats,yields}=baseCementoApplications.membrane;
  return `Como membrana, aprox. ${format(yields['2']/coats)} m² por bulto con ${coats} manos de 2 mm cada una.`;
 }
 if(product.volumeYieldLitres!==undefined){
  const litres=format(product.volumeYieldLitres);
  return product.id==='plastico'
   ?`Varía según el tamaño del sellado. Contenido nominal de ${litres} L por cubeta.`
   :`Aprox. ${litres} L de relleno por ${product.unit}.`;
 }
 return 'Consulta el rendimiento con NAVI.';
}

export function ProductDetails({product,onClose,onQuote}:{
 product:Product|null;
 onClose:()=>void;
 onQuote:(id:string)=>void;
}){
 const dialog=useRef<HTMLDialogElement>(null);
 const pointerStartedOnBackdrop=useRef(false);
 const titleId=useId();
 useLayoutEffect(()=>{
  if(product&&!dialog.current?.open)dialog.current?.showModal();
 },[product]);

 return <dialog ref={dialog} className="product-details" aria-labelledby={titleId} onClose={onClose}
  onPointerDown={event=>{pointerStartedOnBackdrop.current=event.target===event.currentTarget;}}
  onClick={event=>{
   if(pointerStartedOnBackdrop.current&&event.target===event.currentTarget)dialog.current?.close();
   pointerStartedOnBackdrop.current=false;
  }}>
  {product&&<>
   <div className="product-details-toolbar">
    <button type="button" className="product-details-close" aria-label="Cerrar" autoFocus onClick={()=>dialog.current?.close()}>
     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18"/>
     </svg>
    </button>
   </div>
   <div className="product-details-body">
    <div className="product-details-overview">
     <div aria-hidden="true"><ProductMedia key={product.id} product={product}/></div>
     <div>
      <h2 id={titleId}>{product.name}</h2>
      <p className="presentation">{product.presentation}</p>
      <p className="product-details-price">{product.price===undefined?'Consulta precio':money(product.price)}</p>
     </div>
    </div>
    <dl>
     <div><dt>Para qué sirve</dt><dd>{product.use}</dd></div>
     <div><dt>Rendimiento</dt><dd>{productYield(product)}</dd></div>
    </dl>
   </div>
   <div className="product-details-actions">
    {product.quotable!==false&&<button type="button" className="primary" onClick={()=>onQuote(product.id)}>Cotizar material</button>}
    <a className={`product-availability ${product.quotable===false?'primary':'secondary'}`} target="_blank" rel="noopener noreferrer"
     href={whatsappMessageUrl(`Hola, NAVI. ¿Tienen disponible ${product.name} (${product.presentation})?`)}>
     <WhatsAppIcon/> Disponibilidad por WhatsApp
    </a>
   </div>
  </>}
 </dialog>;
}
