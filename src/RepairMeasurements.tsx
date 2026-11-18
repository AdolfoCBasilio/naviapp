import {useId, useLayoutEffect, useRef} from 'react';
import {
 blankCrack, crackFieldId, crackMeasure, crackVolume, crackWarning, formatVolume,
 volumeReference, type Crack, type CrackDimension,
} from './CrackMeasurements';
import {MeasurementActions,useMeasurementEditor} from './MeasurementEditor';
import {SealSpan,SealCut} from './SealDiagrams';
import type {Product} from './catalog';

const dimensions = {
 length: {name:'Largo', label:'Largo (m)', unit:'m'},
 width: {name:'Ancho', label:'Ancho promedio (mm)', unit:'mm'},
 depth: {name:'Profundidad', label:'Profundidad promedio (mm)', unit:'mm'},
};

function visualSize(value:string, minimum:number, maximum:number, scale:number) {
 const measure=crackMeasure(value);
 return minimum+(maximum-minimum)*(Number.isFinite(measure)?measure/(measure+scale):0);
}

function VolumeItem({crack, index, errors, removable, seal, onChange, onRemove}:{
 crack:Crack; index:number; errors:Record<string,string>; removable:boolean; seal:boolean;
 onChange:(crack:Crack)=>void; onRemove:()=>void;
}) {
 const marker=useId();
 const card=useRef<HTMLElement>(null);
 const editor=useMeasurementEditor<CrackDimension>({
  card,values:crack,parse:crackMeasure,enabled:seal,order:['length','width','depth'],
  onChange:(key,value)=>onChange({...crack,[key]:value}),
 });
 const {draft,next,active}=editor;
 const preview=draft?{...crack,[draft.key]:draft.value}:crack;
 const geometry=draft?{...crack,[draft.key]:draft.lastValid}:crack;
 const length=visualSize(geometry.length,39,122,2);
 const width=visualSize(geometry.width,16,68,8);
 const depth=visualSize(geometry.depth,23,89,12);
 const item=seal?'tramo':'grieta';
 const itemTitle=seal?'Tramo':'Grieta';
 const labelId=`repair-crack-${crack.id}`;

 const field=(key:CrackDimension)=>{
  const {label}=dimensions[key];
  const id=crackFieldId(crack,key);
  const editing=draft?.key===key;
  const error=editing?(draft.error?`Ingresa ${key==='length'?'un largo':key==='width'?'un ancho':'una profundidad'} mayor que cero.`:undefined):errors[id];
  return <div className="repair-field" hidden={!!draft&&!editing} data-next={next===key}>
   <label htmlFor={id}>{label}<span className="sr-only"> · {itemTitle} {index+1}</span></label>
   <input id={id} ref={element=>{if(element)editor.inputs.current[key]=element;}} inputMode="decimal" enterKeyHint={seal?'done':undefined}
    value={preview[key]} onChange={event=>editor.change(key,event.target.value)}
    onFocus={()=>editor.begin(key)} onBlur={editor.blur}
    onKeyDown={event=>{
     if(editing&&(event.key==='Enter'||event.key==='Escape')){
      event.preventDefault();
      editor.finish(event.key==='Enter');
     }
    }}
    aria-invalid={!!error} aria-describedby={error?`${id}-error`:next===key?`${id}-next`:undefined}/>
   {next===key&&<small id={`${id}-next`} className="roof-next-label">Siguiente medida</small>}
   {error&&<small className="error" id={`${id}-error`} role={editing?'alert':undefined}>{error}</small>}
  </div>;
 };

 const dimensionButton=(key:CrackDimension)=>{
  const {name,unit}=dimensions[key];
  const value=!seal||Number.isFinite(crackMeasure(preview[key]))?preview[key].trim():'';
  const text=`${name} ${value||'—'} ${unit}`;
  if(draft)return active===key?<span className="roof-edit-gauge">{text}</span>:null;
  return <button type="button" className={`repair-dimension repair-dimension-${key}`}
   data-active={active===key} aria-controls={crackFieldId(crack,key)}
   onClick={()=>editor.edit(key)}>
   <span>{text}</span>
   <svg aria-hidden="true" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m3 10 7-7 3 3-7 7-4 1zM9 4l3 3"/></svg>
  </button>;
 };

 let volume:number|undefined;
 try {volume=crackVolume(preview);} catch { /* Las medidas siguen pendientes. */ }

 return <section ref={card} tabIndex={seal?-1:undefined} className={`repair-crack${draft?' measurement-editing seal-editing':''}`}
  role={draft?'dialog':undefined} aria-modal={draft?true:undefined}
  aria-label={draft?`Editar tramo ${index+1}`:undefined} aria-labelledby={draft?undefined:labelId} data-edit-dimension={draft?.key}>
  <div className="measurement-edit-content">
  <div className="repair-panels">
   <section className="repair-panel seal-length-panel">
    <h2><span>1.</span> {seal?'Mide el tramo':'Mide tu grieta'}</h2>
    <p className="repair-caption">{seal?'Mide la longitud que vas a rellenar':'Mide el hueco que vas a rellenar'}</p>
    <h3 id={labelId}>{itemTitle} {index+1}</h3>
    {seal?<SealSpan length={visualSize(geometry.length,55,235,2)}
     pending={!Number.isFinite(crackMeasure(geometry.length))} active={active==='length'} control={dimensionButton('length')}/>:<div className="repair-length-art">
     <svg viewBox="0 0 160 164" aria-hidden="true">
      <defs>
       <linearGradient id={`${marker}-wall`}><stop stopColor="#8c908b"/><stop offset="1" stopColor="#bfc2bc"/></linearGradient>
      </defs>
      <path d="M27 9H114L128 17H41Z" fill="#d9dad4"/>
      <path d="M27 9 41 17V151L27 143Z" fill="#777c76"/>
      <path d="M41 17H128V151H41Z" fill={`url(#${marker}-wall)`}/>
      <path d="M22 151H131L140 159H15Z" fill="#acafa7"/>
      <path d="M15 159H140V163H15Z" fill="#787c75"/>
      <path className="repair-motion" style={{transform:`translate(85px, 22px) scaleY(${length/120})`}}
       d="m0 0 2 13-5 14 3 15-7 16 6 13-4 14 5 15-2 9 3 11"
       fill="none" stroke="#1a211c" strokeWidth="2.6" vectorEffect="non-scaling-stroke"/>
      <g className="repair-gauge" data-active={active==='length'}>
       <path d="M95 22h25m-12 0-4 5m4-5 4 5"/>
       <path className="repair-motion" style={{transform:`scaleY(${length})`,transformOrigin:'108px 22px'}} d="M108 22v1"/>
       <path className="repair-motion" style={{transform:`translateY(${length}px)`}} d="M95 22h25m-12 0-4-5m4 5 4-5"/>
      </g>
     </svg>
     {dimensionButton('length')}
    </div>}
    {!seal&&<p className="repair-figure-note">Toca una medida para editarla</p>}
    {field('length')}
   </section>
   <section className="repair-panel seal-cut-panel">
    <h2><span>2.</span> Ancho y profundidad</h2>
    {seal?<SealCut width={visualSize(geometry.width,28,96,10)} depth={visualSize(geometry.depth,19,66,8)}
     pending={!Number.isFinite(crackMeasure(geometry.width))||!Number.isFinite(crackMeasure(geometry.depth))}
     active={active} widthControl={dimensionButton('width')} depthControl={dimensionButton('depth')}/>:<>
    <p className="repair-caption">Mide la abertura y cuánto entra en el muro.</p>
    <div className="repair-detail">
     <svg className="repair-isometric" viewBox="0 0 148 166" preserveAspectRatio="xMaxYMid meet" aria-hidden="true">
      <path d="M7 84 112 22l29 15-105 62Z" fill="#d1d4cc"/>
      <path d="M7 84l29 15v54L7 138Z" fill="#959a92"/>
      <path d="M36 99l105-62v54L36 153Z" fill="#aeb3aa"/>
      <path className="repair-motion" style={{transform:`translate(25px, 87px) skewY(-30deg) scaleY(${width/36})`}}
       d="M0 -3H91V3H0Z" fill="#404942"/>
      <path d="m62 76 25-15v18L62 94Z" fill="none" stroke="var(--lime)" strokeWidth="2"/>
      <path d="m87 61 60-32M87 79l60 62" fill="none" stroke="var(--lime)" strokeDasharray="4 3"/>
     </svg>
     <div className="repair-cut">
      <svg viewBox="0 0 246 160" preserveAspectRatio="none" aria-hidden="true">
       <path d="M0 64H246V160H0Z" fill="#9fa59e"/>
       <path d="M0 64H246v9H0Z" fill="#d1d4cc"/>
       <rect className="repair-motion" width="1" height="1" fill="#151d17"
        style={{transform:`translate(${86-width/2}px, 64px) scale(${width}, ${depth})`}}/>
       <g className="repair-gauge" data-active={active==='width'}>
        <path className="repair-motion" style={{transform:`translateX(${86-width/2}px)`}} d="M0 46v18m0-12 5-4m-5 4 5 4"/>
        <path className="repair-motion" style={{transform:`translate(${86-width/2}px,52px) scaleX(${width})`}} d="M0 0h1"/>
        <path className="repair-motion" style={{transform:`translateX(${86+width/2}px)`}} d="M0 46v18m0-12-5-4m5 4-5 4"/>
       </g>
       <g className="repair-gauge" data-active={active==='depth'}>
        <path d="M86 64l-4 5m4-5 4 5"/>
        <path className="repair-motion" style={{transform:`translate(86px,64px) scaleY(${depth})`}} d="M0 0v1"/>
        <path className="repair-motion" style={{transform:`translateY(${depth}px)`}} d="M86 64l-4-5m4 5 4-5"/>
       </g>
      </svg>
      {dimensionButton('width')}
      {dimensionButton('depth')}
     </div>
    </div></>}
    <p className="repair-figure-note">{seal?'Corte ampliado, sin escala':'Detalle ampliado, sin escala'}</p>
    <div className="repair-detail-fields">{field('width')}{field('depth')}</div>
    {seal&&<p className="seal-color-key">El verde identifica el material de sellado</p>}
   </section>
  </div>
  <div className="repair-crack-footer">
   <p className="measurement-edit-total"><span>Volumen de {item} {index+1}</span> <strong>{volume===undefined?'Pendiente':`${formatVolume(volume)} L`}</strong></p>
   {!draft&&removable&&<button type="button" className="text-button remove" onClick={onRemove}>Eliminar {item} {index+1}</button>}
  </div>
  {draft&&<MeasurementActions onFinish={editor.finish}/>}
  </div>
 </section>;
}

