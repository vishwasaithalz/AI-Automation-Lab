import test from 'node:test';
import assert from 'node:assert/strict';
import {OpenAITextAdapter} from '../src/providers/openai-text.js';

test('requires opt in and credential',()=>{
 assert.throws(()=>new OpenAITextAdapter({apiKey:'demo'}),/explicit/);
 assert.throws(()=>new OpenAITextAdapter({apiKey:'',enabled:true}),/OPENAI_API_KEY/);
});
test('uses bounded request without storing response',async()=>{
 let request;
 const adapter=new OpenAITextAdapter({apiKey:'synthetic-test-only',enabled:true,fetchImpl:async(url,options)=>{
  request={url,options};
  return {ok:true,json:async()=>({output:[{content:[{type:'output_text',text:'Synthetic answer'}]}]})};
 }});
 assert.equal(await adapter.generate('Synthetic prompt'),'Synthetic answer');
 assert.equal(request.url,'https://api.openai.com/v1/responses');
 assert.equal(JSON.parse(request.options.body).store,false);
 assert.equal(JSON.parse(request.options.body).max_output_tokens,500);
 await assert.rejects(()=>adapter.generate('x'.repeat(8001)),/8000/);
});
test('provider errors never reveal body or credentials',async()=>{
 const adapter=new OpenAITextAdapter({apiKey:'synthetic-secret',enabled:true,fetchImpl:async()=>({ok:false,status:429})});
 await assert.rejects(()=>adapter.generate('hello'),/^Error: Provider request failed with HTTP 429$/);
});
