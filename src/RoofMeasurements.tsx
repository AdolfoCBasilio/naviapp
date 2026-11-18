import {useRef} from 'react';
import {MeasurementActions,useMeasurementEditor} from './MeasurementEditor';
import {positive} from './calculate';
import type {Product} from './catalog';
import {RoofDiagram,type RoofAxis} from './RoofDiagram';
import {blankSurface,completeSurfaceArea,surfaceArea,type Surface} from './surfaces';

const areaText=(area:number)=>area.toLocaleString('es-MX',{maximumSignificantDigits:8});
type MeasurementsProps={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};

type RoofField=RoofAxis|'area';
const fieldNames={length:'Largo',side:'Ancho',area:'Área'};
const normalizeDraft=(value:string)=>value.trim().replace(/^[.,]/,'0$&');

function RoofSurface({surface,index,errors,onChange,onRemove}:{
 surface:Surface;index:number;errors:MeasurementsProps['errors'];onChange:(surface:Surface)=>void;onRemove?:()=>void;
}){
 const card=useRef<HTMLFieldSetElement>(null);
 const number=index+1;
 const direct=surface.mode==='area';
 const editor=useMeasurementEditor<RoofField>({
  card,values:surface,order:direct?['area']:['length','side'],
  parse:value=>positive(normalizeDraft(value)),
  normalize:normalizeDraft,onChange:(key,value)=>onChange({...surface,[key]:value}),
 });
 const {draft,next,setNext,active}=editor;
 const confirmedValue=draft?normalizeDraft(draft.value):'';
 const validDraft=positive(confirmedValue);
 const preview=draft?{...surface,[draft.key]:confirmedValue}:surface;
 const area=surfaceArea(preview);
 const length=positive(draft?.key==='length'?normalizeDraft(draft.lastValid):surface.length);
 const width=positive(draft?.key==='side'?normalizeDraft(draft.lastValid):surface.side);
 const fieldIds={length:`${surface.id}-length`,side:`${surface.id}-side`};

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
    ref={element=>{if(element)editor.inputs.current[key]=element;}}
    onFocus={()=>editor.begin(key)} onBlur={editor.blur}
    onKeyDown={event=>{
     if(!editing)return;
     if(event.key==='Enter'||event.key==='Escape'){event.preventDefault();editor.finish(event.key==='Enter');}
    }}
    onChange={event=>editor.change(key,event.target.value)}/>
   {next===key&&<span className="sr-only" id={`${id}-next`}>Siguiente medida</span>}
   {error&&<small className="error" id={`${id}-error`} role={editing?'alert':undefined}>{error}</small>}
  </label>;
 };

 return <fieldset ref={card} tabIndex={-1} className={`roof-surface${draft?' measurement-editing roof-editing':''}`}
  role={draft?'dialog':undefined} aria-modal={draft?true:undefined} aria-label={draft?`Editar superficie ${number}`:undefined}>
  <legend>Superficie {number}</legend>
  <div className="measurement-edit-content">
   <div className="segmented" role="group" aria-label={`Forma de medir superficie ${number}`}>
    <button type="button" aria-pressed={!direct} onClick={()=>{if(direct){setNext(undefined);onChange({...surface,mode:'dimensions'});}}}>Largo × ancho</button>
    <button type="button" aria-pressed={direct} onClick={()=>{if(!direct){setNext(undefined);onChange({...surface,mode:'area'});}}}>Ya sé los m²</button>
   </div>
   <RoofDiagram direct={direct} directArea={direct?(area??undefined):undefined} ready={area!==null}
    active={active==='area'?undefined:active} onEdit={editor.edit} fieldIds={fieldIds}
    compact={!!draft} pendingAxis={draft&&draft.key!=='area'&&!Number.isFinite(validDraft)?draft.key:undefined}
    length={!direct&&Number.isFinite(length)?length:undefined} width={!direct&&Number.isFinite(width)?width:undefined}/>
   <div className="roof-fields">
    {direct?field('area'):<>{field('length')}{field('side')}</>}
   </div>
   <p className="roof-surface-area"><span>Área de esta superficie</span> <strong>{area===null?'Pendiente':`${areaText(area)} m²`}</strong></p>
   {draft?<MeasurementActions onFinish={editor.finish}/>:onRemove&&<button type="button" className="text-button remove" onClick={onRemove}>Eliminar superficie {number}</button>}
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
