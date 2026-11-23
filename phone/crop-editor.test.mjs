import runtime from './crop-runtime.generated.js';
import test from 'node:test';import assert from 'node:assert/strict';
import {brushPixels,cropEditorHtml,editorRuntime} from './crop-editor.mjs';
import {trimBackground} from './crop-pixels.mjs';
test('erase and restore change transparency without changing clothing colors',()=>{const original=new Uint8ClampedArray(20*20*4).fill(255),pixels=new Uint8ClampedArray(original);brushPixels(pixels,original,20,20,10,10,4,false);assert.equal(pixels[(10*20+10)*4+3],0);assert.equal(pixels[3],255);brushPixels(pixels,original,20,20,10,10,4,true);assert.equal(pixels[(10*20+10)*4+3],255);});
test('border sampling handles obstructed corners',()=>{const w=40,p=new Uint8ClampedArray(w*w*4).fill(255);for(let y=10;y<30;y++)for(let x=10;x<30;x++){p[(y*w+x)*4]=20;p[(y*w+x)*4+1]=70;p[(y*w+x)*4+2]=120;}for(const i of [0,w-1,w*(w-1),w*w-1])p.fill(0,i*4,i*4+3);const r=trimBackground(p,w,w,30);assert.equal(r.pixels[(2*w+2)*4+3],0);assert.equal(r.pixels[(20*w+20)*4+3],255);});
test('editor rejects external image URLs and includes no external services',()=>{assert.ok(!cropEditorHtml('https://example.com/photo').includes('<script>'));const html=cropEditorHtml('data:image/png;base64,AAAA');assert.ok(html.includes("default-src 'none'"));assert.ok(html.includes('Restore original'));assert.ok(html.includes('Undo'));});
test('phone editor uses prebuilt source compatible with Hermes',()=>{assert.equal(runtime,editorRuntime());assert.ok(cropEditorHtml('data:image/png;base64,AAAA').includes('function editor'));});
