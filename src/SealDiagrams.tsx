import {useId, type ReactNode} from 'react';
import type {CrackDimension} from './CrackMeasurements';

export function SealSpan({length, pending, active, control}:{
 length:number; pending:boolean; active:boolean; control:ReactNode;
}){
 const id=useId();
 const arrow=`url(#seal-arrow-${id})`;
 return <div className="seal-span">
  <svg viewBox="0 0 350 168" aria-hidden="true">
   <defs>
    <linearGradient id={`seal-slab-${id}`} x2="0" y2="1"><stop stopColor="#78817b"/><stop offset="1" stopColor="#a9b0a8"/></linearGradient>
    <marker id={`seal-arrow-${id}`} viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 9 5 1 9Z" fill="context-stroke"/></marker>
   </defs>
   <path d="M12 95 245 30l93 48-233 67Z" fill={`url(#seal-slab-${id})`} stroke="#c2cac1"/>
   <path d="M12 95l93 50v18l-93-50Z" fill="#677169"/>
   <path d="M105 145l233-67v18l-233 67Z" fill="#848e85"/>
   <path d="M12 95V79l233-65v16Z" fill="#b2bab0" stroke="#c2cac1"/>
   <path d="M245 14l93 48v16l-93-48Z" fill="#9aa49a" stroke="#c2cac1"/>
   <g className="repair-motion" data-seal-span style={{transform:`translate(72px,115px) skewY(-15deg) scaleX(${length/230})`}}>
    <path d="M0 0h230" stroke={pending?'#d2d9d0':'var(--lime)'} strokeWidth="3" strokeDasharray={pending?'5 4':undefined} vectorEffect="non-scaling-stroke"/>
    <g className="repair-gauge" data-active={active}>
     <path d="M0-5v-15m230 15v-15"/>
     <path d="M4-15h222" markerStart={arrow} markerEnd={arrow}/>
    </g>
   </g>
  </svg>
  {control}
 </div>;
}

export function SealCut({width, depth, pending, active, widthControl, depthControl}:{
 width:number; depth:number; pending:boolean; active?:CrackDimension;
 widthControl:ReactNode; depthControl:ReactNode;
}){
 const id=useId();
 const left=155-width/2, right=155+width/2;
 return <div className="seal-cut">
  <svg viewBox="0 0 360 160" preserveAspectRatio="none" aria-hidden="true">
   <defs>
    <pattern id={`seal-concrete-${id}`} width="47" height="36" patternUnits="userSpaceOnUse">
     <rect width="47" height="36" fill="#9aa39b"/>
     <path d="M4 8l4-2 2 3-3 3Zm23 17 4-4 4 3-2 4Zm13-15 3-1 1 3Z" fill="#6c776f" opacity=".55"/>
     <circle cx="18" cy="32" r="1.5" fill="#d0d6ce"/>
    </pattern>
   </defs>
   <rect x="5" y="63" width="350" height="79" rx="7" fill={`url(#seal-concrete-${id})`}/>
   <path d="M9 65h342" stroke="#cbd2ca" strokeWidth="3"/>
   <rect className="repair-motion seal-fill" data-seal-fill width="1" height="1" fill={pending?'#657568':'var(--lime)'}
    style={{transform:`translate(${left}px, 63px) scale(${width}, ${depth})`}}/>
   <g className="repair-gauge" data-active={active==='width'}>
    <path className="repair-motion" style={{transform:`translateX(${left}px)`}} d="M0 44v17m0-9 5-4m-5 4 5 4"/>
    <path className="repair-motion" style={{transform:`translate(${left}px,52px) scaleX(${width})`}} d="M0 0h1"/>
    <path className="repair-motion" style={{transform:`translateX(${right}px)`}} d="M0 44v17m0-9-5-4m5 4-5 4"/>
   </g>
   <g className="repair-gauge" data-active={active==='depth'}>
    <path d="M209 63h25m-12 0-4 5m4-5 4 5"/>
    <path className="repair-motion" style={{transform:`translate(222px,63px) scaleY(${depth})`}} d="M0 0v1"/>
    <path className="repair-motion" style={{transform:`translateY(${depth}px)`}} d="M209 63h25m-12 0-4-5m4 5 4-5"/>
   </g>
   <text x="13" y="43" className="seal-svg-label">Superficie</text>
   <path d="M44 48l7 15" stroke="#f0f5ee" fill="none"/>
   <path className="repair-motion" style={{transform:`translate(155px, ${63+depth/2}px) scaleY(${(75-depth/2)/70})`}}
    d="M0 0v70" stroke="#f5f5f2" vectorEffect="non-scaling-stroke"/>
   <circle className="repair-motion" style={{transform:`translateY(${depth/2}px)`}} cx="155" cy="63" r="2.5" fill="#f5f5f2"/>
  </svg>
  {widthControl}
  {depthControl}
  <span className="seal-material">Material de sellado</span>
 </div>;
}
