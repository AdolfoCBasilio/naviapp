import {render,screen,within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeEach,describe,it,expect,vi} from 'vitest';
import App from './App';
import {products,thicknessYields} from './catalog';

beforeEach(()=>{vi.restoreAllMocks();window.history.replaceState(null,'','#catalogo');vi.spyOn(window,'scrollTo').mockImplementation(()=>{});});
const card=(id:string)=>screen.getAllByRole('article').find(c=>c.dataset.productId===id)!;
async function openCard(user:ReturnType<typeof userEvent.setup>,id='constructor'){
 await user.click(within(card(id)).getByRole('link',{name:'Cotizar'}));
}
async function openWork(user:ReturnType<typeof userEvent.setup>,work:string){
 await user.click(screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector('a[href="#cotizador"]')!);
 await user.selectOptions(screen.getByLabelText('¿Qué quieres hacer?'),work);
}
const calculateButton=()=>screen.getByRole('button',{name:'Calcular estimado'});
describe('Navegación y cotización',()=>{
 it('cada tarjeta abre medidas con su producto sin volver a pedir trabajo',async()=>{
  const user=userEvent.setup();render(<App/>);
  for(const product of products){
   await openCard(user,product.id);
   expect(screen.getByRole('heading',{level:1,name:'Cotiza tu obra'})).toBeVisible();
   expect(screen.getByRole('heading',{level:2,name:product.name})).toBeVisible();
   expect(screen.queryByLabelText('¿Qué quieres hacer?')).not.toBeInTheDocument();
   await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));
  }
 });
 it.each([['14','4','2','$500 MXN'],['162','5','29','$7,250 MXN']])('calcula %s m² a %s mm',async(area,mm,quantity,total)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);
  expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
  await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),area);
  await user.click(screen.getByRole('button',{name:`${mm} mm`}));await user.click(calculateButton());
  expect(screen.getByRole('heading',{level:1,name:'Tu estimado'})).toHaveFocus();
  const result=screen.getByRole('region',{name:'Resultado del estimado'});
  expect(result).toHaveTextContent(`${quantity} bultos completos`);expect(within(result).getByText(total)).toBeVisible();
  expect(screen.queryByLabelText('Área de superficie 1 (m²)')).not.toBeInTheDocument();
  expect(screen.getByRole('navigation',{name:'Navegación móvil'}).querySelector('[aria-current="page"]')).toHaveTextContent('Cotizador');
 });
 it('muestra errores junto a los campos y lleva el foco al primero',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.click(calculateButton());
  expect(screen.getByText('Ingresa un área mayor que cero.')).toBeVisible();expect(screen.getByText('Elige el espesor para conocer el rendimiento.')).toBeVisible();
  expect(screen.getByLabelText('Área de superficie 1 (m²)')).toHaveFocus();
 });
 it('sugiere por trabajo y redondea 2.1 cubetas a 3',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'azotea');
  expect(screen.getByLabelText('Producto sugerido')).toHaveValue('cinco');
  await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),'21');await user.type(screen.getByLabelText('Rendimiento de ficha técnica (m² por envase)'),'10');await user.click(calculateButton());
  expect(screen.getByText('3 cubetas completas')).toBeVisible();expect(screen.getByText('$3,900 MXN')).toBeVisible();
 });
 it('calcula el total del yeso con su precio confirmado',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'otros');
  await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),'21');await user.type(screen.getByLabelText('Rendimiento de ficha técnica (m² por envase)'),'10');await user.click(calculateButton());
  expect(screen.getByText('3 bultos completos')).toBeVisible();expect(screen.getByText('$444 MXN')).toBeVisible();
 });
 it('suma superficies con dimensiones y decimales con coma, y permite editarlas',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);
  await user.click(screen.getByRole('button',{name:'Largo × alto'}));
  await user.type(screen.getByLabelText('Largo de superficie 1 (m)'),'2,5');await user.type(screen.getByLabelText('Alto de superficie 1 (m)'),'4');
  await user.click(screen.getByRole('button',{name:/Agregar superficie/}));await user.type(screen.getByLabelText('Área de superficie 2 (m²)'),'4');
  await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());
  expect(screen.getByText('14 m²')).toBeVisible();expect(screen.getByText('2 bultos completos')).toBeVisible();
  await user.click(screen.getByRole('button',{name:'Editar medidas'}));
  expect(screen.getByLabelText('Largo de superficie 1 (m)')).toHaveValue('2,5');expect(screen.getByLabelText('Alto de superficie 1 (m)')).toHaveValue('4');expect(screen.getByLabelText('Área de superficie 2 (m²)')).toHaveValue('4');
  expect(screen.getByRole('button',{name:'4 mm'})).toHaveAttribute('aria-pressed','true');
  await user.type(screen.getByLabelText('Área de superficie 2 (m²)'),'0');expect(screen.queryByText('$500 MXN')).not.toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Eliminar superficie 2'}));expect(screen.queryByLabelText('Área de superficie 2 (m²)')).not.toBeInTheDocument();
 });
 it('resanes pide foto y medidas sin cálculo por área',async()=>{
  const user=userEvent.setup();render(<App/>);await openWork(user,'resanes');expect(screen.getByRole('status')).toHaveTextContent('una foto y las medidas del daño');expect(screen.queryByRole('button',{name:'Calcular estimado'})).not.toBeInTheDocument();
 });
 it('combina búsqueda y categoría, conserva ambas y restaura el desplazamiento',async()=>{
  const user=userEvent.setup();render(<App/>);await user.type(screen.getByLabelText('Buscar por nombre'),'Impercool');expect(screen.getAllByRole('article')).toHaveLength(4);
  await user.click(screen.getByRole('button',{name:/Categorías/}));await user.selectOptions(screen.getByLabelText('Categoría activa'),'Impermeabilización');await user.keyboard('{Escape}');
  expect(screen.getAllByRole('article')).toHaveLength(3);expect(screen.getByRole('button',{name:/Categorías/})).toHaveFocus();
  vi.spyOn(window,'scrollY','get').mockReturnValue(440);await openCard(user,'siete');await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));
  expect(screen.getByLabelText('Buscar por nombre')).toHaveValue('Impercool');expect(screen.getByRole('button',{name:/Categorías/})).toHaveTextContent('Impermeabilización');expect(window.scrollTo).toHaveBeenLastCalledWith({top:440,behavior:'instant'});
  await user.click(screen.getByRole('button',{name:/Categorías/}));await user.selectOptions(screen.getByLabelText('Categoría activa'),'Todas');await user.click(screen.getByRole('button',{name:'Ver resultados'}));expect(screen.getAllByRole('article')).toHaveLength(4);
 });
 it('copia el resumen y confirma solamente cuando el portapapeles responde',async()=>{
  const user=userEvent.setup();const write=vi.spyOn(navigator.clipboard,'writeText').mockResolvedValue();render(<App/>);await openCard(user);
  await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());await user.click(screen.getByRole('button',{name:/Copiar cotización/}));
  expect(write).toHaveBeenCalledWith(expect.stringContaining('Cantidad: 2 bultos completos'));expect(write).toHaveBeenCalledWith(expect.stringContaining('Espesor: 4 mm'));expect(screen.getByRole('status')).toHaveTextContent('Cotización copiada al portapapeles.');
 });
 it('no afirma que copió si falla el portapapeles',async()=>{
  const user=userEvent.setup();vi.spyOn(navigator.clipboard,'writeText').mockRejectedValue(new Error('denied'));render(<App/>);await openCard(user);await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));await user.click(calculateButton());await user.click(screen.getByRole('button',{name:/Copiar cotización/}));expect(screen.getByRole('status')).toHaveTextContent('No se pudo copiar');expect((screen.getByLabelText('Resumen para copiar') as HTMLTextAreaElement).value).toContain('Total: $500 MXN');
 });
 it('Cambiar recupera la selección y una cotización nueva no hereda medidas ni espesor',async()=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.type(screen.getByLabelText('Área de superficie 1 (m²)'),'14');await user.click(screen.getByRole('button',{name:'4 mm'}));
  await user.click(screen.getByRole('button',{name:'Cambiar'}));expect(screen.getByLabelText('Producto sugerido')).toHaveValue('constructor');await user.selectOptions(screen.getByLabelText('¿Qué quieres hacer?'),'piso');expect(screen.getByRole('button',{name:'Largo × ancho'})).toBeVisible();
  await user.click(screen.getByRole('link',{name:/Volver al catálogo/}));await openCard(user);expect(screen.getByLabelText('Área de superficie 1 (m²)')).toHaveValue('');for(const mm of Object.keys(thicknessYields))expect(screen.getByRole('button',{name:`${mm} mm`})).toHaveAttribute('aria-pressed','false');
 });
 it.each(Object.entries(thicknessYields))('espesor %s muestra el rendimiento real %s',async(mm,yieldValue)=>{
  const user=userEvent.setup();render(<App/>);await openCard(user);await user.click(screen.getByRole('button',{name:`${mm} mm`}));expect(screen.getByText(`${yieldValue.toFixed(1)} m² por bulto de 40 kg`)).toBeVisible();
 });
});
