// Import only clothing data; keep the original Thread record untouched.
export function migrateThread(data){
 if(!data || !Array.isArray(data.items)) return null;
 const types={Tops:'Top',Bottoms:'Bottom',Shoes:'Shoes',Socks:'Accessory',Accessories:'Accessory'};
 const clothes=data.items.map((item,index)=>({...item,id:'thread-'+index,name:item.name||'Saved piece',type:types[item.type]||'Accessory',color:item.color||'unknown',uri:item.image||''}));
 return {clothes,outfit:clothes.filter((_,index)=>(data.selected||[]).includes(data.items[index].id)).map(c=>c.id),style:data.styles?.[0]||'Flexible'};
}
