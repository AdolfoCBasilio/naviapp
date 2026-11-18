import {useRef,useState} from 'react';
import {positive} from './calculate';
import {blankSurface,surfaceArea,type Surface} from './surfaces';
import {FloorDiagram,type FloorDimension} from './FloorDiagram';

type Props={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};
function FloorFields({surface,index,errors,onChange,onRemove}:{surface:Surface;index:number;errors:Props['errors'];onChange:(surface:Surface)=>void;onRemove?:()=>void}){
 const [focused,setFocused]=useState<FloorDimension|null>(null);
 const lengthInput=useRef<HTMLInputElement>(null),widthInput=useRef<HTMLInputElement>(null);
 const focusDimension=(dimension:FloorDimension)=>{
  const input=(dimension==='length'?lengthInput:widthInput).current;
  input?.focus();
  input?.select();
 };
 const area=surfaceArea(surface);
 const field=(key:'length'|'side'|'area',label:string)=>{
  const id=`${surface.id}-${key}`,error=errors[`${index}-${key}`];
  const name=key==='length'?'Largo':key==='side'?'Ancho':'Área';
  return <label htmlFor={id}>{label}<input ref={key==='length'?lengthInput:key==='side'?widthInput:undefined} id={id} aria-label={`${name} de superficie ${index+1} (${key==='area'?'m²':'m'})`} inputMode="decimal" placeholder="0" value={surface[key]} aria-invalid={!!error} aria-describedby={error?`${id}-error`:`${surface.id}-help`} onFocus={()=>setFocused(key==='length'?'length':key==='side'?'width':null)} onBlur={()=>setFocused(null)} onChange={e=>onChange({...surface,[key]:e.target.value})}/>{error&&<small className="error" id={`${id}-error`}>{error}</small>}</label>;
 };
 return <fieldset className="wall-card floor-card"><legend>Superficie {index+1}</legend>
  <div className="segmented" role="group" aria-label={`Forma de medir superficie ${index+1}`}><button type="button" aria-pressed={surface.mode==='dimensions'} onClick={()=>onChange({...surface,mode:'dimensions'})}>Largo × ancho</button><button type="button" aria-pressed={surface.mode==='area'} onClick={()=>onChange({...surface,mode:'area'})}>Ya sé los m²</button></div>
  {surface.mode==='dimensions'&&<FloorDiagram length={positive(surface.length)} width={positive(surface.side)} activeDimension={focused} lengthFieldId={`${surface.id}-length`} widthFieldId={`${surface.id}-side`} surfaceNumber={index+1} onSelectDimension={focusDimension}/>}
  <div className="wall-fields floor-fields">{surface.mode==='dimensions'?<>{field('length','Largo (m)')}{field('side','Ancho (m)')}</>:field('area','Área de la superficie (m²)')}</div>
  <p id={`${surface.id}-help`} className="wall-help">Escribe las medidas en {surface.mode==='area'?'metros cuadrados':'metros'}. Puedes usar punto o coma decimal.</p>
  <p className="wall-area">Área de esta superficie <strong>{area===null?'Pendiente':`${area.toLocaleString('es-MX',{maximumFractionDigits:3})} m²`}</strong></p>
  {onRemove&&<button className="text-button remove" type="button" onClick={onRemove}>Eliminar superficie {index+1}</button>}
 </fieldset>;
}
export function FloorMeasurements({surfaces,errors,onChange}:Props){
 const valid=surfaces.map(surfaceArea).filter((area):area is number=>area!==null);
 const total=valid.reduce((sum,area)=>sum+area,0);
 return <section className="wall-measurements floor-measurements" aria-label="Medidas de pisos o losas">
  <h2>1. Medidas del piso o losa</h2>
  {surfaces.map((surface,i)=><FloorFields key={surface.id} surface={surface} index={i} errors={errors} onChange={next=>onChange(surfaces.map((s,j)=>j===i?next:s))} onRemove={surfaces.length>1?()=>onChange(surfaces.filter((_,j)=>i!==j)):undefined}/>)}
  <div className="surface-total"><button type="button" className="text-button" onClick={()=>onChange([...surfaces,blankSurface('dimensions')])}>＋ Agregar otra superficie</button><p>Área total <strong>{valid.length&&Number.isFinite(total)?total.toLocaleString('es-MX',{maximumFractionDigits:3}):'—'} m²</strong></p></div>
  {valid.length<surfaces.length&&<p className="wall-pending">{valid.length} de {surfaces.length} superficies con medidas válidas. Completa las pendientes antes de calcular.</p>}
 </section>;
}
