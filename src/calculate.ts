export function decimal(value:string):number { return /^\d+(?:[.,]\d+)?$/.test(value.trim()) ? Number(value.trim().replace(',','.')) : NaN; }
export function positive(value:string):number { const n=decimal(value); return Number.isFinite(n)&&n>0?n:NaN; }
export function estimate(area:number,coverage:number,price?:number) {
 if(!Number.isFinite(area)||area<=0||!Number.isFinite(coverage)||coverage<=0) throw new Error('El área y el rendimiento deben ser mayores que cero.');
 const quantity=Math.ceil(area/coverage);
 if(!Number.isSafeInteger(quantity)|| (price!==undefined&&!Number.isFinite(quantity*price))) throw new Error('Las medidas son demasiado grandes. Revisa los valores ingresados.');
 return {area,quantity,price,total:price===undefined?undefined:quantity*price};
}
export const money=(n:number)=>`$${n.toLocaleString('en-US',{maximumFractionDigits:2})} MXN`;

/** Rectangular void: metres × millimetres × millimetres / 1000 = litres. */
export function crackVolumeLitres(lengthM:number,widthMm:number,depthMm:number) {
 if([lengthM,widthMm,depthMm].some(n=>!Number.isFinite(n)||n<=0))throw new Error('Ingresa medidas mayores que cero.');
 const litres=lengthM*(widthMm/1000)*depthMm;
 if(!Number.isFinite(litres)||litres<=0)throw new Error('Revisa las medidas de la grieta.');
 return litres;
}
export function estimateVolume(volumeLitres:number,litresPerContainer:number,price?:number){
 const calculated=estimate(volumeLitres,litresPerContainer,price);
 // Neutralize only floating-point noise at exact container boundaries:
 // e.g. 37.8 m × 10 mm × 10 mm can become 3.7800000000000002 L.
 const ratio=volumeLitres/litresPerContainer,nearest=Math.round(ratio);
 const tolerance=Number.EPSILON*4*Math.max(1,Math.abs(ratio));
 const quantity=nearest>0&&Math.abs(ratio-nearest)<=tolerance?nearest:calculated.quantity;
 return {volumeLitres,quantity,price,total:price===undefined?undefined:quantity*price};
}
