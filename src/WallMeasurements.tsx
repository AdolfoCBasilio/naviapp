import {blankSurface,surfaceArea,type Surface} from './surfaces';
import {SurfaceFields} from './SurfaceFields';

type Props={surfaces:Surface[];errors:Record<string,string>;onChange:(surfaces:Surface[])=>void};
export function WallMeasurements({surfaces,errors,onChange}:Props){
 const valid=surfaces.map(surfaceArea).filter((area):area is number=>area!==null);
 const total=valid.reduce((sum,area)=>sum+area,0);
 return <section className="wall-measurements" aria-label="Medidas de los muros">
  <h2>1. Medidas del muro</h2>
  {surfaces.map((surface,i)=><SurfaceFields key={surface.id} surface={surface} index={i} errors={errors} onChange={next=>onChange(surfaces.map((s,j)=>j===i?next:s))} onRemove={surfaces.length>1?()=>onChange(surfaces.filter((_,j)=>i!==j)):undefined}/>)}
  <div className="surface-total"><button type="button" className="text-button" onClick={()=>onChange([...surfaces,blankSurface('dimensions')])}>＋ Agregar otro muro</button><p>Área total <strong>{valid.length&&Number.isFinite(total)?total.toLocaleString('es-MX',{maximumFractionDigits:3}):'—'} m²</strong></p></div>
  {valid.length<surfaces.length&&<p className="wall-pending">{valid.length} de {surfaces.length} muros con medidas válidas. Completa los pendientes antes de calcular.</p>}
 </section>;
}
