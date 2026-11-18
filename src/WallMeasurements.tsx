import {useRef,useState} from 'react';
import {positive} from './calculate';
import {blankSurface,surfaceArea,type Surface} from './surfaces';
import {WallDiagram,type WallDimension} from './WallDiagram';

type Props={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};
function WallFields({surface,index,errors,onChange,onRemove}:{surface:Surface;index:number;errors:Props['errors'];onChange:(surface:Surface)=>void;onRemove?:()=>void}){
 const [focused,setFocused]=useState<WallDimension>(null);
 const lengthInput=useRef<HTMLInputElement>(null),heightInput=useRef<HTMLInputElement>(null);
 const focusDimension=(dimension:Exclude<WallDimension,null>)=>{const input=(dimension==='length'?lengthInput:heightInput).current;input?.focus({preventScroll:true});input?.scrollIntoView?.({block:'nearest',inline:'nearest',behavior:'auto'});};
 const area=surfaceArea(surface);
 const field=(key:'length'|'side'|'area',label:string)=>{
  const id=`${surface.id}-${key}`,error=errors[`${index}-${key}`];
  const name=key==='length'?'Largo':key==='side'?'Alto':'Área';
  return <label htmlFor={id}>{label}<input ref={key==='length'?lengthInput:key==='side'?heightInput:undefined} id={id} aria-label={`${name} de muro ${index+1} (${key==='area'?'m²':'m'})`} inputMode="decimal" placeholder="0" value={surface[key]} aria-invalid={!!error} aria-describedby={error?`${id}-error`:`${surface.id}-help`} onFocus={()=>setFocused(key==='length'?'length':key==='side'?'height':null)} onBlur={()=>setFocused(null)} onChange={e=>onChange({...surface,[key]:e.target.value})}/>{error&&<small className="error" id={`${id}-error`}>{error}</small>}</label>;
 };
 return <fieldset className="wall-card"><legend>Muro {index+1}</legend>
  <div className="segmented" role="group" aria-label={`Forma de medir muro ${index+1}`}><button type="button" aria-pressed={surface.mode==='dimensions'} onClick={()=>onChange({...surface,mode:'dimensions'})}>Largo × alto</button><button type="button" aria-pressed={surface.mode==='area'} onClick={()=>onChange({...surface,mode:'area'})}>Ya sé los m²</button></div>
  {surface.mode==='dimensions'&&<WallDiagram length={positive(surface.length)} height={positive(surface.side)} activeDimension={focused} onSelectDimension={focusDimension} lengthFieldId={`${surface.id}-length`} heightFieldId={`${surface.id}-side`} wallNumber={index+1}/>}
  <div className="wall-fields">{surface.mode==='dimensions'?<>{field('length','Largo (m)')}{field('side','Alto (m)')}</>:field('area','Área del muro (m²)')}</div>
  <p id={`${surface.id}-help`} className="wall-help">Escribe las medidas en {surface.mode==='area'?'metros cuadrados':'metros'}. Puedes usar punto o coma decimal.</p>
  <p className="wall-area">Área de este muro <strong>{area===null?'Pendiente':`${area.toLocaleString('es-MX',{maximumFractionDigits:3})} m²`}</strong></p>
  {onRemove&&<button className="text-button remove" type="button" onClick={onRemove}>Eliminar muro {index+1}</button>}
 </fieldset>;
}
export function WallMeasurements({surfaces,errors,onChange}:Props){
 const valid=surfaces.map(surfaceArea).filter((area):area is number=>area!==null);
 const total=valid.reduce((sum,area)=>sum+area,0);
 return <section className="wall-measurements" aria-label="Medidas de los muros">
  <h2>1. Medidas del muro</h2>
  {surfaces.map((surface,i)=><WallFields key={surface.id} surface={surface} index={i} errors={errors} onChange={next=>onChange(surfaces.map((s,j)=>j===i?next:s))} onRemove={surfaces.length>1?()=>onChange(surfaces.filter((_,j)=>i!==j)):undefined}/>)}
  <div className="surface-total"><button type="button" className="text-button" onClick={()=>onChange([...surfaces,blankSurface('dimensions')])}>＋ Agregar otro muro</button><p>Área total <strong>{valid.length&&Number.isFinite(total)?total.toLocaleString('es-MX',{maximumFractionDigits:3}):'—'} m²</strong></p></div>
  {valid.length<surfaces.length&&<p className="wall-pending">{valid.length} de {surfaces.length} muros con medidas válidas. Completa los pendientes antes de calcular.</p>}
 </section>;
}
