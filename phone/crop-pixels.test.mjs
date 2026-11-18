import test from 'node:test';
import assert from 'node:assert/strict';
import {trimBackground} from './crop-pixels.mjs';
test('removes border background, trims and preserves enclosed white details',()=>{
 const w=40,h=50,data=new Uint8ClampedArray(w*h*4).fill(255);
 for(let y=12;y<38;y++)for(let x=10;x<30;x++){const p=(y*w+x)*4;data[p]=20;data[p+1]=70;data[p+2]=130;}
 const detail=(25*w+20)*4;data[detail]=data[detail+1]=data[detail+2]=255;
 const result=trimBackground(data,w,h);
 assert.equal(result.pixels[3],0);assert.equal(result.pixels[detail+3],255);assert.deepEqual(result.box,[7,9,26,32]);assert.equal(data[3],255);
});
test('blank or indistinguishable clothing retains original instead of erasing',()=>{
 const data=new Uint8ClampedArray(400).fill(255),result=trimBackground(data,10,10);
 assert.equal(result.warning,true);assert.deepEqual(result.pixels,data);
});
