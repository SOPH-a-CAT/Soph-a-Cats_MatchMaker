const {getDefaultConfig}=require('expo/metro-config');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const config=getDefaultConfig(__dirname);
config.server={...config.server,enhanceMiddleware:(middleware)=> (req,res,next)=>{
 if(req.url?.split('?')[0]==='/api/outfit'){
  import(pathToFileURL(path.join(__dirname,'../api/outfit.mjs')).href).then(({default:handler})=>handler(req,res)).catch(()=>{res.statusCode=500;res.end(JSON.stringify({error:'Please restart the web server and check the AI settings.'}));});
 }else return middleware(req,res,next);
}};
module.exports=config;
