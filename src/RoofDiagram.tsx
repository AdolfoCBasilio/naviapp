import {useEffect,useId,useRef,useState} from 'react';

type Size={length:number;width:number};
type Point=[number,number];
export type RoofAxis='length'|'side';

const neutral:Size={length:5,width:3};
const motionQuery='(prefers-reduced-motion: reduce)';
const coordinates=(points:Point[])=>points.map(point=>point.join(',')).join(' ');

function animate(duration:number, update:(progress:number)=>void){
 const start=performance.now();
 let frame=requestAnimationFrame(function draw(now){
  const progress=Math.min(1,Math.max(0,(now-start)/duration));
  update(progress);
  if(progress<1)frame=requestAnimationFrame(draw);
 });
 return ()=>cancelAnimationFrame(frame);
}

// Enlarge either axis at the same scale until the drawing reaches the viewport bounds.
function fitRoof(length:number,width:number):Size {
 const extent=Math.max(length,width,12);
 length=length/extent*12;
 width=width/extent*12;
 const scale=Math.min(31,350/(length+.48*width),104/(.62*width));
 return {length:length*scale,width:width*scale};
}

function roofProjection({length,width}:Size){
 const left=212-(length+.48*width)/2;
 return (x:number,y:number,z=0):Point=>[left+x+.48*y,172-.62*y-z];
}

function useRoofMotion(length:number,width:number,ready:boolean,directArea?:number){
 const [reduced,setReduced]=useState(()=>window.matchMedia?.(motionQuery).matches??false);
 const [size,setSize]=useState(()=>fitRoof(length,width));
 const latestSize=useRef(size);
 const [paint,setPaint]=useState(0);

 useEffect(()=>{
  const media=window.matchMedia?.(motionQuery);
  const sync=()=>setReduced(media?.matches??false);
  media?.addEventListener('change',sync);
  return ()=>media?.removeEventListener('change',sync);
 },[]);
 useEffect(()=>{
  const from=latestSize.current;
  const to=fitRoof(length,width);
  const update=(progress:number)=>{
   const eased=1-(1-progress)**3;
   const next={length:from.length+(to.length-from.length)*eased,width:from.width+(to.width-from.width)*eased};
   latestSize.current=next;
   setSize(next);
  };
  if(reduced){update(1);return;}
  if(from.length===to.length&&from.width===to.width)return;
  return animate(300,update);
 },[length,width,reduced]);
 useEffect(()=>{
  setPaint(ready&&reduced?1:0);
  if(!ready||reduced)return;
  let stop:(()=>void)|undefined;
  const timer=window.setTimeout(()=>{stop=animate(950,setPaint);},350);
  return ()=>{window.clearTimeout(timer);stop?.();};
 },[length,width,ready,directArea,reduced]);
 return {size,paint:ready?(reduced?1:paint):0};
}

