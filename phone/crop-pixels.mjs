// Remove only background connected to the image border; preserve enclosed details.
export function trimBackground(data,width,height,tolerance=30){
 const pixels=new Uint8ClampedArray(data),seen=new Uint8Array(width*height),queue=[];
 const corners=[0,width-1,(height-1)*width,width*height-1];
 const bg=[0,1,2].map(c=>corners.map(i=>data[i*4+c]).sort((a,b)=>a-b)[1]);
 const visit=i=>{if(seen[i])return;seen[i]=1;const p=i*4;if(data[p+3]<20||Math.max(...bg.map((v,c)=>Math.abs(data[p+c]-v)))<=tolerance){queue.push(i);pixels[p+3]=0;}};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x);}
 for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1);}
 for(let k=0;k<queue.length;k++){const i=queue[k],x=i%width,y=Math.floor(i/width);if(x)visit(i-1);if(x<width-1)visit(i+1);if(y)visit(i-width);if(y<height-1)visit(i+width);}
 let left=width,top=height,right=0,bottom=0,count=0;
 for(let i=0;i<width*height;i++)if(pixels[i*4+3]>20){count++;left=Math.min(left,i%width);right=Math.max(right,i%width);top=Math.min(top,Math.floor(i/width));bottom=Math.max(bottom,Math.floor(i/width));}
 // Do not silently erase an almost-white garment or a blank photo.
 if(count<width*height*.01)return {pixels:new Uint8ClampedArray(data),box:[0,0,width,height],warning:true};
 const pad=3;left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(width-1,right+pad);bottom=Math.min(height-1,bottom+pad);
 return {pixels,box:[left,top,right-left+1,bottom-top+1],warning:false};
}
