import {useRef} from 'react';
import {positive} from './calculate';
import {FloorDiagram} from './FloorDiagram';
import {WallDiagram} from './WallDiagram';
import {MeasurementActions,useMeasurementEditor} from './MeasurementEditor';
import {surfaceArea,type Surface} from './surfaces';

type Field='length'|'side'|'area';
const normalize=(value:string)=>value.trim().replace(/^[.,]/,'0$&');
const format=(value:number)=>value.toLocaleString('es-MX',{maximumSignificantDigits:8});

export function SurfaceFields({surface,index,errors,onChange,onRemove,floor=false}:{
 surface:Surface;index:number;errors:Record<string,string>;onChange:(surface:Surface)=>void;
 onRemove?:()=>void;floor?:boolean;
}){
 const card=useRef<HTMLFieldSetElement>(null);
 const direct=surface.mode==='area';
 const item=floor?'superficie':'muro';
 const title=floor?'Superficie':'Muro';
 const sideName=floor?'Ancho':'Alto';
 const names={length:'Largo',side:sideName,area:'Área'};
 const number=index+1;
 const editor=useMeasurementEditor<Field>({
  card,values:surface,order:direct?['area']:['length','side'],
  parse:value=>positive(normalize(value)),normalize,
  onChange:(key,value)=>onChange({...surface,[key]:value}),
 });
 const {draft,next,active}=editor;
 const preview=draft?{...surface,[draft.key]:normalize(draft.value)}:surface;
 const area=surfaceArea(preview);
 const geometry=(key:'length'|'side')=>direct?NaN:positive(draft?.key===key?normalize(draft.lastValid):surface[key]);
 const lengthId=`${surface.id}-length`,sideId=`${surface.id}-side`;
 const validDraft=draft?positive(normalize(draft.value)):NaN;
 const mode=(mode:Surface['mode'])=>{
  if(surface.mode===mode)return;
  editor.setNext(undefined);
  onChange({...surface,mode});
 };

 const field=(key:Field,label:string)=>{
  const id=`${surface.id}-${key}`;
  const editing=draft?.key===key;
  const error=editing?(draft.error?`Ingresa ${key==='area'?'un área':key==='length'?'un largo':floor?'un ancho':'un alto'} mayor que cero.`:undefined):errors[`${index}-${key}`];
  const hint=next===key&&!error;
  return <label htmlFor={id} hidden={!!draft&&!editing} data-next={next===key}>
   <span>{label}</span>
   <input ref={element=>{if(element)editor.inputs.current[key]=element;}} id={id}
    aria-label={`${names[key]} de ${item} ${number} (${key==='area'?'m²':'m'})`} inputMode="decimal" enterKeyHint="done"
    placeholder={draft?undefined:'0'} value={editing?draft.value:surface[key]} aria-invalid={!!error}
    aria-describedby={error?`${id}-error`:hint?`${id}-next`:draft?undefined:`${surface.id}-help`}
    onFocus={()=>editor.begin(key)} onBlur={editor.blur}
    onKeyDown={event=>{
     if(editing&&(event.key==='Enter'||event.key==='Escape')){
      event.preventDefault();editor.finish(event.key==='Enter');
     }
    }}
    onChange={event=>editor.change(key,event.target.value)}/>
   {hint&&<small id={`${id}-next`} className="roof-next-label">Siguiente medida</small>}
   {error&&<small className="error" id={`${id}-error`} role={editing?'alert':undefined}>{error}</small>}
  </label>;
 };

 return <fieldset ref={card} tabIndex={-1} className={`wall-card${floor?' floor-card':''}${draft?' measurement-editing surface-editing':''}`}
  role={draft?'dialog':undefined} aria-modal={draft?true:undefined} aria-label={draft?`Editar ${item} ${number}`:undefined}>
  <legend>{title} {number}</legend>
  <div className="measurement-edit-content">
   <div className="segmented" role="group" aria-label={`Forma de medir ${item} ${number}`}>
    <button type="button" aria-pressed={!direct} onClick={()=>mode('dimensions')}>Largo × {sideName.toLowerCase()}</button>
    <button type="button" aria-pressed={direct} onClick={()=>mode('area')}>Ya sé los m²</button>
   </div>
   {(!direct||draft)&&<div className="surface-edit-figure" data-direct={direct}>
    {floor?<FloorDiagram length={geometry('length')} width={geometry('side')}
     activeDimension={active==='length'?'length':active==='side'?'width':null}
     lengthFieldId={lengthId} widthFieldId={sideId} surfaceNumber={number}
     onSelectDimension={key=>editor.edit(key==='length'?'length':'side',true)}/>
    :<WallDiagram length={geometry('length')} height={geometry('side')}
     activeDimension={active==='length'?'length':active==='side'?'height':null}
     lengthFieldId={lengthId} heightFieldId={sideId} wallNumber={number}
     onSelectDimension={key=>editor.edit(key==='length'?'length':'side',true)}/>}
    {draft&&!direct&&<span className="roof-edit-gauge">{names[draft.key]} {Number.isFinite(validDraft)?format(validDraft):'—'} m</span>}
   </div>}
   <div className={`wall-fields${floor?' floor-fields':''}`}>{direct?field('area',floor?'Área de la superficie (m²)':'Área del muro (m²)'):
    <>{field('length','Largo (m)')}{field('side',`${sideName} (m)`)}</>}</div>
   <p id={`${surface.id}-help`} className="wall-help">Escribe las medidas en {direct?'metros cuadrados':'metros'}. Puedes usar punto o coma decimal.</p>
   <p className="wall-area"><span>{floor?'Área de esta superficie':'Área de este muro'}</span> <strong>{area===null?'Pendiente':`${format(area)} m²`}</strong></p>
   {draft?<MeasurementActions onFinish={editor.finish}/>:onRemove&&
    <button className="text-button remove" type="button" onClick={onRemove}>Eliminar {item} {number}</button>}
  </div>
 </fieldset>;
}
