import {useRef,useState} from 'react';
import {positive} from './calculate';
import type {Product} from './catalog';
import {RoofDiagram,type RoofAxis} from './RoofDiagram';
import {blankSurface,completeSurfaceArea,surfaceArea,type Surface} from './surfaces';

const areaText=(area:number)=>area.toLocaleString('es-MX',{maximumSignificantDigits:8});
type MeasurementsProps={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};

function RoofSurface({surface,index,errors,onChange,onRemove}:{
 surface:Surface;index:number;errors:MeasurementsProps['errors'];onChange:(surface:Surface)=>void;onRemove?:()=>void;
}){
 const inputs=useRef<Partial<Record<RoofAxis,HTMLInputElement>>>({});
 const [active,setActive]=useState<RoofAxis>();
 const number=index+1;
 const direct=surface.mode==='area';
 const length=positive(surface.length),width=positive(surface.side);
 const area=surfaceArea(surface);
 const fieldIds={length:`${surface.id}-length`,side:`${surface.id}-side`};
 const edit=(axis:RoofAxis)=>{
  inputs.current[axis]?.focus();
  inputs.current[axis]?.select();
 };
 const field=(key:RoofAxis|'area',label:string,accessibleLabel:string)=>{
  const id=`${surface.id}-${key}`;
  const error=errors[`${index}-${key}`];
  return <label htmlFor={id}>{label}<input id={id} value={surface[key]} inputMode="decimal"
   aria-label={accessibleLabel} aria-invalid={!!error} aria-describedby={error?`${id}-error`:undefined}
   ref={element=>{if(key!=='area'&&element)inputs.current[key]=element;}}
   onFocus={()=>setActive(key==='area'?undefined:key)} onBlur={()=>setActive(undefined)}
   onChange={event=>onChange({...surface,[key]:event.target.value})}/>
   {error&&<small className="error" id={`${id}-error`}>{error}</small>}
  </label>;
 };

 return <fieldset className="roof-surface">
  <legend>Superficie {number}</legend>
  <div className="segmented" role="group" aria-label={`Forma de medir superficie ${number}`}>
   <button type="button" aria-pressed={!direct} onClick={()=>{if(direct)onChange({...surface,mode:'dimensions'});}}>Largo × ancho</button>
   <button type="button" aria-pressed={direct} onClick={()=>{if(!direct)onChange({...surface,mode:'area'});}}>Ya sé los m²</button>
  </div>
  <RoofDiagram direct={direct} directArea={direct?(area??undefined):undefined} ready={area!==null} active={active} onEdit={edit} fieldIds={fieldIds}
   length={!direct&&Number.isFinite(length)?length:undefined} width={!direct&&Number.isFinite(width)?width:undefined}/>
  <div className="roof-fields">
   {direct?field('area','Área (m²)',`Área de superficie ${number} (m²)`):<>
    {field('length','Largo (m)',`Largo de superficie ${number} (m)`)}
    {field('side','Ancho (m)',`Ancho de superficie ${number} (m)`)}
   </>}
  </div>
  <p className="roof-surface-area">Área de esta superficie <strong>{area===null?'Pendiente':`${areaText(area)} m²`}</strong></p>
  {onRemove&&<button type="button" className="text-button remove" onClick={onRemove}>Eliminar superficie {number}</button>}
 </fieldset>;
}

export function RoofMeasurements({surfaces,errors,onChange,heading}:MeasurementsProps&{heading?:string}){
 return <section className="roof-measurements" aria-label={heading??'Superficies de la azotea'}>
  {heading&&<h2>{heading}</h2>}
  {surfaces.map((surface,index)=><RoofSurface key={surface.id} surface={surface} index={index} errors={errors}
   onChange={changed=>onChange(surfaces.map(item=>item.id===changed.id?changed:item))}
   onRemove={surfaces.length>1?()=>onChange(surfaces.filter(item=>item.id!==surface.id)):undefined}/>)}
  <button type="button" className="text-button" onClick={()=>onChange([...surfaces,blankSurface('dimensions')])}>＋ Agregar superficie</button>
 </section>;
}

export function RoofReview({product,surfaces,error}:{
 product:Product & {areaCoverage:NonNullable<Product['areaCoverage']>}; surfaces:Surface[]; error?:string;
}){
 const {areaCoverage,presentation}=product;
 const area=completeSurfaceArea(surfaces);
 return <aside className="roof-review" aria-label="Resumen de tu azotea">
  <h2>Resumen de tu azotea</h2>
  <p>{surfaces.length} {surfaces.length===1?'superficie':'superficies'}</p>
  <p className="roof-review-area">Área total <strong>{area===null?'Pendiente':`${areaText(area)} m²`}</strong></p>
  <section className="roof-coverage">
   <h3>Rendimiento Cemix</h3>
   <p><strong>{areaCoverage.m2PerContainer} m² por {presentation.charAt(0).toLowerCase()+presentation.slice(1)} · {areaCoverage.coats} manos</strong></p>
   <p>Ingresa el área una sola vez. Las dos manos ya están incluidas.</p>
   <details><summary>Detalles del rendimiento</summary><p>{areaCoverage.note}</p></details>
  </section>
  {error&&<p className="error" role="alert">{error}</p>}
  <button type="submit" className="primary calculate">Calcular cubetas y costo</button>
 </aside>;
}
