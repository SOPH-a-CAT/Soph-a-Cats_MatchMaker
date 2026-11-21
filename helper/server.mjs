import http from 'node:http';
import {readFileSync} from 'node:fs';
import {timingSafeEqual} from 'node:crypto';
import {ServiceError,redact} from './get-key.mjs';
import {askAI} from './ask-ai.mjs';
import {validateInput,validateOutfit} from './validate.mjs';
const config=JSON.parse(readFileSync(new URL('../phone/local-config.json',import.meta.url)));
let busy=false,lastCall=0;
const message='Please check your Wi-Fi and that the helper is running, then try again.';
http.createServer(async(req,res)=>{
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const send=(status,data)=>{res.statusCode=status;res.end(JSON.stringify(data));};
 if(req.method==='GET'&&req.url==='/health')return send(200,{ok:true});
 const actual=Buffer.from(req.headers['x-matchmaker-token']||''),expected=Buffer.from(config.token);
 if(req.method!=='POST'||req.url!=='/outfit'||actual.length!==expected.length||!timingSafeEqual(actual,expected))return send(403,{error:'Please open MatchMaker from your computer’s Expo link.'});
 if(busy||Date.now()-lastCall<3000)return send(429,{error:'Please wait a moment and try again.'});
 let body='';
 try{
 for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>32768)throw Error('too large');}
 const input=validateInput(JSON.parse(body));busy=true;lastCall=Date.now();
 try{send(200,validateOutfit(await askAI(input.clothes,input.style),input.clothes));}finally{busy=false;}
 }catch(error){console.error(redact(error instanceof ServiceError?error.fix:'Check the wardrobe details and helper connection, then try again.'));send(400,{error:error instanceof ServiceError?error.message:message});}
}).listen(8787,'0.0.0.0',()=>console.log('MatchMaker helper ready on port 8787. Photos are not accepted or logged.'));
