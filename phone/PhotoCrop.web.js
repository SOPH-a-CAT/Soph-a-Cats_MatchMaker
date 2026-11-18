import React,{useEffect,useState,useMemo} from 'react';
import {trimBackground} from './crop-pixels.mjs';
export default function PhotoCrop({source,onChange}){
 const [original,setOriginal]=useState(null),[remove,setRemove]=useState(true),[strength,setStrength]=useState(30),[edges,setEdges]=useState([0,0,0,0]),[message,setMessage]=useState('Preparing photo…');
 useEffect(()=>{let live=true;const img=new window.Image();img.onload=()=>{if(!live)return;const canvas=document.createElement('canvas'),scale=Math.min(1,900/Math.max(img.width,img.height));canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);setOriginal(canvas);setEdges([0,0,0,0]);};img.onerror=()=>setMessage('Could not open this photo. Choose another photo.');img.src=source;return()=>{live=false;};},[source]);
 const processed=useMemo(()=>{if(!original)return null;const w=original.width,h=original.height,raw=original.getContext('2d').getImageData(0,0,w,h);const result=remove?trimBackground(raw.data,w,h,strength):{pixels:raw.data,box:[0,0,w,h],warning:false};const work=document.createElement('canvas');work.width=w;work.height=h;work.getContext('2d').putImageData(new ImageData(result.pixels,w,h),0,0);const [x,y,bw,bh]=result.box;const [l,t,r,b]=edges;const out=document.createElement('canvas');out.width=Math.max(1,Math.round(bw*(100-l-r)/100));out.height=Math.max(1,Math.round(bh*(100-t-b)/100));out.getContext('2d').drawImage(work,x+bw*l/100,y+bh*t/100,out.width,out.height,0,0,out.width,out.height);const uri=out.toDataURL('image/png');return {uri,message:result.warning?'Could not confidently find the clothing. Original kept; adjust manually.':'Check the edges before saving. Checkerboard means transparent.'};},[original,remove,strength,edges]);
 useEffect(()=>{if(processed)onChange(processed.uri);},[processed,onChange]);
 const preview=processed?.uri;
 const button={padding:10,borderRadius:8,border:'1px solid #9aafa3',background:'#e9eee5',color:'#213c39',cursor:'pointer'};
 return <section aria-label="Crop clothing photo" style={{color:'#213c39',fontSize:13}}>
 {preview&&<img alt="Cropped clothing preview" src={preview} style={{width:'100%',height:220,objectFit:'contain',background:'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 16px 16px',borderRadius:10}}/>}
 <p role="status">{processed?.message||message}</p><p>Auto-crop works best on a plain background that contrasts with your clothes. Patterns and shadows may need adjustment.</p>
 <label><input type="checkbox" checked={remove} onChange={e=>setRemove(e.target.checked)}/> Remove plain background and auto-crop</label>
 {remove&&<label style={{display:'block',marginTop:12}}>Background removal strength: {strength}<input aria-label="Background removal strength" type="range" min="5" max="80" value={strength} onChange={e=>setStrength(Number(e.target.value))} style={{width:'100%'}}/></label>}
 <p><strong>Manual crop</strong> · Move each edge inward.</p>
 {['Left','Top','Right','Bottom'].map((name,i)=><label key={name} style={{display:'block'}}>{name}: {edges[i]}%<input aria-label={name+' crop'} type="range" min="0" max="45" value={edges[i]} onChange={e=>setEdges(old=>old.map((v,k)=>k===i?Number(e.target.value):v))} style={{width:'100%'}}/></label>)}
 <div style={{display:'flex',gap:8,margin:'12px 0'}}><button type="button" style={button} onClick={()=>{setRemove(true);setStrength(30);setEdges([0,0,0,0]);}}>Auto-crop again</button><button type="button" style={button} onClick={()=>{setRemove(false);setEdges([0,0,0,0]);}}>Restore original</button></div>
 </section>;
}
