import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import App from './App';
import {morteroThicknessYields} from './catalog';
beforeEach(()=>{window.history.replaceState(null,'','#catalogo');Element.prototype.scrollTo=vi.fn();});
async function openFloor(){const user=userEvent.setup();render(<App/>);await user.click(within(document.querySelector('[data-product-id="mortero"]')! as HTMLElement).getByRole('link',{name:'Cotizar'}));return user;}
const input=(name:string,n=1)=>screen.getByLabelText(`${name} de superficie ${n} (${name==='Área'?'m²':'m'})`);
const calculate=()=>screen.getByRole('button',{name:'Calcular material y costo'});
const review=()=>screen.getByRole('complementary',{name:'Revisa tus datos'});
describe('Cotizador visual de pisos',()=>{
 it('inicia vacío, activa las flechas y calcula 6×4=24 usando la tabla documentada',async()=>{
  const user=await openFloor();expect(screen.getByRole('heading',{name:'¿Cuánto mide tu piso o losa?'})).toBeVisible();expect(screen.getByRole('button',{name:'Largo × ancho'})).toHaveAttribute('aria-pressed','true');expect(input('Largo')).toHaveValue('');expect(input('Ancho')).toHaveValue('');
  for(const mm of Object.keys(morteroThicknessYields))expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
  expect(screen.getByText('Ver cálculo teórico (avanzado)').parentElement).not.toHaveAttribute('open');
  await user.type(input('Largo'),'6');expect(document.querySelector('[data-dimension="length"]')).toHaveAttribute('data-active','true');await user.type(input('Ancho'),'4');expect(document.querySelector('[data-dimension="width"]')).toHaveAttribute('data-active','true');expect(within(review()).getByText('24 m²')).toBeVisible();expect(screen.getAllByRole('button',{name:'Calcular material y costo'})).toHaveLength(1);
  await user.click(screen.getByRole('button',{name:'20 mm'}));await user.click(calculate());const quantity=Math.ceil(24/morteroThicknessYields['20']);expect(screen.getByText(`${quantity} bultos completos`)).toBeVisible();expect(screen.getByText('$7,400 MXN',{selector:'.result-total'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(input('Largo')).toHaveValue('6');expect(input('Ancho')).toHaveValue('4');expect(screen.getByRole('button',{name:'20 mm'})).toHaveAttribute('aria-pressed','true');await user.clear(input('Largo'));await user.type(input('Largo'),'3');expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();await user.click(calculate());expect(screen.getByText(`${Math.ceil(12/morteroThicknessYields['20'])} bultos completos`)).toBeVisible();
 });
 it('anima los dos ejes de cada superficie y permite editar desde la cota',async()=>{
  const user=await openFloor();
  const plane=document.querySelector<SVGGElement>('[data-floor-plane]')!;
  const scale=()=>plane.style.transform.match(/scale\(([^,]+), ([^)]+)\)/)!.slice(1).map(Number);
  const [initialLength,initialWidth]=scale();
  await user.type(input('Largo'),'6');
  const [longer,sameWidth]=scale();
  expect(longer).toBeGreaterThan(initialLength);
  expect(sameWidth).toBe(initialWidth);
  await user.type(input('Ancho'),'4');
  const [sameLength,wider]=scale();
  expect(sameLength).toBe(longer);
  expect(wider).toBeGreaterThan(initialWidth);
  const cota=screen.getByRole('button',{name:'Editar ancho de superficie 1 · 4 m'});
  cota.focus();
  await user.keyboard('{Enter}');
  const widthField=input('Ancho') as HTMLInputElement;
  expect(widthField).toHaveFocus();
  expect(widthField.selectionStart).toBe(0);
  expect(widthField.selectionEnd).toBe(1);
  await user.click(screen.getByRole('button',{name:/Agregar otra superficie/}));
  await user.type(input('Largo',2),'9');
  expect(scale()).toEqual([longer,wider]);
 });
 it('muestra el grosor seleccionado y conserva fija la base al cambiar de espesor',async()=>{
  const user=await openFloor();
  const layer=document.querySelector<SVGRectElement>('.mortar-layer')!;
  const base=document.querySelector('[data-mortar-base]')!;
  const baseShape=base.outerHTML;
  expect(parseFloat(layer.style.height)).toBe(0);
  await user.click(screen.getByRole('button',{name:'10 mm'}));
  const thin=parseFloat(layer.style.height);
  expect(thin).toBeGreaterThan(0);
  await user.click(screen.getByRole('button',{name:'50 mm'}));
  expect(parseFloat(layer.style.height)).toBeGreaterThan(thin);
  expect(base.outerHTML).toBe(baseShape);
  await user.click(screen.getByText('Ver cálculo teórico (avanzado)'));
  await user.click(screen.getByRole('button',{name:'Cálculo teórico 3–7 mm'}));
  expect(parseFloat(layer.style.height)).toBe(0);
  await user.click(screen.getByRole('button',{name:'3 mm'}));
  const theoretical=parseFloat(layer.style.height);
  await user.click(screen.getByRole('button',{name:'7 mm'}));
  expect(parseFloat(layer.style.height)).toBeGreaterThan(theoretical);
  expect(parseFloat(layer.style.height)).toBeLessThan(thin);
 });
 it('suma pisos, acepta coma y conserva la identidad de los restantes al eliminar uno intermedio',async()=>{
  const user=await openFloor();await user.type(input('Largo'),'6');await user.type(input('Ancho'),'4');await user.click(screen.getByRole('button',{name:/Agregar otra superficie/}));await user.type(input('Largo',2),'2,5');await user.type(input('Ancho',2),'4');await user.click(screen.getByRole('button',{name:/Agregar otra superficie/}));await user.type(input('Largo',3),'3');await user.type(input('Ancho',3),'2');const third=input('Largo',3);const stableId=third.id;expect(within(review()).getByText('40 m²')).toBeVisible();await user.click(screen.getByRole('button',{name:'Eliminar superficie 2'}));expect(input('Largo',2)).toBe(third);expect(input('Largo',2).id).toBe(stableId);expect(input('Largo',2)).toHaveValue('3');expect(within(review()).getByText('30 m²')).toBeVisible();
  await user.click(within(screen.getByRole('group',{name:'Superficie 2'})).getByRole('button',{name:'Ya sé los m²'}));await user.type(input('Área',2),'2,5');expect(within(review()).getByText('26.5 m²')).toBeVisible();
 });
 it.each(['','0','-2','abc'])('rechaza largo %s y excluye su área del total',async(value)=>{
  const user=await openFloor();if(value)await user.type(input('Largo'),value);await user.type(input('Ancho'),'4');await user.click(screen.getByRole('button',{name:'10 mm'}));expect(within(review()).getByText('— m²')).toBeVisible();await user.click(calculate());expect(input('Largo')).toHaveAttribute('aria-invalid','true');expect(input('Largo')).toHaveFocus();expect(screen.getByText('Ingresa un largo mayor que cero.')).toBeVisible();
 });
 it('limpia el espesor incompatible al cambiar al método avanzado y conserva el método al editar',async()=>{
  const user=await openFloor();await user.type(input('Largo'),'6');await user.type(input('Ancho'),'4');await user.click(screen.getByRole('button',{name:'20 mm'}));await user.click(screen.getByText('Ver cálculo teórico (avanzado)'));await user.click(screen.getByRole('button',{name:'Cálculo teórico 3–7 mm'}));expect(screen.queryByRole('button',{name:'20 mm'})).not.toBeInTheDocument();expect(screen.getByRole('button',{name:'3 mm'})).toHaveAttribute('aria-pressed','false');await user.click(calculate());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();await user.click(screen.getByRole('button',{name:'3 mm'}));await user.click(calculate());expect(screen.getByText('Estimado teórico · No oficial')).toBeVisible();await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByRole('button',{name:'3 mm'})).toHaveAttribute('aria-pressed','true');expect(input('Largo')).toHaveValue('6');await user.click(screen.getByRole('button',{name:'Rendimientos Cemix'}));expect(screen.getByRole('button',{name:'20 mm'})).toHaveAttribute('aria-pressed','false');
 });
});
