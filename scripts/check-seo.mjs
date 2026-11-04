import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'seo.config.json'),'utf8'));
const englishConfig=JSON.parse(fs.readFileSync(path.join(root,'seo.en.config.json'),'utf8'));
const base=new URL(config.siteUrl);
assert.equal(englishConfig.siteUrl,config.siteUrl,'Both languages must share the configured primary origin');
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'case-studies.js'),'utf8'),sandbox,{timeout:1000});
const cases=sandbox.window.PORTFOLIO_CASE_STUDIES;
const englishSandbox={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'case-studies.en.js'),'utf8'),englishSandbox,{timeout:1000});
const englishCases=englishSandbox.window.PORTFOLIO_CASE_STUDIES;
const locales=[{prefix:'',home:'zh/',config,cases},{prefix:'en/',home:'en/',config:englishConfig,cases:englishCases}];
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
const expected=locales.flatMap(locale=>[locale.home,locale.prefix+'resume.html',locale.prefix+'projects/',...Object.values(locale.config.cases).map(m=>locale.prefix+'projects/'+m.slug+'/')].map(route=>new URL(route,base).href));
assert.equal(urls.length,20);assert.deepEqual(new Set(urls),new Set(expected));
assert.ok(!/<lastmod|<priority|<changefreq/.test(sitemap),'Avoid fabricated freshness or unsupported ranking hints');
assert.ok(read('robots.txt').includes('Allow: /'));
assert.ok(read('robots.txt').includes('Sitemap: '+new URL('sitemap.xml',base).href));

const titles=new Set(),descriptions=new Set();
const result=[];
for(const url of urls){
  const file=localPath(url),html=read(file);
  const locale=file.startsWith('en/')?locales[1]:locales[0];
  const localFile=file===locale.home+'index.html'?'index.html':file.slice(locale.prefix.length);
  const route=localFile==='index.html'?'':localFile.replace(/index\.html$/,'');
  assert.equal(html.match(/<html\b[^>]*lang="([^"]+)"/)?.[1],locale.config.language,file+' language');
  const title=decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1]||'');
  const metas=[...html.matchAll(/<meta\b[^>]*>/g)].map(m=>attrs(m[0]));
  const meta=(key,value)=>metas.find(m=>m[key]===value)?.content;
  const links=[...html.matchAll(/<link\b[^>]*>/g)].map(m=>attrs(m[0]));
  const canonical=links.filter(l=>l.rel==='canonical');
  assert.equal(canonical.length,1,file);assert.equal(canonical[0].href,url,file);
  const alternate=links.filter(l=>l.rel==='alternate'&&l.hreflang);
  const paired={ 'zh-CN':new URL(route||'zh/',base).href, en:new URL('en/'+route,base).href, 'x-default':new URL(route,base).href };
  assert.equal(alternate.length,3,file+' three language alternates');
  for(const [lang,href] of Object.entries(paired))assert.equal(alternate.find(l=>l.hreflang===lang)?.href,href,file+' reciprocal '+lang);
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
  if(localFile==='index.html')assert.ok(nodes.some(n=>n['@type']==='Person')&&nodes.some(n=>n['@type']==='WebSite'));
  else if(localFile==='resume.html')assert.ok(nodes.some(n=>n['@type']==='ProfilePage'));
  else if(localFile==='projects/index.html')assert.ok(nodes.some(n=>n['@type']==='CollectionPage'));
  else {
    assert.ok(nodes.some(n=>n['@type']==='Article'));
    assert.ok(nodes.some(n=>n['@type']==='BreadcrumbList'));
    const executable=[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m=>m[1]);
    assert.ok(executable.every(src=>new URL(src,url).pathname.endsWith('/language-preference.js')),'Case body only has optional language preference enhancement');
    const key=Object.keys(locale.config.cases).find(k=>localFile==='projects/'+locale.config.cases[k].slug+'/index.html');
    const data=locale.cases[key];const body=decode(html.slice(html.indexOf('<body')));
    for(const value of [data.context,data.responsibility,data.outcome,...data.decisions.flatMap(d=>[d.problem,d.choice,d.benefit]),...data.checks])assert.ok(body.includes(value),file+' preserves narrative');
    if(data.stage)assert.ok(body.includes(data.stage),file+' preserves prototype stage');
  }
  const renderedText=decode(html.slice(html.indexOf('<body')).replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]+>/g,''));
  if(locale.prefix){
    const stripped=renderedText.replace(/中文|奇富科技|百味云|上海邮乐网络技术有限公司|上海狄杰斯|东软集团|王子/g,'');
    assert.ok(!/[\u3400-\u9fff]/.test(stripped),file+' untranslated visible Chinese text');
  }
  for(const match of html.matchAll(/<(?:a|link|script|img)\b[^>]*>/g)){
    const a=attrs(match[0]),ref=a.href||a.src;if(!ref||ref.startsWith('mailto:')||ref.startsWith('#'))continue;
    const target=new URL(ref,url);if(target.origin!==base.origin)continue;
    assert.ok(fs.existsSync(path.join(root,localPath(target.href))),file+' references missing '+ref);
  }
  result.push({page:url,title,descriptionLength:description.length});
}
for(const locale of locales){
  const home=read(locale.home+'index.html');
  for(const [key,meta] of Object.entries(locale.config.cases)){
    const tag=[...home.matchAll(/<a\b[^>]*>/g)].map(m=>attrs(m[0])).find(a=>a['data-project']===key);
    assert.ok(tag?.href,key+' has a real preview link');
    assert.equal(new URL(tag.href,new URL(locale.home,base)).href,new URL(locale.prefix+'projects/'+meta.slug+'/',base).href);
  }
}
const gateway=read('index.html');
assert.ok(gateway.includes(`<link rel="canonical" href="${new URL('zh/',base).href}">`));
assert.ok(gateway.includes('<html lang="zh-CN">'));
assert.ok(!urls.includes(base.href),'Neutral gateway is not a duplicate canonical entry');
const bodyText=html=>decode(html.slice(html.indexOf('<body')).replace(/<[^>]+>/g,'')).replace(/\s+/g,' ').trim();
assert.equal(bodyText(gateway),bodyText(read('zh/index.html')),'Gateway keeps the complete Chinese no-JS fallback');
console.log(JSON.stringify({pagesChecked:result.length,canonicalUrls:urls.length,neutralGateway:base.href,fallbackLanguage:'zh-CN',reciprocalLanguageAlternates:true,sourceNarrativesPreserved:true,structuredDataParsed:true,internalLinksResolved:true,pages:result},null,2));
