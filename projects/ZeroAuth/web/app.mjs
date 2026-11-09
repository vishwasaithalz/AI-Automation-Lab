import {encode64,decode64,challenge,verifyClientData,verifyAssertion} from "./auth-core.mjs";
const $=id=>document.getElementById(id),key="karma-zeroauth-demo-v1";
const show=(s,data)=>{$("status").textContent=s;$("result").textContent=typeof data==="string"?data:JSON.stringify(data,null,2);};
const record=()=>{try{return JSON.parse(sessionStorage.getItem(key)||"null")}catch{return null}};
const ready=()=>window.isSecureContext&&!!(window.PublicKeyCredential&&navigator.credentials&&crypto.subtle);
function refresh(){
 const r=record();
 $("device").textContent=ready()?(r?"WebAuthn ready; local credential stored":"WebAuthn ready; no local credential yet"):"WebAuthn unavailable on this origin or browser";
 $("register").disabled=!ready();$("login").disabled=!ready()||!r;
}
function friendly(e){return e.name==="NotAllowedError"?"Authenticator prompt was cancelled, rejected, unavailable, or timed out.":String(e.message||e);}
$("check").onclick=async()=>{
 let platform="unknown",mediation="unknown";
 if(window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable)platform=await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(()=>false);
 if(window.PublicKeyCredential?.isConditionalMediationAvailable)mediation=await PublicKeyCredential.isConditionalMediationAvailable().catch(()=>false);
 show("BROWSER CAPABILITY",{secureContext:isSecureContext,webAuthn:!!window.PublicKeyCredential,platformAuthenticator:platform,conditionalMediation:mediation,credentialRecorded:!!record(),note:"Read-only browser inspection; not a login service"});
};
$("register").onclick=async()=>{
 $("register").disabled=true;
 try{
  const c=challenge(),userId=new Uint8Array(16);crypto.getRandomValues(userId);
  const v=await navigator.credentials.create({publicKey:{
   challenge:c,rp:{name:"KARMA ZeroAuth Lab",id:location.hostname},
   user:{id:userId,name:"test-user",displayName:"KARMA Local Test"},
   pubKeyCredParams:[{type:"public-key",alg:-7}],attestation:"none",
   authenticatorSelection:{residentKey:"preferred",userVerification:"preferred"},timeout:60000
  }});
  if(!v?.response)throw Error("No credential received");
  verifyClientData(v.response.clientDataJSON,"webauthn.create",encode64(c),location.origin);
  const pub=v.response.getPublicKey?.(),alg=v.response.getPublicKeyAlgorithm?.();
  if(!pub||alg!==-7)throw Error("Browser did not expose a compatible ES256 public key; no local record saved");
  const r={id:encode64(v.rawId),spki:encode64(pub),rpId:location.hostname,origin:location.origin,counter:0};
  sessionStorage.setItem(key,JSON.stringify(r));
  show("REAL AUTHENTICATOR REGISTERED",{algorithm:"ES256",credentialPrefix:r.id.slice(0,18),storage:"Tab-local public key",note:"Demo only; no server-side credential verification or account binding"});
 }catch(e){show("REGISTRATION NOT COMPLETED",friendly(e))}
 finally{refresh()}
};
$("login").onclick=async()=>{
 $("login").disabled=true;
 try{
  const r=record();if(!r)throw Error("Register a test credential first");
  const c=challenge(),encoded=encode64(c);
  const assertion=await navigator.credentials.get({publicKey:{
   challenge:c,rpId:r.rpId,allowCredentials:[{type:"public-key",id:decode64(r.id)}],
   timeout:60000,userVerification:"preferred"
  }});
  if(encode64(assertion.rawId)!==r.id)throw Error("Unexpected credential ID");
  const data=await verifyAssertion(assertion,r.spki,encoded,r.origin,r.rpId,r.counter);
  r.counter=data.counter;sessionStorage.setItem(key,JSON.stringify(r));
  show("ES256 SIGNATURE VERIFIED · LOCAL",{...data,counterPolicy:"Opt-in source counter assessment is now part of this local verification flow.",note:"Real signature verified in browser; this is not a secure authorization boundary"});
 }catch(e){show("AUTHENTICATION NOT COMPLETED",friendly(e))}
 finally{refresh()}
};
$("clear").onclick=()=>{sessionStorage.removeItem(key);refresh();show("LOCAL RECORD CLEARED","The test authenticator itself is not removed from your OS/passkey manager.");};
refresh();$("check").click();
