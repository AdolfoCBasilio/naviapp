import {describe,it,expect} from 'vitest';
import {estimate,positive,crackVolumeLitres,estimateVolume} from './calculate';
describe('Cantidad comercial',()=>{
 it('14 m² a 4 mm son 2 bultos y $500',()=>expect(estimate(14,7.1,250)).toMatchObject({quantity:2,total:500}));
 it('162 m² a 5 mm son 29 bultos y $7,250',()=>expect(estimate(162,5.7,250)).toMatchObject({quantity:29,total:7250}));
 it('2.1 cubetas se redondean a 3',()=>expect(estimate(21,10,1300)).toMatchObject({quantity:3,total:3900}));
 it('sin precio conserva cantidad sin inventar total',()=>expect(estimate(21,10)).toMatchObject({quantity:3,total:undefined}));
 it('acepta coma y punto, rechaza medidas inválidas',()=>{expect(positive('2,5')).toBe(2.5);expect(positive('2.5')).toBe(2.5);for(const v of ['0','-1','','hola','Infinity','1,2.3'])expect(positive(v)).toBeNaN();});
 it('rechaza rendimientos no positivos',()=>expect(()=>estimate(10,0)).toThrow());
});

describe('Volumen de grietas',()=>{
 it('convierte m × mm × mm a litros',()=>{expect(crackVolumeLitres(10,10,10)).toBeCloseTo(1);expect(crackVolumeLitres(2.5,4,5)).toBeCloseTo(0.05);});
 it('redondea después de sumar el volumen de las grietas',()=>{const volume=crackVolumeLitres(5,10,10)+crackVolumeLitres(6,10,10);expect(estimateVolume(volume,1,145)).toMatchObject({quantity:2,total:290});});
 it('sin precio conserva volumen y cantidad',()=>expect(estimateVolume(1.5,1)).toMatchObject({volumeLitres:1.5,quantity:2,total:undefined}));
 it('rechaza dimensiones inválidas y desbordamientos',()=>{for(const n of [0,-1,NaN,Infinity])expect(()=>crackVolumeLitres(n,10,10)).toThrow();expect(()=>crackVolumeLitres(Number.MAX_VALUE,Number.MAX_VALUE,10)).toThrow();});
});

describe('Volumen de Cemento Plástico',()=>{
 it('no cobra una cubeta adicional por error de coma flotante',()=>{expect(estimateVolume(crackVolumeLitres(37.8,10,10),3.78,350)).toMatchObject({quantity:1,total:350});expect(estimateVolume(crackVolumeLitres(75.6,10,10),3.78,350)).toMatchObject({quantity:2,total:700});});
 it('redondea hacia arriba si el volumen sí supera el contenido',()=>expect(estimateVolume(3.780001,3.78,350)).toMatchObject({quantity:2,total:700}));
 it('suma tramos hasta completar exactamente un galón',()=>expect(estimateVolume(crackVolumeLitres(20,10,10)+crackVolumeLitres(17.8,10,10),3.78,350)).toMatchObject({quantity:1,total:350}));
});
