import test from "node:test";
import assert from "node:assert/strict";
import {webcrypto,generateKeyPairSync,sign} from "node:crypto";
import {encode64,decode64,verifyClientData,verifyAuthData,derToRaw,verifyAssertion,assessCounter} from "../projects/ZeroAuth/web/auth-core.mjs";
globalThis.crypto ??= webcrypto;
test("base64 round trip",()=>{const b=Uint8Array.from([0,1,2,254,255]);assert.deepEqual(decode64(encode64(b)),b);assert.throws(()=>decode64("/bad"),/Invalid/);});
test("challenge and origin validation",()=>{
 const b=new TextEncoder().encode(JSON.stringify({type:"webauthn.get",challenge:"abc",origin:"https://example.org"}));
 assert.equal(verifyClientData(b,"webauthn.get","abc","https://example.org").type,"webauthn.get");
 assert.throws(()=>verifyClientData(b,"webauthn.get","bad","https://example.org"),/Challenge/);
 assert.throws(()=>verifyClientData(b,"webauthn.get","abc","https://evil.org"),/Origin/);
});
test("authenticator flags and rpId hash",async()=>{
 const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode("example.org")));
 const auth=new Uint8Array(37);auth.set(hash);auth[32]=5;auth[36]=1;
 assert.equal((await verifyAuthData(auth,"example.org",true)).userVerified,true);
 await assert.rejects(()=>verifyAuthData(auth,"wrong.org"),/Relying/);
 auth[32]=0;await assert.rejects(()=>verifyAuthData(auth,"example.org"),/presence/);
});
test("genuine ES256 DER signature and challenge-response",async()=>{
 const keys=generateKeyPairSync("ec",{namedCurve:"prime256v1"});
 const spki=keys.publicKey.export({format:"der",type:"spki"}),origin="https://example.org",rp="example.org",c="test";
 const client=new TextEncoder().encode(JSON.stringify({type:"webauthn.get",challenge:c,origin}));
 const hash=new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(rp)));
 const auth=new Uint8Array(37);auth.set(hash);auth[32]=5;auth[36]=1;
 const digest=new Uint8Array(await crypto.subtle.digest("SHA-256",client));
 const sig=sign("sha256",Buffer.concat([auth,digest]),keys.privateKey);
 assert.equal(derToRaw(sig).length,64);
 const assertion={response:{clientDataJSON:client,authenticatorData:auth,signature:sig}};
 assert.equal((await verifyAssertion(assertion,encode64(spki),c,origin,rp)).verified,true);
 await assert.rejects(()=>verifyAssertion(assertion,encode64(spki),"bad",origin,rp),/Challenge/);
});

test("opt-in authenticator counter replay review",()=>{
 assert.deepEqual(assessCounter(3,5),{status:"advanced",difference:2});
 assert.equal(assessCounter(0,0).status,"not_supported");
 assert.equal(assessCounter(0,5).status,"first_observation");
 assert.throws(()=>assessCounter(5,5),/replay/);
 assert.throws(()=>assessCounter(5,3),/replay/);
 assert.throws(()=>assessCounter(-1,4),/Invalid/);
});
