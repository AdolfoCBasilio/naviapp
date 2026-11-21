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
  <label htmlFor="concrete-mix">Tipo de mezcla
   <select id="concrete-mix" value={dosage} onChange={event=>onDosage(event.target.value)}
    aria-invalid={!!errors.coverage} aria-describedby={errors.coverage?'concrete-mix-error':undefined}>
    <option value="">Elige el uso indicado para tu obra</option>
    {concreteDosages.map(({label,strength,bags})=><option key={bags} value={bags}>{label} · {strength} kg/cm²</option>)}
   </select>
   {errors.coverage&&<small id="concrete-mix-error" className="error">{errors.coverage}</small>}
  </label>
  <p className="muted">{dosage?`Referencia: ${dosage} bultos de 25 kg por m³ de concreto.`:'Usa el tipo de mezcla indicado para tu obra.'}</p>
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