export function RoofDiagram({length,width,direct,directArea,ready,active,onEdit,fieldIds}:{
 length?:number; width?:number; direct:boolean; directArea?:number; ready:boolean; active?:RoofAxis;
 onEdit:(axis:RoofAxis)=>void; fieldIds:Record<RoofAxis,string>;
}){
 const id=useId();
 const {size,paint}=useRoofMotion(length??neutral.length,width??neutral.width,ready,directArea);
 const project=roofProjection(size);
 const l=size.length,w=size.width;
 const roof=(end=l)=>coordinates([project(0,0),project(end,0),project(end,w),project(0,w)]);
 const hull=roof();
 const face=coordinates([project(0,0),project(l,0),project(l,0,-40),project(0,0,-40)]);
 const side=coordinates([project(l,0),project(l,w),project(l,w,-40),project(l,0,-40)]);
 const parapetBack=coordinates([project(0,w),project(l,w),project(l,w,8),project(0,w,8)]);
 const parapetLeft=coordinates([project(0,0),project(0,w),project(0,w,8),project(0,0,8)]);
 const [left]=project(0,0);
 const doorScale=Math.min(1,l/125);
 const door=project(l*.26,0,-40);
 const windowAt=project(l*.63,0,-13);
 const rollerAt=project(l*paint,w*.53,3);
 const gauges=[
  {key:'length',label:'Largo',value:length,start:project(0,0),end:project(l,0),offset:[0,11]},
  {key:'side',label:'Ancho',value:width,start:project(l,0),end:project(l,w),offset:[12,0]},
 ] as const;
 const arrow=`url(#roof-arrow-${id})`;

 return <figure className="roof-diagram">
  <div className="roof-scene">
   <svg viewBox="0 42 440 188" aria-hidden="true">
    <defs>
     <clipPath id={`roof-outline-${id}`}><polygon points={hull}/></clipPath>
     <clipPath id={`roof-painted-${id}`}><polygon points={roof(l*paint)}/></clipPath>
     <marker id={`roof-arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" fill="context-stroke"/></marker>
    </defs>
    <polygon points={side} fill="#626b65" stroke="#a8afa8"/>
    <polygon points={face} fill="#8f9690" stroke="#c1c8c1"/>
    {l>=18&&<g transform={`translate(${door.join(' ')}) scale(${doorScale})`}>
     <rect x="-10" y="-34" width="20" height="34" rx="1" fill="#353d38" stroke="#535c55"/>
     <circle cx="5" cy="-15" r="1.3" fill="#ced5cd"/>
    </g>}
    {l>=18&&<g transform={`translate(${windowAt.join(' ')}) scale(${doorScale})`}>
     <rect width="35" height="20" rx="1" fill="#394743" stroke="#636e65" strokeWidth="2"/>
     <path d="M17.5 1v18M3 15l10-11m8 11L31 4" stroke="#778985" fill="none"/>
    </g>}
    <polygon points={hull} fill="#969e96"/>
    <g clipPath={`url(#roof-outline-${id})`}>
     <g clipPath={`url(#roof-painted-${id})`} data-roof-coating>
      <polygon points={hull} fill="#f2f3ef"/>
      {[.2,.4,.6,.8].map(stop=><polyline key={stop} points={coordinates([project(0,w*stop),project(l,w*stop)])} stroke="#e5e8e2" strokeWidth="3"/>)}
     </g>
     {paint>0&&paint<1&&<g transform={`translate(${rollerAt.join(' ')}) rotate(-38)`}>
      <path d="M13 0h7v10H3v9" stroke="#515b54" strokeWidth="2" fill="none"/>
      <path d="M3 16v9" stroke="#27332b" strokeWidth="5" strokeLinecap="round"/>
      <rect x="-12" y="-4" width="26" height="8" rx="3" fill="#fff" stroke="#8a958d"/>
     </g>}
    </g>
    <polygon points={parapetBack} fill="#b7beb7" stroke="#d0d6ce"/>
    <polygon points={parapetLeft} fill="#a8b1a9" stroke="#d0d6ce"/>
    <polygon data-roof-outline points={hull} fill="none" stroke="#B8F55E" strokeWidth="2"/>
    {!direct&&gauges.map(({key,start,end,offset})=>{
     const from:Point=[start[0]+offset[0],start[1]+offset[1]];
     const to:Point=[end[0]+offset[0],end[1]+offset[1]];
     if(Math.hypot(to[0]-from[0],to[1]-from[1])<10)return null;
     return <g key={key} className="roof-gauge" data-active={active===key}>
      <polyline points={coordinates([start,from])}/><polyline points={coordinates([end,to])}/>
      <polyline points={coordinates([from,to])} markerStart={arrow} markerEnd={arrow}/>
     </g>;
    })}
   </svg>
   {!direct&&gauges.map(({key,label,value})=><button key={key} type="button"
    className={`roof-cota roof-cota-${key}`} data-active={active===key}
    style={key==='length'?{left:`${Math.max(24,Math.min(72,(left+l/2)/4.4))}%`}:undefined}
    aria-controls={fieldIds[key]} onClick={()=>onEdit(key)}>
    <span>{label} {value===undefined?'—':value.toLocaleString('es-MX',{maximumSignificantDigits:6})} m</span>
    <span aria-hidden="true">✎</span>
   </button>)}
  </div>
  <figcaption>Vista ilustrativa del área a impermeabilizar<span>La animación no representa avance de obra</span></figcaption>
 </figure>;
}
