import {useId} from 'react';

export type FloorDimension='length'|'width';
type FloorDiagramProps={
 length:number; width:number; activeDimension:FloorDimension|null;
 lengthFieldId:string; widthFieldId:string; surfaceNumber:number;
 onSelectDimension:(dimension:FloorDimension)=>void;
};

const measure=(n:number)=>Number.isFinite(n)&&n>0?` · ${n.toLocaleString('es-MX',{maximumSignificantDigits:6})} m`:'';

function floorScale(metres:number){
 return Number.isFinite(metres)&&metres>0 ? .55+.45*(metres/(metres+3)) : .55;
}

export function FloorDiagram({length,width,activeDimension,lengthFieldId,widthFieldId,surfaceNumber,onSelectDimension}:FloorDiagramProps){
 const id=useId();
 const arrow=`url(#floor-arrow-${id})`;
 const scaleX=floorScale(length), scaleY=floorScale(width);
 const dimensionClass=(dimension:FloorDimension)=>`floor-dimension${activeDimension===dimension?' is-active':''}`;
 const dimensionButton=(dimension:FloorDimension,label:string,value:number,fieldId:string)=><button
  type="button" className={`floor-cota${activeDimension===dimension?' is-active':''}`}
  aria-controls={fieldId} aria-label={`Editar ${label.toLowerCase()} de superficie ${surfaceNumber}${measure(value)}`}
  onClick={()=>onSelectDimension(dimension)}>{label}{measure(value)} <span aria-hidden="true">✎</span></button>;

 return <figure className="floor-diagram">
  <svg viewBox="0 0 380 170" aria-hidden="true" focusable="false">
   <defs><marker id={`floor-arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="context-stroke"/></marker></defs>
   <g className="floor-motion" data-floor-plane style={{transform:`translate(184px, 135px) scale(${scaleX}, ${scaleY})`}}>
    <path d="M-156 0-85-114H85L156 0Z" fill="#88908a" stroke="#d5dcd6" strokeWidth="2" vectorEffect="non-scaling-stroke"/>
    <path d="M-138-29H138M-120-58H120M-102-86H102M-101 0-55-114M-51 0-28-114M0 0V-114M51 0 28-114M101 0 55-114" fill="none" stroke="#bdc5be" vectorEffect="non-scaling-stroke"/>
   </g>
   <path className="floor-motion" style={{transform:`translateX(184px) scaleX(${scaleX})`}} d="M-156 136H156V146H-156Z" fill="#656e68"/>
   <g className={dimensionClass('length')} data-dimension="length" data-active={activeDimension==='length'}>
    <path className="floor-motion" style={{transform:`translateX(184px) scaleX(${scaleX})`}} d="M-152 157H152" markerStart={arrow} markerEnd={arrow} vectorEffect="non-scaling-stroke"/>
   </g>
   <g className={dimensionClass('width')} data-dimension="width" data-active={activeDimension==='width'}>
    <g className="floor-motion" style={{transform:`translate(${198+156*scaleX}px, 135px) scale(${scaleX}, ${scaleY})`}}>
     <path d="M-71-114 0 0" markerStart={arrow} markerEnd={arrow} vectorEffect="non-scaling-stroke"/>
    </g>
   </g>
  </svg>
  <div className="floor-cotas">
   {dimensionButton('length','Largo',length,lengthFieldId)}
   {dimensionButton('width','Ancho',width,widthFieldId)}
  </div>
  <figcaption>Guía visual, no es un plano a escala.</figcaption>
 </figure>;
}

export function MortarSection({thickness}:{thickness:string}){
 const id=useId();
 const arrow=`url(#layer-arrow-${id})`;
 const selected=Number(thickness)>0;
 // Exaggerate small values so the theoretical options remain distinguishable.
 const layerHeight=selected?5+6*Math.sqrt(Number(thickness)):0;
 const top={transform:`translateY(${-layerHeight}px)`};

 return <figure className="mortar-section">
  <svg viewBox="0 0 360 140" aria-hidden="true" focusable="false">
   <defs><marker id={`layer-arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M1 1L9 5L1 9Z" fill="#B8F55E"/></marker></defs>
   <path d="M20 78H230V124H20Z" fill="#808982" data-mortar-base/>
   <rect className="floor-motion mortar-layer" style={{y:78-layerHeight,height:layerHeight}} x="20" width="210" fill="#B8F55E"/>
   <path className="floor-motion mortar-top" style={top} d="M20 78 34 64H230V78Z" fill={selected?'#d0fb91':'#a4ada6'}/>
   <g className="mortar-gauge floor-motion" opacity={selected?1:0}>
    <path className="floor-motion" style={top} d="M230 78h15" stroke="#B8F55E"/>
    <path d="M230 78h15" stroke="#B8F55E"/>
    <g className="floor-motion" style={{transform:`translate(248px, 78px) scaleY(${layerHeight/50})`}}>
     <path d="M0-46V-4" stroke="#B8F55E" strokeWidth="2" vectorEffect="non-scaling-stroke" markerStart={arrow} markerEnd={arrow}/>
    </g>
   </g>
   <text x="262" y="57" fill="#f0f5ee" fontSize="16">Espesor</text>
   {selected&&<text x="262" y="79" fill="#B8F55E" fontSize="16">{thickness} mm</text>}
  </svg>
  <figcaption>Verde: mortero · Gris: base. Ilustración sin escala.</figcaption>
 </figure>;
}
