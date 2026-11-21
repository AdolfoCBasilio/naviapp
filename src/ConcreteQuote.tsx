import {estimate,money,positive} from './calculate';
import {concreteDosages,type Product} from './catalog';
import {format,quantityLabel} from './quoteResult';
import {completeSurfaceArea,type Surface} from './surfaces';

export function estimateConcrete(area:number,depthCm:number,bagsPerM3:number,price?:number){
 const volumeM3=area*depthCm/100;
 const {quantity,total}=estimate(volumeM3*bagsPerM3,1,price);
 return {volumeM3,quantity,total,price};
}

export function ConcreteMix({depth,dosage,technical,errors,onDepth,onDosage}:{
 depth:string;dosage:string;technical:Product['technical'];errors:Record<string,string>;
 onDepth:(value:string)=>void;onDosage:(value:string)=>void;
}){
 return <section className="wall-thickness-panel quote-material-panel">
  <h2>2. Espesor y tipo de mezcla</h2>
  <label htmlFor="concrete-depth">Espesor del colado (cm)
   <input id="concrete-depth" inputMode="decimal" value={depth} placeholder="Ej. 10" onChange={event=>onDepth(event.target.value)}
    aria-invalid={!!errors.depth} aria-describedby={errors.depth?'concrete-depth-error':undefined}/>
   {errors.depth&&<small id="concrete-depth-error" className="error">{errors.depth}</small>}
  </label>
  <fieldset className="concrete-mixes" aria-describedby="concrete-mix-help">
   <legend>Tipo de mezcla</legend>
   <p id="concrete-mix-help" className="muted">Selecciona la mezcla indicada para tu obra. Cada opción muestra cuántos bultos de 25 kg se estiman por m³.</p>
   <div className="concrete-mix-options">
    {concreteDosages.map(({label,strength,bags})=><label key={bags} className="concrete-mix-option">
     <input type="radio" name="concrete-mix" value={bags} checked={dosage===String(bags)}
      onChange={event=>onDosage(event.target.value)} aria-labelledby={`concrete-mix-label-${bags}`}
      aria-invalid={!!errors.coverage}
      aria-describedby={`concrete-mix-details-${bags}${errors.coverage?' concrete-mix-error':''}`}/>
     <span>
      <strong id={`concrete-mix-label-${bags}`}>{label}</strong>
      <span className="concrete-mix-details" id={`concrete-mix-details-${bags}`}>
       <span>{strength} kg/cm²</span><span>{bags} bultos/m³</span>
      </span>
     </span>
    </label>)}
   </div>
   {errors.coverage&&<p id="concrete-mix-error" className="error" role="alert">{errors.coverage}</p>}
  </fieldset>
  {technical&&<details className="thickness-help">
   <summary>De dónde sale la estimación</summary>
   <p>{technical.note}</p>
   <a className="text-button" href={technical.sheet} target="_blank" rel="noopener noreferrer">Ver ficha técnica de Moctezuma</a>
  </details>}
 </section>;
}

export function ConcreteReview({surfaces,depth,dosage,product}:{
 surfaces:Surface[];depth:string;dosage:string;product:Product;
}){
 const area=completeSurfaceArea(surfaces);
 const volume=area===null?NaN:area*positive(depth)/100;
 let preview:ReturnType<typeof estimateConcrete>|undefined;
 if(area!==null&&Number.isFinite(volume)&&concreteDosages.some(option=>String(option.bags)===dosage)){
  try{preview=estimateConcrete(area,positive(depth),Number(dosage),product.price);}catch{/* The form reports out-of-range measurements on submit. */}
 }
 return <aside className="wall-review" aria-labelledby="concrete-review-title">
  <h2 id="concrete-review-title">3. Revisa tu estimado</h2>
  <div aria-live="polite">
   <dl>
    <div><dt>Volumen de concreto</dt><dd>{Number.isFinite(volume)?`${format(volume)} m³`:'Pendiente'}</dd></div>
    <div><dt>Precio por bulto</dt><dd>{product.price===undefined?'Consulta precio':money(product.price)}</dd></div>
   </dl>
   {preview&&<div className="quote-preview">
    <p>{quantityLabel(preview.quantity,product.unit,product.plural)}</p>
    <strong>{preview.total===undefined?'Consulta precio':money(preview.total)}</strong>
   </div>}
  </div>
  <button type="submit" className="primary calculate">Ver estimado</button>
  <p className="form-note">Costo del cemento · Estimado sin merma</p>
 </aside>;
}
