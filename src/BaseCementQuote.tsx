import {useId,type ReactNode} from 'react';
import {baseCementoApplications,type BaseCementoUse} from './catalog';
import {completeSurfaceArea,type Surface} from './surfaces';

type Application=(typeof baseCementoApplications)[BaseCementoUse];
const hands=(coats:number)=>`${coats} ${coats===1?'mano':'manos'}`;

function CementSection({coats,thickness}:{coats:number;thickness:string}){
 const id=useId();
 const measure=Number(thickness);
 const height=measure>0?14+6*measure:0;
 const layers=Array.from({length:coats},(_,index)=>index);
 return <figure className="base-cement-cut">
  <svg viewBox="0 0 420 156" aria-hidden="true">
   <defs>
    <pattern id={`cement-base-${id}`} patternUnits="userSpaceOnUse" width="49" height="26">
     <rect width="49" height="26" fill="#858e86"/>
     <path d="m4 7 4-2 2 3-3 2zm21 10 3-3 4 2-1 4zm15-11 3-2 2 3z" fill="#69746c"/>
     <circle cx="15" cy="20" r="1.4" fill="#b0b8af"/>
    </pattern>
   </defs>
   <g data-cement-base>
    <path d="M9 107H250V148H9Z" fill={`url(#cement-base-${id})`}/>
    <path d="M250 107l24-18v41l-24 18Z" fill="#6a766d"/>
    <path d="M9 107l24-18h241l-24 18Z" fill="#a8b0a8"/>
   </g>
   {layers.map(index=><g key={index} className="cement-motion" style={{transform:`translateY(${-index*height}px)`}}>
    <rect data-cement-layer className="cement-motion" x="9" width="241" style={{y:107-height,height}}
     fill={index===0?'#d8ded9':'#f1f3ef'}/>
    <path className="cement-motion" style={{transform:`translate(250px,107px) matrix(1,-.75,0,${height},0,0)`}}
      d="M0 0h24v-1H0Z" fill={index===0?'#aab6ad':'#c8d1c9'}/>
    {height>0&&<>
     <path d="M280 107h10" stroke="#B8F55E"/>
     <path className="cement-motion" style={{transform:`translateY(${-height}px)`}} d="M280 107h10" stroke="#B8F55E"/>
     <path className="cement-motion" style={{transform:`translate(285px,107px) scaleY(${height})`}} d="M0 0v-1" stroke="#B8F55E" vectorEffect="non-scaling-stroke"/>
     <text className="cement-motion" style={{transform:`translateY(${-height/2}px)`}} x="300" y="107" dominantBaseline="middle" fill="#f5f5f2" fontSize="14">
      {index+1}ª mano · {thickness} mm
     </text>
    </>}
   </g>)}
   <path className="cement-motion" d="M9 107l24-18h241l-24 18Z" fill="#fafbf8"
    opacity={height>0?1:0} style={{transform:`translateY(${-coats*height}px)`}}/>
  </svg>
  <figcaption>Detalle ampliado, sin escala</figcaption>
 </figure>;
}

export function BaseCementApplication({use,application,thickness,selector,error,onChange}:{
 use:BaseCementoUse; application:Application; thickness:string; selector:ReactNode; error?:string;
 onChange:(use:BaseCementoUse)=>void;
}){
 return <section className="base-cement-panel" aria-label="Uso y aplicación">
  <h2>2. Uso y aplicación</h2>
  <label>Uso de Base Cemento
   <select value={use} onChange={event=>onChange(event.target.value as BaseCementoUse)}>
    {Object.entries(baseCementoApplications).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}
   </select>
  </label>
  {selector}
  <small id="coverage-error" className="error" role={error?'alert':undefined}>{error}</small>
  <CementSection coats={application.coats} thickness={thickness}/>
  <p className="base-cement-hands">Este cálculo considera {hands(application.coats)}</p>
  <p>El área se ingresa una sola vez.</p>
  <details className="roof-coverage"><summary>Preparación y aplicación</summary>
   <p>{application.water}</p>
   <p>{application.note}</p>
  </details>
  {use==='membrane'&&<div className="base-cement-scope">
   <p><strong>Incluye:</strong> material para las {application.coats} manos de membrana.</p>
   <p><strong>No incluye:</strong> sellado previo ni malla.</p>
  </div>}
 </section>;
}

export function BaseCementReview({surfaces,application,thickness}:{
 surfaces:Surface[]; application:Application; thickness:string;
}){
 const total=completeSurfaceArea(surfaces);
 return <aside className="base-cement-review" aria-label="Resumen del estimado">
  <dl>
   <div><dt>Área total</dt><dd>{total===null?'Pendiente':`${total.toLocaleString('es-MX',{maximumSignificantDigits:8})} m²`}</dd></div>
   <div><dt>Uso</dt><dd>{application.label}</dd></div>
   <div><dt>{application.coats>1?'Espesor por mano':'Espesor'}</dt><dd>{thickness?`${thickness} mm`:'Por elegir'}</dd></div>
   <div><dt>Manos</dt><dd>{hands(application.coats)}</dd></div>
  </dl>
  <div>
   <button type="submit" className="primary calculate">Calcular bultos y costo</button>
   <p className="form-note">Bultos completos · Estimado sin merma</p>
  </div>
 </aside>;
}
