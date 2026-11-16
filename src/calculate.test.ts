import {describe,it,expect} from 'vitest';
import {estimate,positive} from './calculate';
describe('Cantidad comercial',()=>{
 it('14 m² a 4 mm son 2 bultos y $500',()=>expect(estimate(14,7.1,250)).toMatchObject({quantity:2,total:500}));
 it('162 m² a 5 mm son 29 bultos y $7,250',()=>expect(estimate(162,5.7,250)).toMatchObject({quantity:29,total:7250}));
 it('2.1 cubetas se redondean a 3',()=>expect(estimate(21,10,1300)).toMatchObject({quantity:3,total:3900}));
 it('sin precio conserva cantidad sin inventar total',()=>expect(estimate(21,10)).toMatchObject({quantity:3,total:undefined}));
 it('acepta coma y punto, rechaza medidas inválidas',()=>{expect(positive('2,5')).toBe(2.5);expect(positive('2.5')).toBe(2.5);for(const v of ['0','-1','','hola','Infinity','1,2.3'])expect(positive(v)).toBeNaN();});
 it('rechaza rendimientos no positivos',()=>expect(()=>estimate(10,0)).toThrow());
});
