import {migrateThread} from './migrate-wardrobe.mjs';
let opening;
function database(){
 if(!opening)opening=new Promise((resolve,reject)=>{
  const request=indexedDB.open('matchmaker-storage',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('wardrobe');
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>{opening=undefined;reject(request.error)};
 });
 return opening;
}
async function legacyThread(){
 return new Promise((resolve,reject)=>{
  const request=indexedDB.open('thread-wardrobe');
  let missing=false;
  request.onupgradeneeded=()=>{missing=true;request.transaction.abort()};
  request.onerror=()=>missing?resolve(null):reject(request.error);
  request.onsuccess=()=>{
   const db=request.result;
   if(!db.objectStoreNames.contains('wardrobe')){db.close();resolve(null);return;}
   const read=db.transaction('wardrobe').objectStore('wardrobe').get('current');
   read.onsuccess=()=>{db.close();resolve(migrateThread(read.result))};
   read.onerror=()=>{db.close();reject(read.error)};
  };
 });
}
export default {
 async getItem(key){
  const db=await database();
  const saved=await new Promise((resolve,reject)=>{const r=db.transaction('wardrobe').objectStore('wardrobe').get(key);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  if(saved!==undefined)return saved;
  const previous=localStorage.getItem(key);
  if(previous!==null)return previous;
  const legacy=await legacyThread();
  return legacy?JSON.stringify(legacy):null;
 },
 async setItem(key,value){
  const db=await database();
  return new Promise((resolve,reject)=>{const tx=db.transaction('wardrobe','readwrite');tx.objectStore('wardrobe').put(value,key);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)});
 }
};
