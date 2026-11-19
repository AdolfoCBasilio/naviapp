export const mapsUrl='https://maps.app.goo.gl/ahz15b6kWgyagmPd6';
export const whatsappUrl='https://wa.me/522321749491';
export const whatsappMessageUrl=(message:string)=>`${whatsappUrl}?text=${encodeURIComponent(message)}`;
export const whatsappGreetingUrl=whatsappMessageUrl('hola buen dia Navi');
