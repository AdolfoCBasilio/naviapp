import type {Crack} from './CrackMeasurements';

type BaseApplication={label:string;coats:number;water:string;note:string;tableCoverage:number};
export type QuoteResult={productId:string;quantity:number;price?:number;total?:number;thickness:string;coverage:number;summary:string;theoretical:boolean;application?:BaseApplication}&({kind:'area';area:number}|{kind:'cracks';volumeLitres:number;cracks:Crack[]});
export const theoreticalNote='Cálculo teórico no validado por Cemix. Espesor fuera del rango de aplicación de 10–50 mm indicado por el fabricante. Este cálculo de consumo no confirma la aptitud del producto para capas delgadas; consulta a Cemix antes de aplicarlo.';
export const coverageDisplay=(n:number,productId:string)=>n.toFixed(['mortero','diez'].includes(productId)?2:1);
export const format=(n:number)=>n.toLocaleString('es-MX',{maximumFractionDigits:3});
export const quantityLabel=(quantity:number,unit:string,plural:string)=>`${quantity} ${quantity===1?unit:plural} ${unit==='bulto'?(quantity===1?'completo':'completos'):(quantity===1?'completa':'completas')}`;
export const capturedMeasure=(n:number)=>n.toLocaleString('es-MX',{maximumSignificantDigits:15});
