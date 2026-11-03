import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(resolve(root, 'seo.config.json'), 'utf8'));
const sandbox = { window: {} };
vm.runInNewContext(await readFile(resolve(root, 'case-studies.js'), 'utf8'), sandbox, {timeout:1000});
const cases = sandbox.window.PORTFOLIO_CASE_STUDIES;
const template = await readFile(resolve(root, 'scripts/social-card.template.html'), 'utf8');
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const output = resolve(root, 'output/social');
await mkdir(output, {recursive:true});
await writeFile(resolve(output, 'main.html'), template);
for (const [key, item] of Object.entries(cases)) {
  if (!config.cases[key]?.image) throw new Error(`Missing image target: ${key}`);
  let html = template
    .replace('<title>王子棋 · 分享预览图</title>', `<title>${escape(item.title)} · 王子棋</title>`)
    .replace('JAVA / FULL-STACK / AI</div>', 'ARCHITECTURE CASE STUDY</div>')
    .replace(/<div class="heading">[\s\S]*?<\/div>/, `<div class="heading" style="font-size:48px;line-height:1.45">${escape(item.title)}</div>`)
    .replace(/<div class="skills">[\s\S]*?<\/div>/, `<div class="skills" style="font-size:22px;color:#c1d6ad">${escape(item.thesis)}</div>`)
    .replace(/<div class="proof">[\s\S]*?<\/div>/, `<div class="proof"><span>${escape(item.stage ? '个人研发 / 研究原型' : '业务项目案例')}</span><span>架构取舍 · 技术实现</span></div>`)
    .replace('>SYSTEMS</text>', `>${escape(item.flow[0].name)}</text>`)
    .replace('>AI</text>', `>${escape(item.flow[1].name)}</text>`)
    .replace('>DELIVERY</text>', `>${escape(item.flow[3].name)}</text>`);
  await writeFile(resolve(output, key + '.html'), html);
}
const englishConfig = JSON.parse(await readFile(resolve(root, 'seo.en.config.json'), 'utf8'));
const englishSandbox = { window: {} };
vm.runInNewContext(await readFile(resolve(root, 'case-studies.en.js'), 'utf8'), englishSandbox, {timeout:1000});
const englishCases = englishSandbox.window.PORTFOLIO_CASE_STUDIES;
const englishOutput = resolve(output, 'en');
await mkdir(englishOutput, {recursive:true});
const englishTemplate = template
  .replace('lang="zh-CN"', 'lang="en"')
  .replace('<title>王子棋 · 分享预览图</title>', '<title>Wang Ziqi — Engineering Portfolio</title>')
  .replace('<div class="brand">王子棋<span>', '<div class="brand">Wang Ziqi<span>')
  .replace(/<div class="heading">[\s\S]*?<\/div>/, '<div class="heading">I’m Wang Ziqi.<br><strong>Clarity before code.</strong></div>')
  .replace(/<div class="skills">[\s\S]*?<\/div>/, '<div class="skills">Java · Software architecture · Full-stack · AI engineering</div>')
  .replace(/<div class="proof">[\s\S]*?<\/div>/, '<div class="proof"><span>Nearly 15 years in software</span><span>5 years as a team lead</span></div>')
  .replace('<div class="domain">owenpi-alt.github.io</div>', '<div class="domain">owenpi-alt.github.io/en/</div>');
await writeFile(resolve(englishOutput, 'main.html'), englishTemplate);
const nodeLabels = {
  commerce: ['ORDERS', 'PAYMENTS', 'RECEIPTS'], aigc: ['TASKS', 'RECOVERY', 'EDIT'],
  quant: ['SIGNALS', 'LEDGER', 'VERIFY'], telemarketing: ['REQUESTS', 'SERVICES', 'DATA'],
  'customer-ai': ['MESSAGES', 'ROUTING', 'REPLY'], messaging: ['REQUESTS', 'RULES', 'CHANNELS'],
  dify: ['QUESTIONS', 'WORKFLOW', 'ANSWER']
};
for (const [key, item] of Object.entries(englishCases)) {
  if (!englishConfig.cases[key]?.image) throw new Error(`Missing English image target: ${key}`);
  const html = englishTemplate
    .replace('<title>Wang Ziqi — Engineering Portfolio</title>', `<title>${escape(item.title)} — Wang Ziqi</title>`)
    .replace('JAVA / FULL-STACK / AI</div>', 'ARCHITECTURE CASE STUDY</div>')
    .replace(/<div class="heading">[\s\S]*?<\/div>/, `<div class="heading" style="font-size:46px;line-height:1.25">${escape(item.title)}</div>`)
    .replace(/<div class="skills">[\s\S]*?<\/div>/, `<div class="skills" style="font-size:21px;line-height:1.55;color:#c1d6ad">${escape(item.thesis)}</div>`)
    .replace(/<div class="proof">[\s\S]*?<\/div>/, `<div class="proof"><span>${item.stage ? 'Personal research prototype' : 'Business project case study'}</span><span>Architecture &amp; implementation</span></div>`)
    .replace('>SYSTEMS</text>', `>${nodeLabels[key][0]}</text>`)
    .replace('>AI</text>', `>${nodeLabels[key][1]}</text>`)
    .replace('>DELIVERY</text>', `>${nodeLabels[key][2]}</text>`);
  await writeFile(resolve(englishOutput, key + '.html'), html);
}
console.log('Wrote 16 Chinese/English HTML previews. Render at 1200×630 into the configured PNG asset paths.');
