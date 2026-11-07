import {test} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

test('capture public portfolio reference without authentication',async({page},testInfo)=>{
 const target='https://vishwasaithal.ai.studio/';
 let response;
 try{
  response=await page.goto(target,{waitUntil:'domcontentloaded',timeout:25000});
 }catch(e){
  console.log('PORTFOLIO_REFERENCE_UNAVAILABLE: '+String(e.message));
  test.skip(true,'Public portfolio could not be loaded by the GitHub Actions browser');
  return;
 }
 if(!response||response.status()!==200||!new URL(page.url()).hostname.endsWith('vishwasaithal.ai.studio')){
  console.log('PORTFOLIO_REFERENCE_UNAVAILABLE: HTTP '+(response?.status()||'none')+', URL '+page.url());
  test.skip(true,'Portfolio returned an unexpected response or redirected elsewhere');
  return;
 }
 try{
  await page.waitForLoadState('networkidle',{timeout:6000});
 }catch{}
 const info=await page.evaluate(()=>{
  const text=(el)=>(el?.textContent||'').trim().replace(/\s+/g,' ').slice(0,240);
  const unique=(arr)=>[...new Set(arr)].filter(Boolean);
  const css=getComputedStyle(document.body);
  const hero=document.querySelector('h1');
  const heroCss=hero?getComputedStyle(hero):null;
  const headers=[...document.querySelectorAll('h1,h2,h3')].map(h=>({tag:h.tagName,text:text(h)})).slice(0,30);
  const links=[...document.querySelectorAll('a')].map(a=>({
   text:text(a).slice(0,70),href:(a.getAttribute('href')||'').slice(0,180)
  })).filter(x=>x.text||x.href).slice(0,40);
  const buttons=[...document.querySelectorAll('button')].map(text).slice(0,20);
  return {title:document.title,heading:headers,links,buttons,
   sections:unique([...document.querySelectorAll('section')].map(e=>e.id||e.className?.toString().slice(0,60))).slice(0,20),
   palette:{bodyBackground:css.backgroundColor,bodyText:css.color,
    fontFamily:css.fontFamily,h1Font:heroCss?.fontFamily||null,h1Size:heroCss?.fontSize||null,h1Color:heroCss?.color||null},
   images:[...document.querySelectorAll('img')].slice(0,16).map(i=>({alt:(i.alt||'').slice(0,100),width:i.width,height:i.height})),
   truncatedText:(document.body?.innerText||'').slice(0,4500)
  };
 });
 await mkdir('e2e-artifacts/screenshots',{recursive:true});
 await writeFile('e2e-artifacts/portfolio-reference.json',JSON.stringify(info,null,2),'utf8');
 await page.screenshot({path:'e2e-artifacts/screenshots/vishwasaithal-ai-studio-reference.png',fullPage:true});
 console.log('PORTFOLIO_REFERENCE_CAPTURED: '+JSON.stringify(info).slice(0,7000));
});
