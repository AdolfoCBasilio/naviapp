import {useState} from 'react';
import type {Product} from './catalog';

export function ProductMedia({product}: {product: Product}) {
 const [failed,setFailed]=useState(false);
 return <div className="product-media">
  {product.image&&!failed ? <><img src={product.image} alt={product.name} style={{transform:`scale(${product.imageScale ?? 1})`}} loading="lazy" width="554" height="554" onError={()=>setFailed(true)}/>{product.imageNote&&<span className="image-note">{product.imageNote}</span>}</> :
   <div className="image-placeholder"><svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" aria-hidden="true"><path d="M7 5h18v22H7zM11 11h10M11 16h10M11 21h6"/></svg><span>Foto pendiente</span></div>}
 </div>;
}
