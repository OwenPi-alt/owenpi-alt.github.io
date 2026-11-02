import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'seo.config.json'),'utf8'));
const base=new URL(config.siteUrl);
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'case-studies.js'),'utf8'),sandbox,{timeout:1000});
const cases=sandbox.window.PORTFOLIO_CASE_STUDIES;
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const decode=text=>text.replace(/&(?:amp|lt|gt|quot|#39);/g,s=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&#39;':"'"}[s]));
const attrs=tag=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m=>[m[1],decode(m[2])]));
const localPath=url=>{
  const u=new URL(url,base);
  assert.equal(u.origin,base.origin,'Local source mapping requires the configured origin');
  assert.ok(u.pathname.startsWith(base.pathname));
  let relative=decodeURIComponent(u.pathname.slice(base.pathname.length));
  if(!relative||relative.endsWith('/'))relative+='index.html';
  assert.ok(!relative.split('/').includes('..'));
  return relative;
};
const sitemap=read('sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>decode(m[1]));
const expected=[base.href,new URL('resume.html',base).href,new URL('projects/',base).href,...Object.values(config.cases).map(m=>new URL('projects/'+m.slug+'/',base).href)];
assert.equal(urls.length,10);assert.deepEqual(new Set(urls),new Set(expected));
assert.ok(!/<lastmod|<priority|<changefreq/.test(sitemap),'Avoid fabricated freshness or unsupported ranking hints');
assert.ok(read('robots.txt').includes('Allow: /'));
assert.ok(read('robots.txt').includes('Sitemap: '+new URL('sitemap.xml',base).href));

const titles=new Set(),descriptions=new Set();
const result=[];
for(const url of urls){
  const file=localPath(url),html=read(file);
  const title=decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
  const metas=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
  const meta=(key,value)=>metas.find(m=>m[key]===value)?.content;
  const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0]));
  const canonical=links.filter(l=>l.rel==='canonical');
  assert.equal(canonical.length,1,file);assert.equal(canonical[0].href,url,file);
  assert.equal((html.match(/<h1\b/g)||[]).length,1,file+' must have one visible h1');
  assert.ok(title&&!titles.has(title),file+' unique title');titles.add(title);
  const description=meta('name','description');assert.ok(description&&!descriptions.has(description),file+' unique description');descriptions.add(description);
  assert.ok(!meta('name','robots')?.includes('noindex'),file+' indexable');
  assert.equal(meta('property','og:url'),url,file+' matching social URL');
  const image=meta('property','og:image');assert.ok(image,file+' social image');
  const png=fs.readFileSync(path.join(root,localPath(image)));
  assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
  const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert.ok(schemas.length,file+' JSON-LD present');
  const nodes=schemas.flatMap(s=>s['@graph']||[s]);
  if(file==='index.html')assert.ok(nodes.some(n=>n['@type']==='Person')&&nodes.some(n=>n['@type']==='WebSite'));
  else if(file==='resume.html')assert.ok(nodes.some(n=>n['@type']==='ProfilePage'));
  else if(file==='projects/index.html')assert.ok(nodes.some(n=>n['@type']==='CollectionPage'));
  else {
    assert.ok(nodes.some(n=>n['@type']==='Article'));
    assert.ok(nodes.some(n=>n['@type']==='BreadcrumbList'));
    assert.ok(!/<script\b[^>]*\bsrc=/.test(html),'Case body has no executable JavaScript dependency');
    const key=Object.keys(config.cases).find(k=>file==='projects/'+config.cases[k].slug+'/index.html');
    const data=cases[key];const body=decode(html.slice(html.indexOf('<body')));
    for(const value of [data.context,data.responsibility,data.outcome,...data.decisions.flatMap(d=>[d.problem,d.choice,d.benefit]),...data.checks])assert.ok(body.includes(value),file+' preserves narrative');
    if(data.stage)assert.ok(body.includes(data.stage),file+' preserves prototype stage');
  }
  for(const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)){
    const a=attrs(match[0]),ref=a.href||a.src;if(!ref||ref.startsWith('mailto:')||ref.startsWith('#'))continue;
    const target=new URL(ref,url);if(target.origin!==base.origin)continue;
    assert.ok(fs.existsSync(path.join(root,localPath(target.href))),file+' references missing '+ref);
  }
  result.push({page:url,title,descriptionLength:description.length});
}
const home=read('index.html');
for(const [key,meta] of Object.entries(config.cases)){
  const tag=[...home.matchAll(/<a\b[^>]*>/g)].map(m=>attrs(m[0])).find(a=>a['data-project']===key);
  assert.ok(tag?.href,key+' has a real preview link');
  assert.equal(new URL(tag.href,base).href,new URL('projects/'+meta.slug+'/',base).href);
}
console.log(JSON.stringify({pagesChecked:result.length,canonicalUrls:urls.length,sourceNarrativesPreserved:true,structuredDataParsed:true,internalLinksResolved:true,pages:result},null,2));
