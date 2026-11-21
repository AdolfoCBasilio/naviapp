import {estimate,money} from './calculate';
import type {Product} from './catalog';
import {format,quantityLabel} from './quoteResult';
import {completeSurfaceArea,type Surface} from './surfaces';

export function TileAdhesiveThickness({thickness,yields,technical,error,onChange}:{
 thickness:string;
 yields:Record<string,number>;
 technical:Product['technical'];
 error?:string;
 onChange:(value:string)=>void;
}){
 return <section className="wall-thickness-panel quote-material-panel" aria-labelledby="quote-material-panel-title">
  <h2 id="quote-material-panel-title">2. Espesor del adhesivo</h2>
  <p>Elige el grosor de la capa después de colocar la pieza.</p>
  <div className="tile-yield-options" role="group" aria-label="Espesor del adhesivo" aria-describedby={error?'coverage-error':undefined}>
   {Object.entries(yields).map(([mm,coverage])=><button type="button" key={mm} aria-pressed={thickness===mm}
    aria-label={`${mm} mm`} aria-describedby={`tile-yield-${mm}`} aria-invalid={!!error} onClick={()=>onChange(mm)}>
    <strong>{mm} mm</strong>
    <span id={`tile-yield-${mm}`}>{format(coverage)} m² por bulto</span>
   </button>)}
  </div>
  {error&&<p id="coverage-error" className="error" role="alert">{error}</p>}
  {technical&&<details className="thickness-help">
   <summary>Cómo elegir el espesor</summary>
   <p>{technical.note}</p>
   <a className="text-button" href={technical.sheet} target="_blank" rel="noopener noreferrer">Ver ficha técnica de Cemix</a>
  </details>}
 </section>;
}

export function TileAdhesiveReview({surfaces,product,thickness,coverage}:{
 surfaces:Surface[];
 product:Product;
 thickness:string;
 coverage?:number;
}){
 const area=completeSurfaceArea(surfaces);
 let preview:ReturnType<typeof estimate>|undefined;
 if(area!==null&&coverage!==undefined){
  try{preview=estimate(area,coverage,product.price);}catch{/* The form reports out-of-range measurements on submit. */}
 }
 return <aside className="wall-review tile-review" aria-labelledby="tile-review-title">
  <h2 id="tile-review-title">3. Revisa tu estimado</h2>
  <div aria-live="polite">
   <dl>
    <div><dt>Área total</dt><dd>{area===null?'Pendiente':`${format(area)} m²`}</dd></div>
    <div><dt>Espesor</dt><dd>{thickness?`${thickness} mm`:'Por elegir'}</dd></div>
   </dl>
   {preview?<div className="quote-preview">
    <p>{quantityLabel(preview.quantity,product.unit,product.plural)}</p>
    <strong>{preview.total===undefined?'Consulta precio':money(preview.total)}</strong>
   </div>:<p className="muted">{area===null||coverage===undefined?'Completa las medidas y elige un espesor para ver la cantidad y el costo.':'Revisa las medidas para calcular el estimado.'}</p>}
  </div>
  <button type="submit" className="primary calculate">Ver estimado</button>
  <p className="form-note">Envases completos · Estimado sin merma</p>
 </aside>;
}
