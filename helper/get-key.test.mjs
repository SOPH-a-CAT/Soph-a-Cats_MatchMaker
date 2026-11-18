import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getKey,invalidateKey,withKey,redact} from './get-key.mjs';
test('cache, expiry, single authentication retry and secret redaction',async()=>{
 const original=global.fetch,clock=Date.now;let now=clock(),calls=0;
 Date.now=()=>now;
 global.fetch=async()=>{calls++;return {ok:true,json:async()=>({apiKey:'test-private-key',expiresAt:new Date(now+1000).toISOString()})};};
 try{invalidateKey();await Promise.all([getKey(),getKey()]);assert.equal(calls,1);await getKey();assert.equal(calls,1);now+=2000;await getKey();assert.equal(calls,2);let tries=0;const response=await withKey(async()=>{tries++;return {status:401};});assert.equal(response.status,401);assert.equal(tries,2);assert.equal(calls,3);assert.equal(redact('test-private-key'),'[redacted]');}finally{global.fetch=original;Date.now=clock;invalidateKey();}
});
