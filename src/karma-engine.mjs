import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
export const ENGINES={
'website-seo':['audit-design','audit-seo'],
'security-ci':['review-source','check-ci'],
'video-music':['prepare-video','prepare-lyrics'],
'research-career-earnings':['research','draft-offer','career-plan'],
'memory-isolation':['evaluate-memory'],
'publishing':['prepare-publication']};
export const POLICY={mode:'mock',allow_network:false,allow_external_actions:false,allow_memory_persistence:false,allow_publish:false,max_jobs:30};
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
export function validate(plan,policy=POLICY){
 if(!plan||!Array.isArray(plan.jobs))return ['jobs must be an array'];
 const errors=[],ids=new Set();
 if(plan.jobs.length>policy.max_jobs)errors.push('Too many jobs');
 for(const [i,j] of plan.jobs.entries()){
 if(!j||typeof j!=='object'){errors.push('Invalid job '+i);continue}
 if(typeof j.id!=='string'||!/^[a-z0-9][a-z0-9-]{0,63}$/.test(j.id)||ids.has(j.id))errors.push('Invalid or duplicate job id '+i);
 ids.add(j.id);
 if(!own(ENGINES,j.engine)||!ENGINES[j.engine].includes(j.action))errors.push('Unknown engine/action '+i);
 if(j.inputs!==undefined&&(!j.inputs||typeof j.inputs!=='object'||Array.isArray(j.inputs)))errors.push('Invalid inputs '+i);
 }
 return errors;
}
function redact(x){
 if(Array.isArray(x))return x.map(redact);
 if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,/(secret|token|password|api.?key|credential|authorization|private.?key)/i.test(k)?'[REDACTED]':redact(v)]));
 return typeof x==='string'?x.replace(/(Bearer\\s+)[A-Za-z0-9._~+/-]+/gi,'$1[REDACTED]'):x;
}
const CHECKS={
'website-seo':['mobile viewport','contrast','title/meta','canonical','robots/sitemap','links'],
'security-ci':['provenance','dependencies','CI permissions','secrets','isolated validation'],
'video-music':['licensed media','audio rights','aspect ratio','captions','preview'],
'research-career-earnings':['source verification','dated claims','cost ceiling','no unsolicited outreach'],
'memory-isolation':['synthetic data','hooks','retention','egress','no persistence'],
'publishing':['destination','rights','account permissions','explicit approval']};
export function run(plan,policy=POLICY){
 const errors=validate(plan,policy);
 if(errors.length)return {ok:false,errors,results:[]};
 if(policy.mode!=='mock'||policy.allow_network||policy.allow_external_actions||policy.allow_memory_persistence||policy.allow_publish)return {ok:false,errors:['Only isolated mock mode supported'],results:[]};
 return {ok:true,schema_version:1,mode:'mock',summary:{jobs:plan.jobs.length,executed:0,external_actions:0},results:plan.jobs.map(j=>({id:j.id,engine:j.engine,action:j.action,status:['publishing','memory-isolation'].includes(j.engine)?'approval_required':'prepared_mock',executed:false,network_used:false,checks:CHECKS[j.engine],inputs:redact(j.inputs??{}),next_step:'Review and implement an independently tested adapter before real execution'}))};
}
export function markdown(report){return ['# KARMA mock review','','No external actions were performed. No real audit, video, or publication is claimed.','',...(report.results??[]).flatMap(r=>['## '+r.id,'Engine: '+r.engine+'; action: '+r.action+'; status: '+r.status,'Checks: '+r.checks.join(', '),''])].join('\\n')}
export function cli(args=process.argv.slice(2)){
 if(args.length<1||args.length>3)throw new Error('Usage: node src/karma-engine.mjs plan.json [out.json] [out.md]');
 const result=run(JSON.parse(readFileSync(resolve(args[0]),'utf8')));
 for(const [i,content] of [[1,JSON.stringify(result,null,2)+'\\n'],[2,markdown(result)]])if(args[i]){const p=resolve(args[i]);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,content,{flag:'wx'})}
 process.stdout.write(JSON.stringify(result,null,2)+'\\n');
 if(!result.ok)process.exitCode=1;
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url)))cli();
