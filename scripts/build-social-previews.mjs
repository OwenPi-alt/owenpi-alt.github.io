import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(resolve(root, 'scripts/social-card.template.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plainText = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const render = fields => template.replace(/\{\{(\w+)\}\}/g, (_, field) => {
  if (!(field in fields)) throw new Error('Missing preview field: ' + field);
  return fields[field];
});
const nodes = labels => labels.map(label => '<div class="node"><span class="node-label">' + escape(label) + '</span></div>').join('');

for (const language of ['zh', 'en']) {
  const english = language === 'en';
  const config = JSON.parse(await readFile(resolve(root, english ? 'seo.en.config.json' : 'seo.config.json'), 'utf8'));
  const home = await readFile(resolve(root, english ? 'en/index.html' : 'index.html'), 'utf8');
  const heading = home.match(/<h1 id="hero-title">([\s\S]*?)<\/h1>/)?.[1];
  const intro = home.match(/<p class="intro">([\s\S]*?)<\/p>/)?.[1];
  const proofline = home.match(/<div class="hero-proofline">([\s\S]*?)<\/div>/)?.[1];
  if (!heading || !intro || !proofline) throw new Error('Missing ' + language + ' homepage hero content');
  const introParts = [...intro.matchAll(/<(?:strong|span)[^>]*>([\s\S]*?)<\/(?:strong|span)>/g)]
    .map(match => plainText(match[1])).filter(Boolean);
  const proofParts = [...proofline.matchAll(/<span><strong>([\s\S]*?)<\/strong><small>([\s\S]*?)<\/small><\/span>/g)]
    .slice(0, 2).map(match => '<span>' + match.slice(1).map(plainText).join(' ') + '</span>');
  if (!introParts.length || proofParts.length !== 2) throw new Error('Incomplete ' + language + ' homepage experience fields');
  const fields = {
    language: english ? 'en' : 'zh-CN',
    title: escape(config.name + (english ? ' — Portfolio' : ' · 项目记录')),
    brand: escape(config.name),
    cardClass: '',
    tag: '',
    heading: heading.replace(/<span>/g, '<strong>').replace(/<\/span>/g, '</strong>'),
    skills: introParts.join(' · '),
    proof: proofParts.join(''),
    nodes: nodes(english ? ['Systems', 'AI applications', 'Delivery'] : ['系统开发', 'AI 应用', '项目交付']),
    diagramNote: english ? 'Business projects &amp; research prototypes' : '业务项目与个人研究原型',
    domain: 'owenpi-alt.github.io/' + (english ? 'en/' : 'zh/'),
    foot: english ? 'Portfolio' : '项目记录'
  };
  const sandbox = { window: {} };
  vm.runInNewContext(await readFile(resolve(root, english ? 'case-studies.en.js' : 'case-studies.js'), 'utf8'), sandbox, {timeout:1000});
  const cases = sandbox.window.PORTFOLIO_CASE_STUDIES;
  const output = resolve(root, 'output/social', english ? 'en' : '');
  await mkdir(output, {recursive:true});
  await writeFile(resolve(output, 'main.html'), render(fields));
  for (const [key, item] of Object.entries(cases)) {
    if (!config.cases[key]?.image) throw new Error('Missing ' + language + ' image target: ' + key);
    const source = item.meta.split(' · ');
    const proof = item.stage ? item.meta : source.slice(0, 2).join(' · ');
    const stageNote = key === 'quant'
      ? (english ? 'Simulated backtests · No live trading' : '模拟回测 · 未接入实盘')
      : (english ? 'Offline prototype · Mock-provider validation' : '离线原型 · 模拟供应商验证');
    await writeFile(resolve(output, key + '.html'), render({
      ...fields,
      title: escape(item.title + ' · ' + config.name),
      cardClass: ' case',
      tag: item.stage ? (english ? 'Research prototype · AI-assisted' : '个人研究原型 · AI 协作') : (english ? 'Business project' : '业务项目'),
      heading: escape(item.title),
      skills: escape(item.thesis),
      proof: escape(proof),
      nodes: nodes([item.flow[0].name, item.flow[1].name, item.flow[3].name]),
      diagramNote: item.stage ? stageNote : (english ? 'A simplified view of the project' : '项目流程简图'),
      domain: 'owenpi-alt.github.io/' + (english ? 'en/' : '') + 'projects/' + escape(config.cases[key].slug) + '/',
      foot: english ? 'Project notes' : '项目记录'
    }));
  }
}
console.log('Wrote 16 Chinese/English HTML previews. Render at 1200×630 into the configured PNG asset paths.');
