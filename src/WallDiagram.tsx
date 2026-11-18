import {useId,type CSSProperties} from 'react';

export type WallDimension='length'|'height'|null;
type Props={length?:number;height?:number;activeDimension:WallDimension;onSelectDimension:(dimension:Exclude<WallDimension,null>)=>void;lengthFieldId:string;heightFieldId:string;wallNumber:number};
// Leave room for the cotas at both ends of the visual range.
function wallSize(metres:number|undefined, minimum:number, maximum:number, midpoint:number){
 return metres&&Number.isFinite(metres)&&metres>0
  ? minimum+(maximum-minimum)*(metres/(metres+midpoint))
  : minimum;
}

/** Illustrates one vertical face. The drawn depth never enters the area calculation. */
export function WallDiagram({length,height,activeDimension,onSelectDimension,lengthFieldId,heightFieldId,wallNumber}:Props){
 const id=useId();
 const drawWidth=wallSize(length,145,260,3);
 const drawHeight=wallSize(height,98,213,2);
 const rising={transform:`translateY(${-drawHeight}px)`};
 const right={transform:`translate(${drawWidth}px, ${-.173*drawWidth}px)`};
 const faceHeight={y:-drawHeight,height:drawHeight};
 const cotaPosition={
  length:{left:`${(65+drawWidth/2)/5}%`},
  height:{top:`${(283-.173*drawWidth-drawHeight/2)/3.5}%`},
 };
 const value=(n?:number)=>n&&Number.isFinite(n)&&n>0?` ${n.toLocaleString('es-MX',{maximumFractionDigits:3})} m`:'';
 const dimensionButton=(dimension:Exclude<WallDimension,null>,label:string,n:number|undefined,fieldId:string)=><button type="button" className={`wall-cota wall-cota-${dimension}${activeDimension===dimension?' is-active':''}`} aria-label={`Editar ${label.toLowerCase()} de muro ${wallNumber}${value(n)}`} aria-controls={fieldId} style={cotaPosition[dimension]} onClick={()=>onSelectDimension(dimension)}>{label}{value(n)}<span aria-hidden="true"> ✎</span></button>;
 return <figure className="wall-diagram">
  <div className="wall-perspective">
   <svg viewBox="0 0 500 350" aria-hidden="true" focusable="false">
    <defs>
     <pattern id={`blocks-${id}`} width="100" height="64" patternUnits="userSpaceOnUse"><rect width="100" height="64" fill="#79816f"/><path d="M0 0H100M0 32H100M0 64H100M0 0V32M50 32V64M100 0V32" stroke="#ced6bd" strokeWidth="1.5" fill="none"/></pattern>
     <marker id={`arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="context-stroke"/></marker>
    </defs>
    <g transform="translate(65 283)">
     <g transform="matrix(1 .65 0 1 0 0)">
      <rect className="wall-resize" x="-20" width="20" style={faceHeight} fill="#777f79" stroke="#b6beb6"/>
     </g>
     <g className="wall-resize" style={rising}>
      <g transform="matrix(1 -.173 1 .65 0 0)">
       <rect className="wall-resize" y="-20" height="20" style={{width:drawWidth}} fill="#aab0a5" stroke="#d5dbce"/>
      </g>
     </g>
     <g transform="matrix(1 -.173 0 1 0 0)" data-wall-face>
      <rect className="wall-resize" style={{...faceHeight,width:drawWidth}} fill={`url(#blocks-${id})`} stroke="#d6e5bd" strokeWidth="1.5"/>
      <rect className="wall-resize" style={{...faceHeight,width:drawWidth}} fill="#B8F55E" opacity=".17"/>
     </g>
     <g className={`wall-dimension${activeDimension==='length'?' is-active':''}`} data-dimension="length" data-active={activeDimension==='length'}>
      <path d="M0 6v18"/>
      <path className="wall-resize" style={right} d="M0 6v18"/>
      <g transform="matrix(1 -.173 0 1 4 14.3)">
       <path className="wall-resize" style={{transform:`scaleX(${(drawWidth-8)/260})`}} d="M0 0h260" markerStart={`url(#arrow-${id})`} markerEnd={`url(#arrow-${id})`}/>
      </g>
     </g>
     <g className={`wall-dimension wall-resize${activeDimension==='height'?' is-active':''}`} style={right} data-dimension="height" data-active={activeDimension==='height'}>
      <path d="M11 0h19"/>
      <path className="wall-resize" style={rising} d="M11 0h19"/>
      <g transform="translate(20 -4)">
       <path className="wall-resize" style={{transform:`scaleY(${(drawHeight-8)/190})`}} d="M0 0v-190" markerStart={`url(#arrow-${id})`} markerEnd={`url(#arrow-${id})`}/>
      </g>
     </g>
    </g>
   </svg>
   {dimensionButton('length','Largo',length,lengthFieldId)}
   {dimensionButton('height','Alto',height,heightFieldId)}
  </div>
  <figcaption>Una cara del muro · Vista ilustrativa<span>Toca una medida para editarla. La profundidad no forma parte del cálculo.</span></figcaption>
 </figure>;
}
export function WallFinishDetail({thickness}:{thickness:string}){
 const id=useId();
 const selected=Number(thickness)>=3&&Number(thickness)<=7;
 // Exaggerated visual thickness only. Coverage continues to come from the catalog.
 const layerWidth=selected?Number(thickness)*4:0;
 return <figure className="wall-finish-detail animated-finish" style={{'--finish-width':layerWidth,'--finish-mid':`${layerWidth/2}px`,'--finish-end':`${layerWidth}px`} as CSSProperties} data-thickness={selected?thickness:'unselected'}>
  <svg viewBox="0 0 400 320" aria-hidden="true" focusable="false">
   <defs><marker id={`finish-arrow-${id}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9Z" fill="#f0f5ee"/></marker></defs>
   <g data-wall-base="true"><path d="M110 100L190 60L250 85L170 125Z" fill="#a9b0a7"/><path d="M110 100L170 125V285L110 260Z" fill="#717b73"/><path d="M170 125L250 85V245L170 285Z" fill="#858e80"/><path d="M170 178L250 138M170 231L250 191M110 153L170 178M110 206L170 231" stroke="#c7cec0"/></g>
   <g transform="translate(250 85)"><path className="finish-layer" d="M0 0L1 -4V156L0 160Z" fill="#B8F55E" data-finish-layer="true"/></g>
   <g className="finish-annotation" opacity={selected?1:0}>
    <path d="M250 54V77M240 64H249" stroke="#f0f5ee" markerEnd={`url(#finish-arrow-${id})`}/>
    <g className="finish-end" transform="translate(250 0)"><path d="M0 54V77M20 64H1" stroke="#f0f5ee" markerEnd={`url(#finish-arrow-${id})`}/></g>
    <text x="265" y="38" fill="#f0f5ee" fontSize="20" textAnchor="middle">{selected?`${thickness} mm`:''}</text>
    <g transform="translate(250 0)"><g className="finish-mid"><path d="M45 163L1 183" stroke="#f0f5ee" strokeWidth="2" markerEnd={`url(#finish-arrow-${id})`}/></g></g>
   </g>
   <text x="302" y="157" fill="#f0f5ee" fontSize="17"><tspan x="302">Capa de</tspan><tspan x="302" dy="21">acabado</tspan></text>
   <path d="M65 179L137 207" stroke="#f0f5ee" markerEnd={`url(#finish-arrow-${id})`}/><text x="35" y="167" fill="#f0f5ee" fontSize="18">Muro</text>
  </svg>
  <figcaption>{selected?`Capa de ${thickness} mm. `:'Selecciona un espesor para ver la capa. '}Detalle ampliado, sin escala.<span>El verde identifica la capa; el acabado es blanco.</span></figcaption>
 </figure>;
}
