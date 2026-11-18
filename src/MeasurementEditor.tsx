import {useLayoutEffect,useRef,useState,type RefObject} from 'react';

type Draft<Key>={key:Key;value:string;lastValid:string;error:boolean};
const mobileEditor='(max-width: 799px), (pointer: coarse)';

export function useMeasurementEditor<Key extends string>({
 card,values,parse,onChange,order,enabled=true,normalize=value=>value,
}:{
 card:RefObject<HTMLElement|null>;values:Record<Key,string>;parse:(value:string)=>number;
 onChange:(key:Key,value:string)=>void;order:readonly Key[];enabled?:boolean;normalize?:(value:string)=>string;
}){
 const inputs=useRef<Partial<Record<Key,HTMLInputElement>>>({});
 const scrollBeforeEdit=useRef<number|null>(null);
 const [focus,setFocus]=useState<Key>();
 const [next,setNext]=useState<Key>();
 const [draft,setDraft]=useState<Draft<Key>>();
 const editing=!!draft;

 useLayoutEffect(()=>{
  if(editing||scrollBeforeEdit.current===null)return;
  const scroll=card.current?.closest('main');
  if(scroll)scroll.scrollTop=scrollBeforeEdit.current;
  scrollBeforeEdit.current=null;
  card.current?.focus({preventScroll:true});
 },[card,editing]);

 function begin(key:Key){
  setFocus(key);
  if(!enabled||editing||!window.matchMedia?.(mobileEditor).matches)return;
  scrollBeforeEdit.current=card.current?.closest('main')?.scrollTop??0;
  setNext(undefined);
  setDraft({key,value:values[key],lastValid:values[key],error:false});
 }

 function edit(key:Key){
  inputs.current[key]?.focus({preventScroll:enabled});
  inputs.current[key]?.select();
 }

 function change(key:Key,value:string){
  if(draft?.key===key){
   setDraft({...draft,value,lastValid:Number.isFinite(parse(value))?value:draft.lastValid,error:false});
  }else onChange(key,value);
 }

 function finish(accept:boolean){
  if(!draft)return;
  if(accept&&!Number.isFinite(parse(draft.value))){
   setDraft({...draft,error:true});
   return;
  }
  inputs.current[draft.key]?.blur();
  setFocus(undefined);
  setDraft(undefined);
  if(!accept)return;
  setNext(order.find(key=>key!==draft.key&&!Number.isFinite(parse(values[key]))));
  const value=normalize(draft.value);
  if(value!==values[draft.key])onChange(draft.key,value);
 }

 return {inputs,draft,next,setNext,active:draft?.key??focus??next,begin,edit,change,finish,blur:()=>setFocus(undefined)};
}

export function MeasurementActions({onFinish}:{onFinish:(accept:boolean)=>void}){
 return <div className="measurement-edit-actions" onPointerDown={event=>event.preventDefault()}>
  <button type="button" className="secondary" onClick={()=>onFinish(false)}>Cancelar</button>
  <button type="button" className="primary" onClick={()=>onFinish(true)}>Aceptar medida</button>
 </div>;
}
