import {test,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../../projects/',import.meta.url));
const allowed=new Set(['SentinelPulse','SERPMatrix','CloudHardener','ApexVitals','ZeroAuth','SpectraUI']);
let server,base;

test.beforeAll(async()=>{
 server=createServer(async(req,res)=>{
  try{
   const parts=new URL(req.url,'http://localhost').pathname.split('/').filter(Boolean);
   if(!allowed.has(parts[0])){res.writeHead(404).end('Not found');return}
   const directory=resolve(root,parts[0],'web'),filename=resolve(directory,...(parts.slice(1).length?parts.slice(1):['index.html']));
   if(!(filename===directory||filename.startsWith(directory+sep))){res.writeHead(403).end('Forbidden');return}
   const bytes=await readFile(filename);
   res.setHeader('Content-Type',extname(filename)==='.mjs'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');
   res.setHeader('Cache-Control','no-store');res.end(bytes);
  }catch{res.writeHead(404).end('Not found')}
 });
 await new Promise((ok,fail)=>{server.once('error',fail);server.listen(0,'127.0.0.1',ok)});
 base='http://localhost:'+server.address().port;
});
test.afterAll(async()=>{if(server)await new Promise(done=>server.close(done))});
test.setTimeout(45000);

test('SentinelPulse batch rejects suspicious input without echoing sensitive bodies',async({page})=>{
 await page.goto(base+'/SentinelPulse/');
 await page.locator('#batch-input').fill(JSON.stringify([
  {path:'/health',body:'ok'},
  {path:'/../admin',body:'never-output-this-secret'},
  {path:'/login',body:'<script>alert(1)</script>'}
 ]));
 await page.locator('#batch-inspect').click();
 await expect(page.locator('#batch-status')).toContainText('BATCH COMPLETED');
 await expect(page.locator('#batch-result')).toContainText('"total": 3');
 await expect(page.locator('#batch-result')).toContainText('path_traversal');
 await expect(page.locator('#batch-result')).not.toContainText('never-output-this-secret');
});

test('SERPMatrix checks heading structure, alt text and links',async({page})=>{
 await page.goto(base+'/SERPMatrix/');
 await page.locator('#htmlinput').fill('<html><body><h1>Testing</h1><img src="x"><a>Missing link</a></body></html>');
 await page.locator('#audit').click();
 await expect(page.locator('#result')).toContainText('"h1Count": 1');
 await expect(page.locator('#result')).toContainText('"imagesWithoutAlt": 1');
 await expect(page.locator('#result')).toContainText('"linksWithoutHref": 1');
});

test('CloudHardener advanced controls remain opt in',async({page})=>{
 await page.goto(base+'/CloudHardener/');
 await page.locator('#manifest').fill(JSON.stringify({
  kind:'Pod',spec:{hostNetwork:true,containers:[{name:'work',resources:{},securityContext:{
   privileged:false,allowPrivilegeEscalation:false,readOnlyRootFilesystem:true,runAsNonRoot:true,capabilities:{add:['SYS_ADMIN']}
  }}]}
 }));
 await page.locator('#analyze').click();
 await expect(page.locator('#result')).not.toContainText('hostNetwork_enabled');
 await page.locator('#advanced-policy').check();
 await page.locator('#analyze').click();
 await expect(page.locator('#result')).toContainText('hostNetwork_enabled');
 await expect(page.locator('#result')).toContainText('high risk capability');
});

test('ApexVitals reports locally compressed payload sizes',async({page})=>{
 await page.goto(base+'/ApexVitals/');
 await page.locator('#source').fill('<p>'+'compressible text '.repeat(300)+'</p>');
 await page.locator('#budget').click();
 await expect(page.locator('#status')).toContainText('LOCAL PAYLOAD BUDGET');
 await expect(page.locator('#result')).toContainText('"bytesSaved"');
 await expect(page.locator('#result')).toContainText('"gzipBytes"');
});

test('ZeroAuth local verification exports counter review',async({page})=>{
 await page.goto(base+'/ZeroAuth/');
 const value=await page.evaluate(async()=>{
  const {assessCounter}=await import('/ZeroAuth/auth-core.mjs');
  return assessCounter(4,5);
 });
 expect(value.status).toBe('advanced');
 await expect(page.locator('#result')).toContainText('secureContext');
});

test('Spectra UI compares a bounded palette with WCAG contrast logic',async({page})=>{
 await page.goto(base+'/SpectraUI/');
 await page.locator('#palette-input').fill('#ffffff\n#000000\n#808080');
 await page.locator('#palette-run').click();
 await expect(page.locator('#palette-result')).toContainText('21:1');
 await expect(page.locator('#palette-result')).toContainText('AA normal PASS');
 await expect(page.locator('#message')).toContainText('3 local palette tokens');
});
