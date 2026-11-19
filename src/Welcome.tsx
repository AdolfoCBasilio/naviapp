import {type MouseEvent,type Ref} from 'react';
import {BrandLogo} from './BrandLogo';
import {mapsUrl,whatsappUrl} from './contact';

const entries=[
 {section:'catalogo',label:'Ver catálogo',description:'Explora productos, presentaciones y precios.'},
 {section:'cotizador',label:'Ir al cotizador',description:'Calcula cuánto material necesitas y su costo estimado.'},
] as const;
type Section=(typeof entries)[number]['section'];

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
 contentRef:Ref<HTMLElement>;headingRef:Ref<HTMLHeadingElement>;onNavigate:(section:Section)=>void;
}){
 const open=(event:MouseEvent<HTMLAnchorElement>,section:Section)=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  onNavigate(section);
 };

 return <main id="contenido" className="welcome-view" ref={contentRef}>
  <div className="welcome-layout">
   <div className="welcome-decoration"><WelcomePlan/><WelcomePlan/></div>
   <div className="welcome-content">
    <BrandLogo/>
    <div className="welcome-copy">
     <h1 ref={headingRef} tabIndex={-1}>Bienvenido a NAVI</h1>
     <p>Encuentra los materiales para tu obra y calcula cuánto necesitas.</p>
    </div>
    <nav className="welcome-actions" aria-label="Entrar a NAVI">
     {entries.map(({section,label,description})=><a key={section} className={`welcome-card welcome-card-${section}`}
      href={`#${section}`} aria-labelledby={`welcome-${section}`} aria-describedby={`welcome-${section}-description`}
      onClick={event=>open(event,section)}>
      <svg className="welcome-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
       {section==='catalogo'?<><rect x="3" y="3" width="26" height="26" rx="4"/><path d="M12 3v26M20 3v26M3 12h26M3 20h26"/></>:<>
        <rect x="3" y="2" width="26" height="28" rx="4"/><path d="M3 11h26"/>
        {[10,16,22].map(x=><path key={x} d={`M${x} 17h.1m-.1 6h.1`} strokeWidth="3.5"/>)}
       </>}
      </svg>
      <span className="welcome-card-copy"><strong id={`welcome-${section}`}>{label}</strong><span id={`welcome-${section}-description`}>{description}</span></span>
      <svg className="welcome-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 12h17m-7-7 7 7-7 7"/></svg>
     </a>)}
    </nav>
   </div>
   <footer className="welcome-contact">
    <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
     <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M16 8c0 4-6 8.5-6 8.5S4 12 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/></svg>
     <span><strong>Martínez de la Torre, Veracruz</strong><small>Cómo llegar en Google Maps</small></span>
     <ExternalArrow/>
    </a>
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
     <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.1 14.2 3 17l3.1-.9a7 7 0 1 0-2-1.9Z"/>
      <path d="M7.7 6.5c-.6 0-1 .6-.9 1.4.3 2.1 2.7 4.4 4.8 4.8.8.1 1.4-.3 1.5-.9l-1.8-1-1 1c-1.1-.6-1.9-1.4-2.5-2.5l.9-1Z"/>
     </svg>
     <span><strong>Escríbenos por WhatsApp</strong><small>232 174 9491</small></span>
     <ExternalArrow/>
    </a>
   </footer>
  </div>
 </main>;
}
