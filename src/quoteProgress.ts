import {baseCementoApplications,products,type BaseCementoUse} from './catalog';
import {blankCrack,type Crack} from './CrackMeasurements';
import type {QuoteItem} from './MultiProductQuote';
import type {QuoteResult} from './quoteResult';
import {blankSurface,type Surface} from './surfaces';

type Measurements={
 surfaces:Surface[];
 coverage:string;
 cracks:Crack[];
 baseUse:BaseCementoUse;
 morteroMode:'cemix'|'theoretical';
};

export type SavedQuoteItem=QuoteItem&Measurements;
export type QuoteProgress=Measurements&{
 work:string;
 productId:string;
 changing:boolean;
 thickness:string;
 result:QuoteResult|null;
 quoteItems:SavedQuoteItem[];
 editingItem:number|null;
};

const storageKey='navi-quote-progress-v1';

function restoreMeasurements<T extends Measurements>(saved:T):T{
 return {
  ...saved,
  // Restored rows need fresh IDs so adding rows after a reload cannot reuse them.
  surfaces:saved.surfaces.map(({mode,area,length,side})=>({...blankSurface(mode),area,length,side})),
  cracks:saved.cracks.map(({length,width,depth})=>({...blankCrack(),length,width,depth})),
 };
}

function hasMeasurements(saved:Measurements){
 return typeof saved.coverage==='string'
  && Object.hasOwn(baseCementoApplications,saved.baseUse)
  && ['cemix','theoretical'].includes(saved.morteroMode)
  && Array.isArray(saved.surfaces) && saved.surfaces.length>0
  && saved.surfaces.every(row=>row && ['area','dimensions'].includes(row.mode)
   && [row.area,row.length,row.side].every(value=>typeof value==='string'))
  && Array.isArray(saved.cracks) && saved.cracks.length>0
  && saved.cracks.every(row=>row && [row.length,row.width,row.depth].every(value=>typeof value==='string'));
}

export function readQuoteProgress():QuoteProgress|undefined{
 try{
  const stored=window.localStorage.getItem(storageKey);
  if(!stored)return;
  const saved:QuoteProgress=JSON.parse(stored);
  if(!saved||!hasMeasurements(saved)||!Array.isArray(saved.quoteItems)
   ||typeof saved.work!=='string'||typeof saved.productId!=='string'
   ||typeof saved.changing!=='boolean'||typeof saved.thickness!=='string')return;
  const product=products.find(item=>item.id===saved.productId);
  const quoteItems=saved.quoteItems.filter(item=>item && Number.isSafeInteger(item.id)
   && item.result?.productId===item.product?.id && products.some(product=>product.id===item.product?.id)
   && hasMeasurements(item)).map(restoreMeasurements);
  return {
   ...restoreMeasurements(saved),
   productId:product?.id??'',
   result:product&&saved.result?.productId===product.id?saved.result:null,
   quoteItems,
   editingItem:quoteItems.some(item=>item.id===saved.editingItem)?saved.editingItem:null,
  };
 }catch{
  return undefined;
 }
}

export function storeQuoteProgress(serialized:string){
 try{
  window.localStorage.setItem(storageKey,serialized);
  return true;
 }catch{
  return false;
 }
}
