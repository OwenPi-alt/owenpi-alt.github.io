import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const template = await readFile(resolve(root, 'scripts/social-card.template.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const replaceText = (html, className, value) => html.replace(
  new RegExp('(<div class="' + className + '">)[\\s\\S]*?(</div>)'),
  (_, open, close) => open + value + close
);
const englishHome = await readFile(resolve(root, 'en/index.html'), 'utf8');
const englishHeading = englishHome.match(/<h1 id="hero-title">([\s\S]*?)<\/h1>/)?.[1];
if (!englishHeading) throw new Error('Missing English homepage heading');
const englishTemplate = template
  .replace('lang="zh-CN"', 'lang="en"')
  .replace('<title>王子棋 · 分享预览图</title>', '<title>Wang Ziqi — Engineering Portfolio</title>')
  .replace('<div class="brand">王子棋<span>', '<div class="brand">Wang Ziqi<span>')
  .replace('工程实践 / SELECTED WORK', 'ENGINEERING / SELECTED WORK')
  .replace('业务项目 · 技术方案 · 研发原型', 'Business projects & research prototypes')
  .replace('项目记录 / PORTFOLIO', 'ENGINEERING PORTFOLIO')
  .replace('owenpi-alt.github.io/zh/', 'owenpi-alt.github.io/en/');
const englishMain = replaceText(replaceText(replaceText(
  englishTemplate,
  'heading', englishHeading.replace(/<span>/g, '<strong>').replace(/<\/span>/g, '</strong>')),
  'skills', 'Java backend · Software architecture<br>Frontend &amp; AI applications'),
  'proof', '<span>Nearly 15 years in software</span><span>5 years as a team lead</span>'
);
const englishNodeLabels = {
  commerce: ['ORDERS', 'PAYMENTS', 'RECEIPTS'], aigc: ['TASKS', 'RECOVERY', 'EDIT'],
  quant: ['SIGNALS', 'LEDGER', 'VERIFY'], telemarketing: ['REQUESTS', 'SERVICES', 'DATA'],
  'customer-ai': ['MESSAGES', 'ROUTING', 'REPLY'], messaging: ['REQUESTS', 'RULES', 'CHANNELS'],
  dify: ['QUESTIONS', 'WORKFLOW', 'ANSWER']
};

for (const language of ['zh', 'en']) {
  const english = language === 'en';
  const config = JSON.parse(await readFile(resolve(root, english ? 'seo.en.config.json' : 'seo.config.json'), 'utf8'));
  const sandbox = { window: {} };
  vm.runInNewContext(await readFile(resolve(root, english ? 'case-studies.en.js' : 'case-studies.js'), 'utf8'), sandbox, {timeout:1000});
  const cases = sandbox.window.PORTFOLIO_CASE_STUDIES;
  const output = resolve(root, 'output/social', english ? 'en' : '');
  const main = english ? englishMain : template;
  await mkdir(output, {recursive:true});
  await writeFile(resolve(output, 'main.html'), main);
  let index = 0;
  for (const [key, item] of Object.entries(cases)) {
    if (!config.cases[key]?.image) throw new Error('Missing ' + language + ' image target: ' + key);
    const source = item.meta.split(' · ');
    const proof = item.stage ? item.meta : source.slice(0, 2).join(' · ');
    const nodeLabels = english ? englishNodeLabels[key] : [item.flow[0].name, item.flow[1].name, item.flow[3].name];
    let html = main
      .replace(/<title>[\s\S]*?<\/title>/, '<title>' + escape(item.title) + ' · ' + (english ? 'Wang Ziqi' : '王子棋') + '</title>')
      .replace('<div class="card">', '<div class="card case">');
    html = replaceText(html, 'tag', item.stage ? (english ? 'RESEARCH PROTOTYPE / AI-ASSISTED' : '研究原型 / AI 协作') : (english ? 'BUSINESS PROJECT / CASE NOTES' : '业务项目 / CASE NOTES'));
    html = replaceText(html, 'document-id', 'CASE / ' + String(++index).padStart(2, '0'));
    html = replaceText(html, 'heading', escape(item.title));
    html = replaceText(html, 'skills', escape(item.thesis));
    html = replaceText(html, 'proof', escape(proof));
    html = replaceText(html, 'diagram-label', english ? 'SELECTED NODES / CASE EXCERPT' : '案例节点 / CASE EXCERPT');
    const stageNote = key === 'quant'
      ? (english ? 'Simulated backtests · No live trading' : '模拟回测 · 未接入实盘')
      : (english ? 'Offline prototype · Mock-provider validation' : '离线原型 · 模拟供应商验证');
    html = replaceText(html, 'diagram-note', item.stage ? stageNote : (english ? 'Simplified excerpt · See the full case' : '简化摘录 · 职责与实现见案例正文'));
    html = replaceText(html, 'domain', 'owenpi-alt.github.io/' + (english ? 'en/' : '') + 'projects/' + escape(config.cases[key].slug) + '/');
    html = replaceText(html, 'foot', english ? 'PROJECT NOTES' : '项目记录 / NOTES');
    for (const [nodeIndex, label] of ['SYSTEMS', 'AI', 'DELIVERY'].entries()) {
      html = html.replace('>' + label + '</span>', '>' + escape(nodeLabels[nodeIndex]) + '</span>');
    }
    await writeFile(resolve(output, key + '.html'), html);
  }
}
console.log('Wrote 16 Chinese/English HTML previews. Render at 1200×630 into the configured PNG asset paths.');
