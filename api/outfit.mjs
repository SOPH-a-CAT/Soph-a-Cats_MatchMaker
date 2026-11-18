import {askAI} from '../helper/ask-ai.mjs';
import {validateInput,validateOutfit} from '../helper/validate.mjs';
import {ServiceError,redact} from '../helper/get-key.mjs';
let active=0;
export default async function handler(req,res){
 res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');
 const send=(status,value)=>{res.statusCode=status;res.end(JSON.stringify(value));};
 if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'Please use Make an outfit for me.'});}
 if(req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'Please open MatchMaker to make an outfit.'});
 if(active>=3)return send(429,{error:'The outfit maker is busy. Please try again shortly.'});
 active++;
 try{
  let body=req.body;
  if(body===undefined){let raw='';for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>32768)throw Error('Request too large');}body=JSON.parse(raw);}
  if(typeof body==='string')body=JSON.parse(body);
  if(Buffer.byteLength(JSON.stringify(body))>32768)throw Error('Request too large');
  const {clothes,style}=validateInput(body);
  send(200,validateOutfit(await askAI(clothes,style),clothes));
 }catch(error){console.error(redact(error instanceof ServiceError?error.fix:'Check the saved clothing details and server configuration.'));send(400,{error:error instanceof ServiceError?error.message:'Could not make an outfit. Please check your saved clothes and try again.'});}
 finally{active--;}
}
