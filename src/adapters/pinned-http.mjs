import https from 'node:https';
import {isIP} from 'node:net';
export function pinnedGet(url,address,{timeoutMs=8000,maxBytes=512000}={}){
 if(!isIP(address))throw Error('A validated IP address is required');
 const u=new URL(url);
 if(u.protocol!=='https:'||u.port||u.username||u.password)throw Error('HTTPS only');
 return new Promise((resolve,reject)=>{
  const req=https.get(u,{timeout:timeoutMs,headers:{'user-agent':'KARMA-ReadOnly-Audit/1.0','accept':'text/html,text/plain,application/xml;q=0.8'},lookup:(_hostname,_options,cb)=>cb(null,address,isIP(address))},res=>{
   const chunks=[];let length=0;
   res.on('data',chunk=>{length+=chunk.length;if(length>maxBytes){req.destroy(Error('Response exceeds byte limit'));return}chunks.push(chunk)});
   res.on('end',()=>{const body=Buffer.concat(chunks).toString('utf8');resolve({status:res.statusCode,ok:res.statusCode>=200&&res.statusCode<300,headers:{get:key=>res.headers[key.toLowerCase()]??null},text:async()=>body})});
   res.on('error',reject);
  });
  req.on('timeout',()=>req.destroy(Error('timeout')));
  req.on('error',reject);
 });
}
