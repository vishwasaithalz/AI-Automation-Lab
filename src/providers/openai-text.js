// Explicitly opt-in, bounded text-only provider adapter. Never log credentials or prompt data.
export class OpenAITextAdapter {
 constructor({apiKey=process.env.OPENAI_API_KEY,model='gpt-4.1-mini',fetchImpl=fetch,enabled=false}={}){
  if(!enabled)throw Error('Live provider requires explicit enabled=true');
  if(typeof apiKey!=='string'||!apiKey.trim())throw Error('OPENAI_API_KEY must be configured outside source control');
  if(!/^[a-zA-Z0-9._-]{1,80}$/.test(model))throw Error('Invalid model identifier');
  this.key=apiKey;this.model=model;this.fetch=fetchImpl;
 }
 async generate(prompt){
  if(typeof prompt!=='string'||prompt.length<1||prompt.length>8000)throw Error('Prompt must be 1 to 8000 characters');
  const response=await this.fetch('https://api.openai.com/v1/responses',{method:'POST',redirect:'error',signal:AbortSignal.timeout(15000),headers:{'content-type':'application/json',authorization:'Bearer '+this.key},body:JSON.stringify({model:this.model,input:prompt,max_output_tokens:500,store:false})});
  if(!response.ok)throw Error('Provider request failed with HTTP '+response.status);
  const data=await response.json();
  return (data.output??[]).flatMap(x=>x.content??[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
 }
}
