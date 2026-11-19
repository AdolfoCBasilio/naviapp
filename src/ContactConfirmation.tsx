import {useId,useLayoutEffect,useRef} from 'react';

export type ContactAction={title:string;confirm:string;url:string;cancel?:string};

export function ContactConfirmation({action,onClose}:{action?:ContactAction;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const titleId=useId();

 useLayoutEffect(()=>{
  if(action&&!dialog.current?.open)dialog.current?.showModal();
 },[action]);

 return <dialog ref={dialog} className="contact-confirmation" aria-labelledby={titleId} onClose={onClose}>
  {action&&<>
   <h2 id={titleId}>{action.title}</h2>
   <div className="contact-confirmation-actions">
    <button type="button" className="secondary" autoFocus onClick={()=>dialog.current?.close()}>{action.cancel??'No por el momento'}</button>
    <a className="primary" href={action.url} target="_blank" rel="noopener noreferrer" onClick={()=>dialog.current?.close()}>{action.confirm}</a>
   </div>
  </>}
 </dialog>;
}
