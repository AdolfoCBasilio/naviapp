import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import App from './App';

beforeEach(()=>{window.history.replaceState(null,'','#catalogo');Element.prototype.scrollTo=vi.fn(function(this:Element,options?:ScrollToOptions|number){if(options&&typeof options==='object')this.scrollTop=options.top ?? 0;});});
async function openWall(user:ReturnType<typeof userEvent.setup>,id='constructor'){
 render(<App/>);const card=screen.getAllByRole('article').find(el=>el.dataset.productId===id)!;await user.click(within(card).getByRole('link',{name:'Cotizar'}));
}
const calculate=()=>screen.getByRole('button',{name:'Calcular material y costo'});
const review=()=>screen.getByRole('complementary',{name:'Revisa tus datos'});

describe('Cotizador visual de muros',()=>{
 it('inicia vacío en largo por alto y resalta la dimensión enfocada en el SVG',async()=>{
  const user=userEvent.setup();await openWall(user);expect(screen.getByRole('heading',{level:1,name:'Cotiza el acabado de tu muro'})).toBeVisible();expect(screen.getByRole('button',{name:'Largo × alto'})).toHaveAttribute('aria-pressed','true');
  expect(screen.getByLabelText('Largo de muro 1 (m)')).toHaveValue('');expect(screen.getByLabelText('Alto de muro 1 (m)')).toHaveValue('');
  await user.click(screen.getByLabelText('Largo de muro 1 (m)'));expect(document.querySelector('[data-dimension="length"]')).toHaveAttribute('data-active','true');
  await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'5');await user.click(screen.getByLabelText('Alto de muro 1 (m)'));expect(document.querySelector('[data-dimension="height"]')).toHaveAttribute('data-active','true');expect(document.querySelector('[data-dimension="length"]')).toHaveAttribute('data-active','false');
  await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2.8');expect(screen.getByRole('button',{name:'Editar largo de muro 1 5 m'})).toBeInTheDocument();expect(screen.getByRole('button',{name:'Editar alto de muro 1 2.8 m'})).toBeInTheDocument();expect(within(review()).getByText('14 m²')).toBeVisible();
  for(const mm of [3,4,5,6,7])expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
 });
 it('ajusta el largo y el alto del dibujo por separado para cada muro',async()=>{
  const user=userEvent.setup();
  await openWall(user);
  const face=()=>document.querySelector<SVGRectElement>('[data-wall-face] rect')!.style;
  const length=screen.getByLabelText('Largo de muro 1 (m)');
  const height=screen.getByLabelText('Alto de muro 1 (m)');
  const initialWidth=parseFloat(face().width), initialHeight=parseFloat(face().height);
  await user.type(length,'5');
  const grownWidth=parseFloat(face().width);
  expect(grownWidth).toBeGreaterThan(initialWidth);
  expect(parseFloat(face().height)).toBe(initialHeight);
  await user.type(height,'2,8');
  expect(parseFloat(face().height)).toBeGreaterThan(initialHeight);
  expect(parseFloat(face().width)).toBe(grownWidth);
  expect(within(review()).getByText('14 m²')).toBeVisible();
  await user.click(screen.getByRole('button',{name:/Agregar otro muro/}));
  await user.type(screen.getByLabelText('Largo de muro 2 (m)'),'8');
  expect(parseFloat(face().width)).toBe(grownWidth);
  await user.clear(length);
  expect(parseFloat(face().width)).toBe(initialWidth);
  expect(height).toHaveValue('2,8');
 });
 it('tocar cotas enfoca y desplaza el campo correcto sin crear otro formulario',async()=>{
  const user=userEvent.setup();const scroll=vi.fn();Element.prototype.scrollIntoView=scroll;await openWall(user);
  await user.click(screen.getByRole('button',{name:'Editar largo de muro 1'}));expect(screen.getByLabelText('Largo de muro 1 (m)')).toHaveFocus();expect(scroll).toHaveBeenCalled();expect(screen.getByRole('button',{name:'Editar largo de muro 1'})).toHaveClass('is-active');
  await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'5');await user.click(screen.getByRole('button',{name:'Editar alto de muro 1'}));expect(screen.getByLabelText('Alto de muro 1 (m)')).toHaveFocus();expect(screen.getByRole('button',{name:'Editar alto de muro 1'})).toHaveClass('is-active');await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2,8');expect(screen.getByRole('button',{name:'Editar alto de muro 1 2.8 m'})).toBeVisible();expect(document.querySelectorAll('form')).toHaveLength(1);
  await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));expect(document.querySelector('.wall-diagram')).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:/Editar largo de muro/})).not.toBeInTheDocument();expect(screen.getByLabelText('Área de muro 1 (m²)')).toHaveValue('');
 });
 it('mantiene campos e identidad al eliminar un muro intermedio',async()=>{
  const user=userEvent.setup();await openWall(user);await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'5');await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2');await user.click(screen.getByRole('button',{name:/Agregar otro muro/}));await user.click(screen.getByRole('button',{name:/Agregar otro muro/}));const third=screen.getByLabelText('Largo de muro 3 (m)');const id=third.id;await user.type(third,'3');await user.type(screen.getByLabelText('Alto de muro 3 (m)'),'4');await user.click(screen.getByRole('button',{name:'Eliminar muro 2'}));expect(screen.getByLabelText('Largo de muro 2 (m)')).toBe(third);expect(third.id).toBe(id);expect(third).toHaveValue('3');expect(within(review()).getByText('22 m²')).toBeVisible();await user.click(within(screen.getByRole('group',{name:'Muro 2'})).getByRole('button',{name:'Editar largo de muro 2 3 m'}));expect(third).toHaveFocus();
 });
 it('anima solo la capa seleccionada de 3 a 7 mm y mantiene el bloque fijo',async()=>{
  const user=userEvent.setup();await openWall(user);const detail=document.querySelector('.animated-finish')! as HTMLElement;const base=detail.querySelector('[data-wall-base]')!.outerHTML;
  expect(detail).toHaveAttribute('data-thickness','unselected');expect(detail.style.getPropertyValue('--finish-width')).toBe('0');expect(screen.queryByText('Comportamiento del espesor')).not.toBeInTheDocument();
  for(const mm of [3,4,5,6,7]){
   await user.click(screen.getByRole('button',{name:`${mm} mm`}));expect(detail).toHaveAttribute('data-thickness',String(mm));expect(detail.style.getPropertyValue('--finish-width')).toBe(String(mm*4));expect(detail.querySelector('[data-wall-base]')!.outerHTML).toBe(base);expect(within(detail).getByText(`${mm} mm`)).toBeInTheDocument();expect(within(review()).getByText(`${mm} mm`)).toBeVisible();
  }
  expect(screen.getAllByRole('button',{name:'Calcular material y costo'})).toHaveLength(1);
 });
 it('5 × 2.8 m a 4 mm calcula 2 bultos/$500 y editar conserva y recalcula',async()=>{
  const user=userEvent.setup();await openWall(user);await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'5');await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2,8');await user.click(screen.getByRole('button',{name:'4 mm'}));expect(screen.getAllByRole('button',{name:'Calcular material y costo'})).toHaveLength(1);await user.click(calculate());
  expect(screen.getByText('2 bultos completos')).toBeVisible();expect(screen.getByText('$500 MXN',{selector:'.result-total'})).toBeVisible();await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Largo de muro 1 (m)')).toHaveValue('5');expect(screen.getByLabelText('Alto de muro 1 (m)')).toHaveValue('2,8');expect(screen.getByRole('button',{name:'4 mm'})).toHaveAttribute('aria-pressed','true');
  await user.clear(screen.getByLabelText('Largo de muro 1 (m)'));await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'10');expect(screen.queryByText('$500 MXN')).not.toBeInTheDocument();await user.click(calculate());expect(screen.getByText('4 bultos completos')).toBeVisible();expect(screen.getByText('$1,000 MXN',{selector:'.result-total'})).toBeVisible();
 });
 it('suma muros válidos y excluye los incompletos; permite área directa y eliminar',async()=>{
  const user=userEvent.setup();await openWall(user);await user.type(screen.getByLabelText('Largo de muro 1 (m)'),'5');await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2');await user.click(screen.getByRole('button',{name:/Agregar otro muro/}));await user.type(screen.getByLabelText('Largo de muro 2 (m)'),'4');expect(within(review()).getByText('10 m²')).toBeVisible();expect(screen.getByText(/1 de 2 muros con medidas válidas/)).toBeVisible();
  await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculate());expect(screen.getByText('Ingresa una medida mayor que cero.')).toBeVisible();expect(screen.queryByRole('heading',{name:'Tu estimado'})).not.toBeInTheDocument();
  const wall2=screen.getByRole('group',{name:'Muro 2'});await user.click(within(wall2).getByRole('button',{name:'Ya sé los m²'}));await user.type(screen.getByLabelText('Área de muro 2 (m²)'),'4');expect(within(review()).getByText('14 m²')).toBeVisible();await user.click(calculate());expect(screen.getByText('$500 MXN',{selector:'.result-total'})).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));expect(screen.getByLabelText('Área de muro 2 (m²)')).toHaveValue('4');await user.click(screen.getByRole('button',{name:'Eliminar muro 2'}));expect(screen.queryByRole('group',{name:'Muro 2'})).not.toBeInTheDocument();expect(within(review()).getByText('10 m²')).toBeVisible();
 });
 it.each(['','0','-1','abc'])('rechaza largo inválido %s y no lo suma',async(value)=>{
  const user=userEvent.setup();await openWall(user);if(value)await user.type(screen.getByLabelText('Largo de muro 1 (m)'),value);await user.type(screen.getByLabelText('Alto de muro 1 (m)'),'2.8');expect(within(review()).getByText('— m²')).toBeVisible();await user.click(calculate());expect(screen.getByText('Ingresa un largo mayor que cero.')).toBeVisible();expect(screen.getByLabelText('Largo de muro 1 (m)')).toHaveFocus();
 });
 it('la ayuda no selecciona espesor ni reemplaza la validación',async()=>{
  const user=userEvent.setup();await openWall(user);await user.click(screen.getByText('No sé qué espesor elegir'));expect(screen.getByText(/Confirma el espesor con quien realizará/)).toBeVisible();await user.click(screen.getByRole('button',{name:'Ya sé los m²'}));await user.type(screen.getByLabelText('Área de muro 1 (m²)'),'14');await user.click(calculate());expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();for(const mm of [3,4,5,6,7])expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
 });
 it.each(['cinco','siete','diez','resanador','plastico'])('%s conserva su flujo sin dibujo de muro',async(id)=>{
  const user=userEvent.setup();await openWall(user,id);expect(document.querySelector('.wall-diagram')).not.toBeInTheDocument();expect(screen.queryByRole('heading',{name:'Cotiza el acabado de tu muro'})).not.toBeInTheDocument();expect(screen.queryByRole('button',{name:'Calcular material y costo'})).not.toBeInTheDocument();
 });
});
