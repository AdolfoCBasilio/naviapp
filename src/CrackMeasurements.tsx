import {positive,crackVolumeLitres} from './calculate';
import type {Product} from './catalog';

export type CrackDimension='length'|'width'|'depth';
export type Crack={id:number}&Record<CrackDimension,string>;
let nextCrackId=0;
export const blankCrack=():Crack=>({id:++nextCrackId,length:'',width:'',depth:''});
export const crackFieldId=(crack:Crack,key:CrackDimension)=>`crack-${crack.id}-${key}`;
export const crackMeasure=(value:string)=>positive(value.trim().replace(/^[.,]/,'0$&'));
export const crackVolume=(crack:Crack)=>crackVolumeLitres(crackMeasure(crack.length),crackMeasure(crack.width),crackMeasure(crack.depth));
export const formatVolume=(litres:number)=>litres.toLocaleString('es-MX',{maximumSignificantDigits:6});
export const crackWarning='No usar en grietas con movimiento ni juntas de expansión.';

export const crackEstimateNote='Estimación por volumen rectangular, tomando como referencia 1 L de relleno por bolsa de 2 kg. Cemix publica 1 L por cada 2 kg de producto preparado; el consumo real puede variar. No usar para grietas con movimiento ni juntas de expansión.';

export function volumeReference(product:Product){
 const plastic=product.id==='plastico';
 return {
  item:plastic?'tramo de sellado':'grieta',
  itemTitle:plastic?'Tramo de sellado':'Grieta',
  plural:plastic?'tramos de sellado':'grietas',
  container:plastic?product.unit:'bolsa de 2 kg',
  referenceLabel:plastic?'Contenido nominal':'Referencia de consumo',
  note:plastic?`Estimación geométrica de consumo basada en el contenido nominal de ${product.volumeYieldLitres} L por ${product.unit}. Cemix declara rendimiento variable según el uso; este cálculo no es un rendimiento oficial en m². Se aproxima un relleno rectangular sin merma, pérdidas ni contracción. No diluir el producto; aplicar sobre superficie seca y firme.`:crackEstimateNote,
 };
}

