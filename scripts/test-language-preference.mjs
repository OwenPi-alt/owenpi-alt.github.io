import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('../language-preference.js', import.meta.url), 'utf8');
const key = 'wangziqi.portfolio.language.v1';
function run(options={}) {
  const {path='/',mount='/',saved=null,storage='ok'}=options;
  const languages=Object.hasOwn(options,'languages')?options.languages:['zh-CN'];
  const language=Object.hasOwn(options,'language')?options.language:'zh-CN';
  const redirects=[], listeners={}, values=new Map(saved === null ? [] : [[key,saved]]);
  const store={
    getItem: name => {if(storage==='read')throw new Error('blocked read');return values.get(name)??null;},
    setItem: (name,value) => {if(storage==='write')throw new Error('blocked write');values.set(name,value);}
  };
  const window={location:{href:'https://portfolio.example'+path,replace:url=>redirects.push(url)}};
  Object.defineProperty(window,'localStorage',{get(){if(storage==='getter')throw new Error('blocked storage');return store;}});
  const document={currentScript:{src:'https://portfolio.example'+mount+'language-preference.js?v=test'},addEventListener:(name,fn)=>{listeners[name]=fn;}};
  vm.runInNewContext(source,{window,document,navigator:{languages,language},URL},{timeout:1000});
  return {redirects,listeners,values};
}

for(const [name,languages,expected] of [
  ['Simplified Chinese',['zh-CN'],'zh'],['Traditional Chinese',['zh-TW','en-US'],'zh'],
  ['Chinese script tag',['zh-Hant-HK'],'zh'],['English',['en-GB','zh-CN'],'en'],
  ['first supported preference',['fr-FR','en-US','zh-CN'],'en'],
  ['Chinese preferred before English',['fr-FR','zh-CN','en-US'],'zh'],
  ['unsupported language',['ja-JP','fr-FR'],'zh'],['case normalization',['EN_us'],'en']
]) {
  test(name,()=>assert.deepEqual(run({languages}).redirects,['https://portfolio.example/'+expected+'/']));
}
test('empty language list uses navigator.language',()=>assert.deepEqual(run({languages:[],language:'en-US'}).redirects,['https://portfolio.example/en/']));
test('missing language settings use Chinese fallback',()=>assert.deepEqual(run({languages:undefined,language:undefined}).redirects,['https://portfolio.example/zh/']));
test('stored manual choice wins over browser preference',()=>{
  assert.deepEqual(run({saved:'zh',languages:['en-US']}).redirects,['https://portfolio.example/zh/']);
  assert.deepEqual(run({saved:'en',languages:['zh-CN']}).redirects,['https://portfolio.example/en/']);
});
test('invalid saved value is ignored',()=>assert.deepEqual(run({saved:'https://elsewhere.example',languages:['zh-CN']}).redirects,['https://portfolio.example/zh/']));
for(const storage of ['getter','read']) test('storage '+storage+' failure retains detection',()=>assert.deepEqual(run({storage,languages:['en-US']}).redirects,['https://portfolio.example/en/']));
for(const mount of ['/','/WANGZIQI.github.io/']) {
  test('entry alias preserves query and fragment: '+mount,()=>{
    const result=run({mount,path:mount+'index.html?utm_source=profile#contact',languages:['en-US']});
    assert.deepEqual(result.redirects,['https://portfolio.example'+mount+'en/?utm_source=profile#contact']);
  });
  for(const path of ['zh/','zh/index.html','en/','en/index.html','resume.html','en/resume.html','projects/aigc-production-workflow/','en/projects/aigc-production-workflow/']){
    test('explicit page never redirects: '+mount+path,()=>assert.deepEqual(run({mount,path:mount+path,saved:'en',languages:['en-US']}).redirects,[]));
  }
}
function select(result,{lang='en',button=0,type='click',prevented=false,modifier=false}={}){
  let intercepted=false;
  result.listeners[type]({button,metaKey:modifier,defaultPrevented:prevented,target:{closest:()=>({getAttribute:()=>lang})},preventDefault:()=>{intercepted=true;}});
  return intercepted;
}
test('manual click is remembered without intercepting native navigation',()=>{
  const result=run({path:'/zh/'});assert.equal(select(result),false);assert.equal(result.values.get(key),'en');assert.deepEqual(result.redirects,[]);
});
test('modified and middle clicks retain native behavior',()=>{
  const result=run({path:'/zh/'});assert.equal(select(result,{modifier:true}),false);assert.equal(result.values.get(key),'en');
  assert.equal(select(result,{type:'auxclick',button:1,lang:'zh-CN'}),false);assert.equal(result.values.get(key),'zh');
});
test('right click and prevented clicks do not change preference',()=>{
  const result=run({path:'/zh/',saved:'zh'});select(result,{type:'auxclick',button:2});select(result,{prevented:true});assert.equal(result.values.get(key),'zh');
});
test('blocked writes do not intercept a language link',()=>{
  const result=run({path:'/zh/',storage:'write'});assert.equal(select(result),false);assert.equal(result.values.has(key),false);assert.deepEqual(result.redirects,[]);
});
test('automatic detection does not store a manual preference',()=>assert.equal(run({languages:['en-US']}).values.has(key),false));
