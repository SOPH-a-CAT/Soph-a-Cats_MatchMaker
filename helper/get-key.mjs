// Server only. Never import this file from phone/.
import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
let cached, pending;
const secrets=new Set();
export function redact(value){let text=String(value||'');for(const secret of secrets)if(secret)text=text.split(secret).join('[redacted]');return text.replace(/Bearer\s+\S+|sk-[\w-]+/gi,'[redacted]');}
export class ServiceError extends Error {
 constructor(message,fix){super(redact(message));this.fix=redact(fix);}
}
export function invalidateKey(){cached=undefined;}
export async function getKey(){
 if(cached&&Date.now()<cached.expiresAt)return cached.apiKey;
 if(pending)return pending;
 pending=(async()=>{
  let env;
  try{env=process.env.VERCEL?{KEYGEN_URL:process.env.KEYGEN_URL,KEYGEN_TOKEN:process.env.KEYGEN_TOKEN}:parseEnv(readFileSync(new URL('../.env',import.meta.url),'utf8'));}catch{throw new ServiceError('AI setup is missing.','Create .env with KEYGEN_URL and KEYGEN_TOKEN.');}
  secrets.add(env.KEYGEN_TOKEN);
  let url;try{url=new URL(env.KEYGEN_URL.replace(/\/+$/,'')+'/api/lookup-key');if(url.protocol!=='https:')throw Error();}catch{throw new ServiceError('Please finish the MindDo setup.','Set KEYGEN_URL to the HTTPS MindDo service address in .env.');}
  if(!env.KEYGEN_TOKEN||env.KEYGEN_TOKEN==='paste-here')throw new ServiceError('Please finish the MindDo setup.','Set KEYGEN_TOKEN in the local .env file.');
  let response,data;
  try{response=await fetch(url,{method:'POST',headers:{Authorization:`Bearer ${env.KEYGEN_TOKEN}`},redirect:'error',signal:AbortSignal.timeout(15000)});data=await response.json();}catch{throw new ServiceError('Could not reach MindDo.','Check Wi-Fi and KEYGEN_URL, then try again.');}
  if(data?.apiKey)secrets.add(data.apiKey);
  if(!response.ok||data?.error)throw new ServiceError(data?.error?.message||'MindDo could not provide a key.',data?.error?.fix||'Check the MindDo token and account settings.');
  const expiresAt=typeof data.expiresAt==='number'?(data.expiresAt<1e12?data.expiresAt*1000:data.expiresAt):Date.parse(data.expiresAt);
  if(typeof data.apiKey!=='string'||!data.apiKey||!Number.isFinite(expiresAt)||expiresAt<=Date.now())throw new ServiceError('MindDo returned an unusable key.','Ask MindDo to check apiKey and expiresAt in its response.');
  cached={apiKey:data.apiKey,expiresAt};return cached.apiKey;
 })();
 try{return await pending;}finally{pending=undefined;}
}
export async function withKey(operation){
 let response=await operation(await getKey());
 if(response.status===401){invalidateKey();response=await operation(await getKey());if(response.status===401)invalidateKey();}
 return response;
}
