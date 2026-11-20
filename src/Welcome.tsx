import {type MouseEvent,type Ref} from 'react';
import {BrandLogo} from './BrandLogo';
import {mapsUrl,whatsappUrl} from './contact';

const entries=[
 {href:whatsappUrl,label:'Mándanos un WhatsApp',icon:'M4.1 14.2 3 17l3.1-.9a7 7 0 1 0-2-1.9ZM7.7 6.5c-.6 0-1 .6-.9 1.4.3 2.1 2.7 4.4 4.8 4.8.8.1 1.4-.3 1.5-.9l-1.8-1-1 1c-1.1-.6-1.9-1.4-2.5-2.5l.9-1Z'},
 {href:mapsUrl,label:'Ver dónde está NAVI',icon:'M16 8c0 4-6 8.5-6 8.5S4 12 4 8a6 6 0 1 1 12 0ZM12 8a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z'},
 {href:'#catalogo',label:'Ir a catálogo y cotizador',icon:'M5 2.5h10a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2ZM3 7h14m-10 4h.1m2.9 0h.1m2.9 0h.1M7 14h.1m2.9 0h.1m2.9 0h.1'},
] as const;

function WelcomePlan(){
 return <svg className="welcome-plan" viewBox="0 0 360 204" fill="none" aria-hidden="true" focusable="false">
  <g stroke="currentColor">
   <path d="M0 199l66-36h211v-45h83M17 204l59-32h210v-46h74M23 204l58-29h208v-46h71M77 198v-47h139v-43h61V82h83M216 171v-58h70V89h74"/>
   <path d="M65 204v-56m151 26V100m61 68V74m54 104V76M62 151h298M141 186v-58h75" strokeDasharray="2 3"/>
   <path d="M245 172a41 41 0 0 1 41-41v41m0 0h74M62 148l6 6m145-48 6 6m55-32 6 6m48 61 6 6"/>
  </g>
 </svg>;
}

function ExternalArrow(){
 return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M11 4h5v5m0-5-7 7m7 0v5H4V4h5"/>
 </svg>;
}

export function Welcome({contentRef,headingRef,onNavigate}:{
 contentRef:Ref<HTMLElement>;headingRef:Ref<HTMLHeadingElement>;onNavigate:()=>void;
}){
 const open=(event:MouseEvent<HTMLAnchorElement>)=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  onNavigate();
 };

 return <main id="contenido" className="welcome-view" ref={contentRef}>
  <div className="welcome-layout">
   <div className="welcome-decoration"><WelcomePlan/><WelcomePlan/></div>
   <div className="welcome-content">
    <BrandLogo/>
    <h1 className="welcome-title" ref={headingRef} tabIndex={-1}>Bienvenido a NAVI</h1>
    <nav className="welcome-actions" aria-label="Entrar a NAVI">
     {entries.map(({href,label,icon})=>{
      const external=href!=='#catalogo';
      return <a key={href} className={href===whatsappUrl?'welcome-card welcome-card-primary':'welcome-card'}
       href={href} target={external?'_blank':undefined} rel={external?'noopener noreferrer':undefined}
       onClick={external?undefined:open}>
       <svg className="welcome-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon}/></svg>
       <strong>{label}</strong>
       {external?<ExternalArrow/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h17m-7-7 7 7-7 7"/></svg>}
      </a>;
     })}
    </nav>
   </div>
  </div>
 </main>;
}
