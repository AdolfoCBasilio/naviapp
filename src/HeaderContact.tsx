import {useRef,useState} from 'react';
import {ContactConfirmation} from './ContactConfirmation';
import {mapsUrl,whatsappGreetingUrl} from './contact';

export function WhatsAppIcon(){
 return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4.1 14.2 3 17l3.1-.9a7 7 0 1 0-2-1.9Z"/>
    <path d="M7.7 6.5c-.6 0-1 .6-.9 1.4.3 2.1 2.7 4.4 4.8 4.8.8.1 1.4-.3 1.5-.9l-1.8-1-1 1c-1.1-.6-1.9-1.4-2.5-2.5l.9-1Z"/>
   </svg>;
}

export function LocationIcon(){
 return <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M16 8c0 4-6 8.5-6 8.5S4 12 4 8a6 6 0 1 1 12 0Z"/><circle cx="10" cy="8" r="2"/>
   </svg>;
}

const contactActions={
 maps:{title:'¿Quieres ver cómo llegar a NAVI?',confirm:'Sí, quiero ver la ubicación',url:mapsUrl},
 whatsapp:{title:'¿Quieres mandar el WhatsApp ahora?',confirm:'Sí, quiero enviar WhatsApp',url:whatsappGreetingUrl},
};

export function HeaderContact(){
 const [pending,setPending]=useState<keyof typeof contactActions>();
 const trigger=useRef<HTMLButtonElement>(null);
 const action=pending?contactActions[pending]:undefined;

 const ask=(kind:keyof typeof contactActions,button:HTMLButtonElement)=>{
  trigger.current=button;
  setPending(kind);
 };
 const close=()=>{
  setPending(undefined);
  trigger.current?.focus();
 };

 return <div className="header-contact" role="group" aria-label="Ubicación y contacto de NAVI">
  <button type="button" aria-haspopup="dialog" onClick={event=>ask('maps',event.currentTarget)}>
   <LocationIcon/>
   <span>Cómo llegar</span>
  </button>
  <button type="button" aria-haspopup="dialog" onClick={event=>ask('whatsapp',event.currentTarget)}>
   <WhatsAppIcon/>
   <span>WhatsApp</span>
  </button>
  <ContactConfirmation action={action} onClose={close}/>
 </div>;
}
