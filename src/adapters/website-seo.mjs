import {lookup} from 'node:dns/promises';
import {isIP} from 'node:net';
const BLOCKED=/^(localhost|.*\.localhost|.*\.local|.*\.internal)$/i;
const PRIVATE_IP=/^(?:0\.|10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.|224\.|240\.)/;
function publicIP(ip){if(isIP(ip)===4)return !PRIVATE_IP.test(ip)&&ip!=='255.255.255.255';if(isIP(ip)===6)return !(/^(::1|::|fc|fd|fe[89ab]|ff)/i.test(ip)||ip.startsWith('::ffff:'));return false}
export function validateTarget(target,allowedHosts){
 const u=new URL(target);
 if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash||u.search)throw Error('HTTPS hostname-only target required, without credentials, port, fragment or query');
 if(!Array.isArray(allowedHosts)||!allowedHosts.includes(u.hostname.toLowerCase())||BLOCKED.test(u.hostname)||isIP(u.hostname))throw Error('Hostname not explicitly approved');
 if(u.pathname!=='/')throw Error('Use origin only');
 return u.origin;
}
export async function auditWebsite({target,allowedHosts,fetchImpl=fetch,resolveImpl=lookup}){
 const origin=validateTarget(target,allowedHosts);
 const host=new URL(origin).hostname;
 const addresses=await resolveImpl(host,{all:true,verbatim:true});
 if(!addresses.length||addresses.some(x=>!publicIP(x.address)))throw Error('Non-public DNS address');
 const paths=['/','/robots.txt','/sitemap.xml'];
 const output={origin,mode:'read-only',pages:[],checks:[]};
 for(const path of paths){
  const url=origin+path;
  let response;
  try{response=await fetchImpl(url,{method:'GET',redirect:'manual',signal:AbortSignal.timeout(8000),headers:{'accept':'text/html,text/plain,application/xml;q=0.8','user-agent':'KARMA-ReadOnly-Audit/1.0'}})}
  catch(e){output.pages.push({path,error:e.name==='TimeoutError'?'timeout':'request failed'});continue}
  const type=response.headers.get('content-type')??'';
  const size=Number(response.headers.get('content-length')??0);
  const page={path,status:response.status,contentType:type,redirect:response.status>=300&&response.status<400,tooLarge:size>512000};
  if(!page.redirect&&response.ok&&!page.tooLarge&&/(text\/|xml|html)/i.test(type)){
   const body=(await response.text()).slice(0,512000);
   if(path==='/'){
    const match=(re)=>body.match(re)?.[1]?.trim()??null;
    page.title=match(/<title[^>]*>([^<]*)<\/title>/i);
    page.description=match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)/i)??match(/<meta\s+[^>]*content=["']([^"']*)["'][^>]*name=["']description/i);
    page.canonical=match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)/i);
    page.viewport=/<meta\s+[^>]*name=["']viewport["']/i.test(body);
    page.lang=match(/<html\s+[^>]*lang=["']([^"']*)/i);
   }else if(path==='/robots.txt'){page.hasSitemapDirective=/^sitemap:/im.test(body)}
   else {page.hasUrlset=/<(?:urlset|sitemapindex)\b/i.test(body)}
  }
  output.pages.push(page);
 }
 const home=output.pages[0],robots=output.pages[1],sitemap=output.pages[2];
 for(const [id,ok] of [['homepage_200',home?.status===200],['title_present',!!home?.title],['description_present',!!home?.description],['canonical_present',!!home?.canonical],['viewport_present',!!home?.viewport],['html_lang_present',!!home?.lang],['robots_200',robots?.status===200],['sitemap_200',sitemap?.status===200]])output.checks.push({id,passed:ok});
 return output;
}
