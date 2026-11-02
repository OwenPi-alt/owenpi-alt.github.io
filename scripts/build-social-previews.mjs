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
console.log('Wrote 8 local HTML previews. Render each at 1200×630 into the configured PNG asset path.');
