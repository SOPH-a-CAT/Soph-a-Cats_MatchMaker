import test from 'node:test';
import assert from 'node:assert/strict';
import {migrateThread} from './migrate-wardrobe.mjs';
test('imports Thread clothing and placement without modifying original data',()=>{
 const old={items:[{id:18,name:'Tee',type:'Tops',image:'data:image/png;base64,test',color:'#fff',px:4,zoom:1.2},{id:20,name:'Socks',type:'Socks',image:'sock'}],selected:[18],styles:['Casual / Basics'],photo:'private personal photo'};
 const before=JSON.stringify(old),result=migrateThread(old);
 assert.equal(JSON.stringify(old),before);assert.equal(result.clothes[0].uri,old.items[0].image);assert.equal(result.clothes[0].px,4);assert.equal(result.clothes[0].type,'Top');assert.equal(result.clothes[1].type,'Accessory');assert.deepEqual(result.outfit,['thread-0']);assert.equal(result.style,'Casual / Basics');assert.equal(result.photo,undefined);
});
test('empty or missing previous wardrobes do not add sample clothes',()=>{assert.equal(migrateThread(null),null);assert.deepEqual(migrateThread({items:[]}).clothes,[])});
