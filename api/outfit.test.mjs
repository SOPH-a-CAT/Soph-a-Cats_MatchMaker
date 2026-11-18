import {test} from 'node:test';import assert from 'node:assert/strict';
import handler from './outfit.mjs';
import {invalidateKey} from '../helper/get-key.mjs';
function response(){return {headers:{},statusCode:0,setHeader(k,v){this.headers[k]=v},end(raw){this.body=JSON.parse(raw)}};}
test('web endpoint uses server environment, returns only owned IDs and caches the key',async()=>{
 const original=global.fetch;const previous={...process.env};let keys=0,ai=0;
 process.env.VERCEL='1';process.env.KEYGEN_URL='https://example.test';process.env.KEYGEN_TOKEN='fake-test-token';invalidateKey();
 global.fetch=async(url,options)=>{if(String(url).includes('/api/lookup-key')){keys++;assert.equal(options.headers.Authorization,'Bearer fake-test-token');return {ok:true,json:async()=>({apiKey:'fake-test-key',expiresAt:Date.now()+60000})};}ai++;assert.equal(options.headers.Authorization,'Bearer fake-test-key');return {ok:true,status:200,json:async()=>({output:[{content:[{type:'output_text',text:'{"ids":["1","2"]}'}]}]})};};
 const request={method:'POST',headers:{},body:{style:'Flexible',clothes:[{id:'1',type:'Top',name:'shirt',color:'blue',uri:'private-photo'},{id:'2',type:'Bottom',name:'pants',color:'white'}]}};
 try{for(let i=0;i<2;i++){const res=response();await handler(request,res);assert.equal(res.statusCode,200);assert.deepEqual(res.body,{ids:['1','2']});}assert.equal(keys,1);assert.equal(ai,2);}finally{global.fetch=original;for(const k of ['VERCEL','KEYGEN_URL','KEYGEN_TOKEN']){if(previous[k]===undefined)delete process.env[k];else process.env[k]=previous[k];}invalidateKey();}
});
test('rejects non-POST and cross-site calls',async()=>{for(const request of [{method:'GET',headers:{}},{method:'POST',headers:{'sec-fetch-site':'cross-site'}}]){const res=response();await handler(request,res);assert.ok([403,405].includes(res.statusCode));}});
