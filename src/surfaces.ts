import {positive} from './calculate';

let nextSurfaceId=0;
export type Surface={id:string;mode:'area'|'dimensions';area:string;length:string;side:string};
export const blankSurface=(mode:Surface['mode']='area'):Surface=>({id:`surface-${++nextSurfaceId}`,mode,area:'',length:'',side:''});
/** An incomplete, invalid, overflowing or underflowing surface has no valid area. */
export function surfaceArea(surface:Surface):number|null {
 const area=surface.mode==='area'?positive(surface.area):positive(surface.length)*positive(surface.side);
 return Number.isFinite(area)&&area>0?area:null;
}

export function completeSurfaceArea(surfaces:Surface[]):number|null {
 let total=0;
 for(const surface of surfaces){
  const area=surfaceArea(surface);
  if(area===null)return null;
  total+=area;
 }
 return Number.isFinite(total)?total:null;
}
