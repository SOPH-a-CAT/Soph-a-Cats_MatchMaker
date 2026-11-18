export async function savePhoto(source){
 const blob=await (await fetch(source)).blob();
 return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>{const img=new window.Image();img.onload=()=>{const canvas=document.createElement('canvas');const scale=Math.min(1,900/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.75));};img.onerror=reject;img.src=String(reader.result);};reader.onerror=reject;reader.readAsDataURL(blob);});
}