export function VolumeMeasurements({product,cracks,errors,onChange}:{
 product:Product; cracks:Crack[]; errors:Record<string,string>; onChange:(cracks:Crack[])=>void;
}) {
 const seal=product.id==='plastico';
 const config=volumeReference(product);
 const panel=useRef<HTMLDivElement>(null);
 const pendingFocus=useRef<string|null>(null);
 useLayoutEffect(()=>{
  if(pendingFocus.current){
   panel.current?.querySelector<HTMLInputElement>(`#${pendingFocus.current}`)?.focus();
   pendingFocus.current=null;
  }
 },[cracks]);

 let total:number|undefined;
 try {
  const sum=cracks.reduce((volume,crack)=>volume+crackVolume(crack),0);
  if(Number.isFinite(sum))total=sum;
 } catch { /* El total requiere todas las medidas. */ }

 const add=()=>{
  const crack=blankCrack();
  pendingFocus.current=crackFieldId(crack,'length');
  onChange([...cracks,crack]);
 };

 return <div className={`repair-measurements${seal?' seal-measurements':''}`} ref={panel}>
  {cracks.map((crack,index)=><VolumeItem seal={seal} key={crack.id} crack={crack} index={index}
   errors={errors} removable={cracks.length>1}
   onChange={changed=>onChange(cracks.map(item=>item.id===changed.id?changed:item))}
   onRemove={()=>onChange(cracks.filter(item=>item.id!==crack.id))}/>)}
  <div className="repair-summary">
   <button type="button" className="text-button" onClick={add}>＋ {seal?'Agregar otro tramo':'Agregar otra grieta'}</button>
   <p>{cracks.length} {seal?(cracks.length===1?'tramo':'tramos'):(cracks.length===1?'grieta':'grietas')} · Volumen estimado <strong>{total===undefined?'Pendiente':`${formatVolume(total)} L`}</strong><small>{seal?'Aproximación geométrica':'Aproximación rectangular'}</small></p>
  </div>
  <details className="repair-help">
   <summary>{seal?'Cómo calculamos el consumo':'Cómo se calcula el consumo'}</summary>
   <p>Se aproxima el hueco con un volumen rectangular. Largo (m) × ancho promedio (mm) × profundidad promedio (mm) ÷ 1000 = litros.</p>
   <p>{config.note}</p>
  </details>
  <p className="repair-warning"><span aria-hidden="true">⚠</span> {seal?'Estimación geométrica; no es rendimiento oficial':crackWarning}</p>
  {errors.volume&&<p className="error" role="alert">{errors.volume}</p>}
  <button type="submit" className="primary calculate">{seal?'Calcular cubetas y costo':'Calcular bolsas y costo'}</button>
  {!seal&&<p className="form-note">Bolsas completas · Estimado sin merma</p>}
 </div>;
}
