export function validateInput(body){
 if(!body||!Array.isArray(body.clothes)||body.clothes.length>100||body.clothes.length<2)throw Error('invalid wardrobe');
 const kinds=['Top','Bottom','Shoes','Accessory'];
 const clothes=body.clothes.map(c=>{
 if(!c||typeof c.id!=='string'||!/^[a-zA-Z0-9-]{1,64}$/.test(c.id)||!kinds.includes(c.type)||typeof c.name!=='string'||!c.name.trim()||c.name.length>80||typeof c.color!=='string'||c.color.length>40)throw Error('invalid item');
 return {id:c.id,type:c.type,name:c.name,color:c.color};
 });
 if(new Set(clothes.map(c=>c.id)).size!==clothes.length||!clothes.some(c=>c.type==='Top')||!clothes.some(c=>c.type==='Bottom'))throw Error('need top and bottom');
 const styles=['Flexible','Tailored / Formal','Casual / Basics','Athletic / Activewear','Soft / Feminine','Edgy / Alternative','Boho / Eclectic','Smart Casual / Heritage','Utilitarian / Workwear','Tailored / Structured','Smart Casual / Preppy','Flowing / Relaxed'];
 return {clothes,style:styles.includes(body.style)?body.style:'Flexible'};
}
export function validateOutfit(result,clothes){
 if(!Array.isArray(result?.ids)||result.ids.length<2||result.ids.length>4||new Set(result.ids).size!==result.ids.length)throw Error('invalid outfit');
 const chosen=result.ids.map(id=>clothes.find(c=>c.id===id));
 if(chosen.some(c=>!c)||chosen.filter(c=>c.type==='Top').length!==1||chosen.filter(c=>c.type==='Bottom').length!==1||new Set(chosen.map(c=>c.type)).size!==chosen.length)throw Error('invalid outfit');
 return {ids:result.ids};
}
