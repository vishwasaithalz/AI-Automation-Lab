// Browser-only cryptographic exercise. Not a production identity provider.
export function encode64(bytes){const a=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);return btoa(String.fromCharCode(...a)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/g,"");}
export function decode64(s){if(!/^[A-Za-z0-9_-]+$/.test(s))throw Error("Invalid base64url");return Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/").padEnd(Math.ceil(s.length/4)*4,"=")),c=>c.charCodeAt(0));}
export function challenge(){const b=new Uint8Array(32);crypto.getRandomValues(b);return b;}
export function verifyClientData(buffer,type,expectedChallenge,origin){
 const d=JSON.parse(new TextDecoder().decode(buffer));
 if(d.type!==type)throw Error("Invalid ceremony type");
 if(d.challenge!==expectedChallenge)throw Error("Challenge mismatch");
 if(d.origin!==origin||d.crossOrigin===true)throw Error("Origin mismatch");
 return d;
}
export async function verifyAuthData(buffer,rpId,requireUV=false){
 const b=new Uint8Array(buffer);
 if(b.length<37)throw Error("Authenticator data too short");
 const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(rpId)));
 if(!hash.every((v,i)=>v===b[i]))throw Error("Relying party ID mismatch");
 if((b[32]&1)===0)throw Error("Missing user presence");
 if(requireUV&&(b[32]&4)===0)throw Error("Missing user verification");
 return {userPresent:true,userVerified:!!(b[32]&4),counter:new DataView(b.buffer,b.byteOffset+33,4).getUint32(0)};
}
export function derToRaw(der){
 const b=new Uint8Array(der);let pos=0;
 function len(){const n=b[pos++];if(n===undefined)throw Error("DER truncated");if(n<128)return n;const k=n&127;if(k<1||k>2||pos+k>b.length)throw Error("DER invalid length");let m=0;for(let i=0;i<k;i++)m=m*256+b[pos++];return m;}
 if(b[pos++]!==48)throw Error("DER expected sequence");
 const n=len();if(n+pos!==b.length)throw Error("DER invalid sequence size");
 const out=new Uint8Array(64);
 for(let j=0;j<2;j++){
  if(b[pos++]!==2)throw Error("DER expected integer");
  const size=len();if(!size||pos+size>b.length)throw Error("DER invalid integer");
  let part=b.slice(pos,pos+size);pos+=size;
  while(part.length>32&&part[0]===0)part=part.slice(1);
  if(part.length>32)throw Error("ECDSA integer too large");
  out.set(part,j*32+32-part.length);
 }
 if(pos!==b.length)throw Error("DER extra bytes");return out;
}
export function assessCounter(previous,current){
 if(!Number.isSafeInteger(previous)||!Number.isSafeInteger(current)||previous<0||current<0)throw Error("Invalid authenticator counter");
 if(current===0)return {status:"not_supported",reason:"Authenticator counters may be unsupported"};
 if(previous===0)return {status:"first_observation",difference:current};
 if(current<=previous)throw Error("Potential replay or authenticator clone: counter did not advance");
 return {status:"advanced",difference:current-previous};
}
export async function verifyAssertion(assertion,spki,expectedChallenge,origin,rpId,previousCounter=null){
 const r=assertion.response;
 verifyClientData(r.clientDataJSON,"webauthn.get",expectedChallenge,origin);
 const flags=await verifyAuthData(r.authenticatorData,rpId);
 const body=new Uint8Array(r.authenticatorData);
 const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",r.clientDataJSON));
 const message=new Uint8Array(body.length+digest.length);message.set(body);message.set(digest,body.length);
 const key=await crypto.subtle.importKey("spki",decode64(spki),{name:"ECDSA",namedCurve:"P-256"},false,["verify"]);
 const ok=await crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},key,derToRaw(r.signature),message);
 if(!ok)throw Error("Signature verification failed");
 const counterReview=previousCounter===null?{status:"not_checked"}:assessCounter(previousCounter,flags.counter);
 return {verified:true,...flags,counterReview};
}
