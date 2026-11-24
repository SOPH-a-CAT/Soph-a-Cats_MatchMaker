import runtime from './crop-runtime.generated.js';
import {trimBackground} from './crop-pixels.mjs';
export function brushPixels(pixels,original,width,height,cx,cy,radius,restore){
 for(let y=Math.max(0,Math.floor(cy-radius));y<Math.min(height,cy+radius+1);y++)for(let x=Math.max(0,Math.floor(cx-radius));x<Math.min(width,cx+radius+1);x++){
  const distance=Math.hypot(x-cx,y-cy);if(distance>radius)continue;
  const i=(y*width+x)*4,weight=Math.min(1,(radius-distance)/Math.max(1,radius*.18));
  pixels[i+3]=Math.round(pixels[i+3]+((restore?original[i+3]:0)-pixels[i+3])*weight);
 }
}
function editor(source,trim,brush){
 const $=selector=>/** @type {HTMLInputElement} */(document.querySelector(selector));
 const canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d'),status=$('#status');
 const original=document.createElement('canvas'),work=document.createElement('canvas');let raw,pixels,box,mode='erase',history=[],dragging=false,last;
 const sliders=/** @type {HTMLInputElement[]} */([...document.querySelectorAll('[data-edge]')]);
 function tell(uri){const value=JSON.stringify({type:'cutout',uri});const bridge=/** @type {Window & {ReactNativeWebView?:{postMessage:(s:string)=>void}}} */(window).ReactNativeWebView;if(bridge)bridge.postMessage(value);else parent.postMessage(value,'*');}
 function snapshot(){history.push(new Uint8ClampedArray(pixels));if(history.length>8)history.shift();$('#undo').disabled=false;}
 function bounds(){let l=original.width,t=original.height,r=-1,b=-1;for(let y=0;y<original.height;y++)for(let x=0;x<original.width;x++)if(pixels[(y*original.width+x)*4+3]>10){l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);b=Math.max(b,y);}return r<0?[0,0,original.width,original.height]:[Math.max(0,l-3),Math.max(0,t-3),Math.min(original.width,r+4)-Math.max(0,l-3),Math.min(original.height,b+4)-Math.max(0,t-3)];}
 function draw(publish=true){
  work.getContext('2d').putImageData(new ImageData(pixels,original.width,original.height),0,0);
  const base=[0,0,original.width,original.height],edges=sliders.map(e=>Number(e.value)/100);
  box=[base[0]+base[2]*edges[0],base[1]+base[3]*edges[1],Math.max(1,base[2]*(1-edges[0]-edges[2])),Math.max(1,base[3]*(1-edges[1]-edges[3]))];
  canvas.width=Math.round(box[2]);canvas.height=Math.round(box[3]);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(work,box[0],box[1],box[2],box[3],0,0,canvas.width,canvas.height);
  if(publish){const b=bounds(),x=Math.max(box[0],b[0]),y=Math.max(box[1],b[1]),w=Math.max(1,Math.min(box[0]+box[2],b[0]+b[2])-x),h=Math.max(1,Math.min(box[1]+box[3],b[1]+b[3])-y);const output=document.createElement('canvas');output.width=Math.round(w);output.height=Math.round(h);output.getContext('2d').drawImage(work,x,y,w,h,0,0,output.width,output.height);tell(output.toDataURL('image/png'));}
 }
 function auto(){if(!raw)return;snapshot();const result=trim(raw,original.width,original.height,Number($('#strength').value));pixels=result.pixels;sliders.forEach(e=>e.value='0');status.textContent=result.warning?'Background is too similar; original kept.':'Background removed automatically.';draw();}
 const img=new Image();img.onload=()=>{const scale=Math.min(1,900/Math.max(img.width,img.height));original.width=work.width=Math.round(img.width*scale);original.height=work.height=Math.round(img.height*scale);original.getContext('2d').drawImage(img,0,0,original.width,original.height);raw=original.getContext('2d').getImageData(0,0,original.width,original.height).data;pixels=new Uint8ClampedArray(raw);auto();/** @type {NodeListOf<HTMLInputElement>} */(document.querySelectorAll('button,input')).forEach(e=>e.disabled=false);};
 let removed=true;$('#clean-toggle').onclick=()=>{removed=!removed;if(removed)auto();else{pixels=new Uint8ClampedArray(raw);draw();status.textContent='Original background kept.';}$('#clean-toggle').textContent=removed?'Keep original background':'Remove background';};
 img.onerror=()=>{status.textContent='Photo could not open. Close and choose another photo.';};img.src=source;
 $('#auto').onclick=auto;
 $('#reset').onclick=()=>{snapshot();pixels=new Uint8ClampedArray(raw);sliders.forEach(e=>e.value='0');status.textContent='Original restored.';draw();};
 $('#undo').onclick=()=>{if(history.length){pixels=history.pop();draw();}$('#undo').disabled=!history.length;};
 for(const button of /** @type {NodeListOf<HTMLButtonElement>} */(document.querySelectorAll('[data-tool]')))button.onclick=()=>{mode=button.dataset.tool;for(const b of /** @type {NodeListOf<HTMLButtonElement>} */(document.querySelectorAll('[data-tool]')))b.setAttribute('aria-pressed',String(b===button));status.textContent=mode==='erase'?'Brush over background to erase it.':'Brush over missing clothing to restore it.';};
 sliders.forEach(e=>e.oninput=()=>{draw();});
 function point(e){const r=canvas.getBoundingClientRect();return [box[0]+(e.clientX-r.left)*box[2]/r.width,box[1]+(e.clientY-r.top)*box[3]/r.height];}
 function paint(e){const p=point(e),radius=Number($('#brush').value)*Math.max(original.width,original.height)/600;const steps=last?Math.ceil(Math.hypot(p[0]-last[0],p[1]-last[1])/Math.max(1,radius/3)):1;for(let n=1;n<=steps;n++)brush(pixels,raw,original.width,original.height,last?last[0]+(p[0]-last[0])*n/steps:p[0],last?last[1]+(p[1]-last[1])*n/steps:p[1],radius,mode==='restore');last=p;
  work.getContext('2d').putImageData(new ImageData(pixels,original.width,original.height),0,0);ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(work,box[0],box[1],box[2],box[3],0,0,canvas.width,canvas.height);
 }
 canvas.onpointerdown=e=>{if(!pixels)return;e.preventDefault();snapshot();dragging=true;last=null;canvas.setPointerCapture(e.pointerId);paint(e);};
 canvas.onpointermove=e=>{if(dragging){e.preventDefault();paint(e);}};
 canvas.onpointerup=canvas.onpointercancel=()=>{if(dragging){dragging=false;last=null;draw();status.textContent='Changes applied. Check the preview before saving.';}};
}
export function cropEditorHtml(source){
 if(!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(source))return '<p>Choose a clothing photo to edit.</p>';
 return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; script-src 'unsafe-inline'; style-src 'unsafe-inline'"><style>body{margin:0;font:14px system-ui;color:#203e38;background:#fff}button{min-height:42px;border:1px solid #8fbca9;border-radius:9px;padding:8px 12px;background:#e6f2ec;color:#203e38;font:inherit}button[aria-pressed=true]{background:#286b61;color:white}button:disabled{opacity:.5}button:focus-visible,input:focus-visible{outline:3px solid #286b61;outline-offset:2px}.row{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.stage{display:flex;align-items:center;justify-content:center;height:290px;background:repeating-conic-gradient(#d7e5de 0% 25%,#f5faf7 0% 50%) 0/16px 16px;border-radius:10px}canvas{max-width:100%;max-height:290px;width:auto;height:auto;touch-action:none;cursor:crosshair}label{display:block;margin:8px 0}input[type=range]{width:100%;accent-color:#286b61}p{line-height:1.4}summary{padding:12px 0;cursor:pointer;font-weight:600} .row,label,details{display:none}canvas{pointer-events:none;max-height:150px}.stage{height:150px}#status{font-size:12px;margin:6px 0}</style></head><body><div class="stage"><canvas aria-label="Clothing cutout editor"></canvas></div><p id="status" role="status">Preparing photo…</p><button id="clean-toggle" disabled>Keep original background</button><div class="row"><button data-tool="erase" aria-pressed="true" disabled>Erase</button><button data-tool="restore" aria-pressed="false" disabled>Restore</button><button id="undo" disabled>Undo</button></div><label>Brush size<input id="brush" aria-label="Brush size" type="range" min="3" max="50" value="16" disabled></label><details><summary>Automatic removal and crop</summary><p>Best on plain backgrounds. Photos stay on this device.</p><label>Removal strength<input id="strength" type="range" min="5" max="80" value="30" disabled></label><div class="row"><button id="auto" disabled>Remove background</button><button id="reset" disabled>Restore original</button></div>${['Left','Top','Right','Bottom'].map(n=>`<label>${n} crop<input data-edge aria-label="${n} crop" type="range" min="0" max="45" value="0" disabled></label>`).join('')}</details><script>${runtime.replace('__CLOTHING_SOURCE__',JSON.stringify(source).replace(/</g,'\\u003c'))}</script></body></html>`;
}

// Build-time serialization only: Hermes does not retain function source.
export function editorRuntime(){return `(${editor.toString()})(__CLOTHING_SOURCE__,${trimBackground.toString()},${brushPixels.toString()});`;}
