import {useLayoutEffect,useRef,useState} from 'react';
import {positive} from './calculate';
import type {Product} from './catalog';
import {RoofDiagram,type RoofAxis} from './RoofDiagram';
import {blankSurface,completeSurfaceArea,surfaceArea,type Surface} from './surfaces';

const areaText=(area:number)=>area.toLocaleString('es-MX',{maximumSignificantDigits:8});
type MeasurementsProps={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};

type RoofField=RoofAxis|'area';
type Draft={key:RoofField;value:string;lastValid:number;error:boolean};
const fieldNames={length:'Largo',side:'Ancho',area:'Área'};
const normalizeDraft=(value:string)=>value.trim().replace(/^[.,]/,'0$&');

function RoofSurface({surface,index,errors,onChange,onRemove}:{
 surface:Surface;index:number;errors:MeasurementsProps['errors'];onChange:(surface:Surface)=>void;onRemove?:()=>void;
}){
 const inputs=useRef<Partial<Record<RoofField,HTMLInputElement>>>({});
 const card=useRef<HTMLFieldSetElement>(null);
 const scrollBeforeEdit=useRef<number|null>(null);
 const [active,setActive]=useState<RoofAxis>();
 const [next,setNext]=useState<RoofAxis>();
 const [draft,setDraft]=useState<Draft>();
 const number=index+1;
 const direct=surface.mode==='area';
 const confirmedValue=draft?normalizeDraft(draft.value):'';
 const validDraft=positive(confirmedValue);
 const preview=draft?{...surface,[draft.key]:confirmedValue}:surface;
 const area=surfaceArea(preview);
 const length=draft?.key==='length'?draft.lastValid:positive(surface.length);
 const width=draft?.key==='side'?draft.lastValid:positive(surface.side);
 const fieldIds={length:`${surface.id}-length`,side:`${surface.id}-side`};

 useLayoutEffect(()=>{
  if(draft||scrollBeforeEdit.current===null)return;
  const scroll=card.current?.closest('main');
  if(scroll)scroll.scrollTop=scrollBeforeEdit.current;
  scrollBeforeEdit.current=null;
  card.current?.focus({preventScroll:true});
 },[draft]);

 const begin=(key:RoofField)=>{
  setActive(key==='area'?undefined:key);
  if(draft||!window.matchMedia?.('(max-width: 799px), (pointer: coarse)').matches)return;
  scrollBeforeEdit.current=card.current?.closest('main')?.scrollTop??0;
  setNext(undefined);
  setDraft({key,value:surface[key],lastValid:positive(surface[key]),error:false});
 };
 const edit=(axis:RoofAxis)=>{
  inputs.current[axis]?.focus({preventScroll:true});
  inputs.current[axis]?.select();
 };
 const finish=(accept:boolean)=>{
  if(!draft)return;
  if(accept&&!Number.isFinite(validDraft)){
   setDraft({...draft,error:true});
   return;
  }
  inputs.current[draft.key]?.blur();
  setActive(undefined);
  setDraft(undefined);
  if(!accept)return;
  if(draft.key!=='area'){
   const other=draft.key==='length'?'side':'length';
   setNext(Number.isFinite(positive(surface[other]))?undefined:other);
  }
  if(confirmedValue!==surface[draft.key])onChange(preview);
 };

 const field=(key:RoofField)=>{
  const name=fieldNames[key],unit=key==='area'?'m²':'m';
  const id=`${surface.id}-${key}`;
  const editing=draft?.key===key;
  const error=editing?(draft.error?`Ingresa ${key==='area'?'un área':key==='length'?'un largo':'un ancho'} mayor que cero.`:undefined):errors[`${index}-${key}`];
  return <label htmlFor={id} hidden={!!draft&&!editing} data-next={next===key}>
   <span className="roof-field-label">{name} ({unit})</span>{next===key&&<small className="roof-next-label">Siguiente medida</small>}
   <input id={id} value={editing?draft.value:surface[key]} inputMode="decimal" enterKeyHint="done"
    aria-label={`${name} de superficie ${number} (${unit})`} aria-invalid={!!error}
    aria-describedby={error?`${id}-error`:next===key?`${id}-next`:undefined}
    ref={element=>{if(element)inputs.current[key]=element;}}
    onFocus={()=>begin(key)} onBlur={()=>setActive(undefined)}
    onKeyDown={event=>{
     if(!editing)return;
     if(event.key==='Enter'||event.key==='Escape'){event.preventDefault();finish(event.key==='Enter');}
    }}
    onChange={event=>{
     const value=event.target.value;
     if(editing){
      const measure=positive(normalizeDraft(value));
      setDraft({...draft,value,lastValid:Number.isFinite(measure)?measure:draft.lastValid,error:false});
     }else onChange({...surface,[key]:value});
    }}/>
   {next===key&&<span className="sr-only" id={`${id}-next`}>Siguiente medida</span>}
   {error&&<small className="error" id={`${id}-error`} role={editing?'alert':undefined}>{error}</small>}
  </label>;
 };

 return <fieldset ref={card} tabIndex={-1} className={`roof-surface${draft?' roof-editing':''}`}
  role={draft?'dialog':undefined} aria-modal={draft?true:undefined} aria-label={draft?`Editar superficie ${number}`:undefined}>
  <legend>Superficie {number}</legend>
  <div className="roof-surface-content">
   <div className="segmented" role="group" aria-label={`Forma de medir superficie ${number}`}>
    <button type="button" aria-pressed={!direct} onClick={()=>{if(direct){setNext(undefined);onChange({...surface,mode:'dimensions'});}}}>Largo × ancho</button>
    <button type="button" aria-pressed={direct} onClick={()=>{if(!direct){setNext(undefined);onChange({...surface,mode:'area'});}}}>Ya sé los m²</button>
   </div>
   <RoofDiagram direct={direct} directArea={direct?(area??undefined):undefined} ready={area!==null}
    active={draft?(draft.key==='area'?undefined:draft.key):(active??next)} onEdit={edit} fieldIds={fieldIds}
    compact={!!draft} pendingAxis={draft&&draft.key!=='area'&&!Number.isFinite(validDraft)?draft.key:undefined}
    length={!direct&&Number.isFinite(length)?length:undefined} width={!direct&&Number.isFinite(width)?width:undefined}/>
   <div className="roof-fields">
    {direct?field('area'):<>{field('length')}{field('side')}</>}
   </div>
   <p className="roof-surface-area"><span>Área de esta superficie</span> <strong>{area===null?'Pendiente':`${areaText(area)} m²`}</strong></p>
   {draft?<div className="roof-edit-actions" onPointerDown={event=>event.preventDefault()}>
    <button type="button" className="secondary" onClick={()=>finish(false)}>Cancelar</button>
    <button type="button" className="primary" onClick={()=>finish(true)}>Aceptar medida</button>
   </div>:onRemove&&<button type="button" className="text-button remove" onClick={onRemove}>Eliminar superficie {number}</button>}
  </div>
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
