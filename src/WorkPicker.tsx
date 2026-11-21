import {products} from './catalog';

const works=[
 ['block','Dar acabado a un muro de block'],
 ['concreto','Recubrir concreto liso'],
 ['piso','Nivelar un piso o losa'],
 ['revestimientos','Pegar porcelanato o loseta'],
 ['azotea','Impermeabilizar una azotea'],
 ['resanes','Resanar grietas'],
 ['sellados','Hacer sellados puntuales'],
 ['colado','Preparar concreto para un colado'],
] as const;
type Work=(typeof works)[number][0];

function WorkIcon({work}:{work:Work}){
 return <svg className="work-icon" viewBox="0 0 56 48" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  {work==='block'&&<>
   <rect x="6" y="8" width="44" height="33" rx="1"/>
   <path d="M6 16h44M6 24h44M6 33h44M28 8v8m0 17v8M17 16v8m22-8v8"/>
   <path className="work-icon-accent" d="M17 33v-9h22v9"/>
  </>}
  {work==='concreto'&&<>
   <path d="M20 41H6V7h39v10m2 0 4 3-10 18-11-10 17-11Z"/>
   <path className="work-icon-accent" d="m33 32-7 7a2.5 2.5 0 0 0 4 3l7-8"/>
  </>}
  {work==='piso'&&<>
   <path d="M8 23 1 37h54l-8-14H8Z"/>
   <rect className="work-icon-accent" x="11" y="15" width="34" height="8" rx="1"/>
   <path className="work-icon-accent" d="M24 15a4 4 0 0 0 8 0"/>
  </>}
  {work==='revestimientos'&&<>
   <rect x="8" y="7" width="38" height="34" rx="2"/>
   <path className="work-icon-accent" d="M27 7v34M8 24h38"/>
  </>}
  {work==='azotea'&&<>
   <path d="M3 42V24h50v18M3 24l8-8h21m15 1 6 7M13 42v-9h9v9"/>
   <path className="work-icon-accent" d="M42 3c-2 4-5 7-5 10a5 5 0 0 0 10 0c0-3-3-6-5-10Z"/>
  </>}
  {work==='resanes'&&<>
   <rect x="4" y="9" width="48" height="30" rx="1"/>
   <path className="work-icon-accent" d="m29 9 2 5-6 6 6 7-7 6 4 6"/>
  </>}
  {work==='colado'&&<>
   <path d="m5 20 23-11 23 11-23 11Zm0 0v9l23 11 23-11v-9M28 31v9"/>
   <path className="work-icon-accent" d="m18 16 22 10M38 14 16 25"/>
  </>}
  {work==='sellados'&&<>
   <path d="m30 21 17-16 8 8-17 17-8-9Zm1 2-7 16 13-10m-9 12h23"/>
   <path className="work-icon-accent" d="M2 41c6 2 9-4 15-1 4 2 6 1 7-1"/>
  </>}
 </svg>;
}

export function WorkPicker({onPick}:{onPick:(work:Work)=>void}){
 return <>
  <p className="work-intro">Elige el trabajo que vas a realizar.</p>
  <ul className="work-list" aria-label="Tipos de trabajo">
   {works.filter(([id])=>products.some(product=>product.work===id&&product.quotable!==false)).map(([id,label])=><li key={id}>
    <button type="button" className="work-card" onClick={()=>onPick(id)}>
     <WorkIcon work={id}/>
     <span>{label}</span>
     <svg viewBox="0 0 20 20" className="work-chevron" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m7 5 5 5-5 5"/></svg>
    </button>
   </li>)}
  </ul>
 </>;
}
