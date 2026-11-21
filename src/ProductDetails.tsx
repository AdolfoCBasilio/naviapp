import {useId,useLayoutEffect,useRef} from 'react';
import {baseCementoApplications,thicknessYieldsByProduct,type Product} from './catalog';
import {whatsappMessageUrl} from './contact';
import {WhatsAppIcon} from './HeaderContact';
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

export function ProductDetails({product,onClose}:{product:Product|null;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const titleId=useId();
 useLayoutEffect(()=>{
  if(product&&!dialog.current?.open)dialog.current?.showModal();
 },[product]);

 return <dialog ref={dialog} className="product-details" aria-labelledby={titleId} onClose={onClose}>
  {product&&<>
   <h2 id={titleId}>{product.name}</h2>
   <p className="presentation">{product.presentation}</p>
   <dl>
    <dt>Para qué sirve</dt>
    <dd>{product.use}</dd>
    <dt>Rendimiento</dt>
    <dd>{productYield(product)}</dd>
   </dl>
   <a className="primary product-availability" target="_blank" rel="noopener noreferrer"
    href={whatsappMessageUrl(`Hola, NAVI. ¿Tienen disponible ${product.name} (${product.presentation})?`)}>
    <WhatsAppIcon/> Consultar disponibilidad por WhatsApp
   </a>
   <button type="button" className="secondary" autoFocus onClick={()=>dialog.current?.close()}>Cerrar</button>
  </>}
 </dialog>;
}
