export function decimal(value:string):number { return /^\d+(?:[.,]\d+)?$/.test(value.trim()) ? Number(value.trim().replace(',','.')) : NaN; }
export function positive(value:string):number { const n=decimal(value); return Number.isFinite(n)&&n>0?n:NaN; }
export function estimate(area:number,coverage:number,price?:number) {
 if(!Number.isFinite(area)||area<=0||!Number.isFinite(coverage)||coverage<=0) throw new Error('El área y el rendimiento deben ser mayores que cero.');
 const quantity=Math.ceil(area/coverage);
 if(!Number.isSafeInteger(quantity)|| (price!==undefined&&!Number.isFinite(quantity*price))) throw new Error('Las medidas son demasiado grandes. Revisa los valores ingresados.');
 return {area,quantity,price,total:price===undefined?undefined:quantity*price};
}
export const money=(n:number)=>`$${n.toLocaleString('en-US',{maximumFractionDigits:2})} MXN`;
