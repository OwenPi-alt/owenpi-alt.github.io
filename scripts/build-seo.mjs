#!/usr/bin/env node
// Rebuild crawlable case pages from the same narratives used by the homepage.
// Run with: node scripts/build-seo.mjs (the current working directory is irrelevant).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(fs.readFileSync(path.join(root, 'seo.config.json'), 'utf8'));
const sandbox = { window: Object.create(null) };
vm.runInNewContext(fs.readFileSync(path.join(root, 'case-studies.js'), 'utf8'), sandbox, {
  filename: 'case-studies.js',
  timeout: 1000,
  contextCodeGeneration: { strings: false, wasm: false }
});
const caseStudies = sandbox.window.PORTFOLIO_CASE_STUDIES;

function requireText(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} must be nonempty text`);
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value) || value.length === 0) throw new Error(`${label} must be a nonempty array`);
  return value;
}

function requireAssetPath(value, label) {
  requireText(value, label);
  if (!/^[A-Za-z0-9_./-]+$/.test(value) || value.startsWith('/') || value.split('/').some(segment => segment === '..' || !segment)) {
    throw new Error(`${label} must be a relative asset path within the site`);
  }
}

for (const field of ['siteUrl', 'name', 'email', 'github', 'siteName', 'language', 'ogImage']) {
  requireText(config[field], `seo.config.json: ${field}`);
}
const siteUrl = new URL(config.siteUrl);
if (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error('siteUrl must be an absolute HTTP(S) base URL without credentials, query, or fragment');
}
if (!siteUrl.pathname.endsWith('/')) throw new Error('siteUrl must end in /');
if (!/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(config.email)) throw new Error('email must be a plain email address');
if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(config.language)) throw new Error('language must be a language tag');
requireAssetPath(config.ogImage, 'ogImage');
if (!caseStudies || typeof caseStudies !== 'object' || Array.isArray(caseStudies)) throw new Error('case-studies.js must define window.PORTFOLIO_CASE_STUDIES');
if (!config.cases || typeof config.cases !== 'object' || Array.isArray(config.cases)) throw new Error('seo.config.json must define cases');

const keys = Object.keys(caseStudies);
if (keys.length !== 7) throw new Error(`Expected 7 source cases; found ${keys.length}`);
if (Object.keys(config.cases).length !== keys.length || keys.some(key => !Object.hasOwn(config.cases, key))) {
  throw new Error('seo.config.json cases must match case-studies.js exactly');
}

const slugs = new Set();
const titles = new Set();
const descriptions = new Set();
const cases = keys.map((key, index) => {
  const data = caseStudies[key];
  const seo = config.cases[key];
  for (const field of ['slug', 'title', 'description']) requireText(seo?.[field], `${key}: ${field}`);
  if (seo.image !== undefined) requireAssetPath(seo.image, `${key}: image`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(seo.slug) || slugs.has(seo.slug)) throw new Error(`${key}: slug must be unique and use lowercase words separated by hyphens`);
  if (titles.has(seo.title) || descriptions.has(seo.description)) throw new Error(`${key}: title and description must be unique`);
  slugs.add(seo.slug);
  titles.add(seo.title);
  descriptions.add(seo.description);
  for (const field of ['title', 'meta', 'thesis', 'context', 'outcome', 'responsibility']) requireText(data[field], `${key}: ${field}`);
  if (data.responsibilityLabel !== undefined) requireText(data.responsibilityLabel, `${key}: responsibilityLabel`);
  if (data.stage !== undefined) requireText(data.stage, `${key}: stage`);
  for (const [i, step] of requireArray(data.flow, `${key}: flow`).entries()) {
    requireText(step.name, `${key}: flow[${i}].name`);
    requireText(step.detail, `${key}: flow[${i}].detail`);
  }
  for (const [i, decision] of requireArray(data.decisions, `${key}: decisions`).entries()) {
    for (const field of ['title', 'problem', 'choice', 'benefit']) requireText(decision[field], `${key}: decisions[${i}].${field}`);
  }
  for (const field of ['checks', 'tags']) requireArray(data[field], `${key}: ${field}`).forEach((value, i) => requireText(value, `${key}: ${field}[${i}]`));
  return { key, index, data, seo, route: `projects/${seo.slug}/` };
});

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const jsonLd = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const absolute = route => new URL(route, siteUrl).href;
const mailto = `mailto:${config.email}`;
const imageUrl = absolute(config.ogImage);
const person = { '@type': 'Person', '@id': absolute('#person'), name: config.name, url: siteUrl.href };
const imageObject = imagePath => ({ '@type': 'ImageObject', url: absolute(imagePath), width: 1200, height: 630 });
const image = imageObject(config.ogImage);
const cssVersions = new Map(['styles.css', 'seo-pages.css'].map(file => {
  const asset = path.join(root, file);
  return [file, fs.existsSync(asset) ? `?v=${createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0, 12)}` : ''];
}));
const hubTitle = `项目案例与工程原型 | ${config.name}`;
const hubDescription = `${config.name}的项目案例与工程原型：餐饮订单与支付、电销架构、营销触达、AI 客服、Dify 运营问答，以及 AIGC 工作流与量化研究。包含问题背景、架构取舍、职责与当前阶段。`;

function breadcrumbs(route, title) {
  const entries = [{ name: '首页', route: '' }, { name: '项目案例', route: 'projects/' }];
  if (route !== 'projects/') entries.push({ name: title, route });
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(route)}#breadcrumbs`,
    itemListElement: entries.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.name, item: absolute(entry.route) }))
  };
}

function head({ title, description, route, prefix, type, schema, shareImage = imageUrl, shareImageAlt = config.siteName }) {
  return `<!doctype html>
<html lang="${escapeHtml(config.language)}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0c0e11">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(absolute(route))}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta property="og:locale" content="${escapeHtml(config.language.replaceAll('-', '_'))}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(absolute(route))}">
  <meta property="og:image" content="${escapeHtml(shareImage)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(shareImageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(shareImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(shareImageAlt)}">
  <link rel="icon" type="image/svg+xml" href="${prefix}assets/favicon.svg">
  <link rel="stylesheet" href="${prefix}styles.css${cssVersions.get('styles.css')}">
  <link rel="stylesheet" href="${prefix}seo-pages.css${cssVersions.get('seo-pages.css')}">
  <script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': schema })}</script>
</head>`;
}

function siteHeader(prefix) {
  return `<a class="skip-link" href="#main">跳到主要内容</a>
  <header class="seo-header">
    <a class="seo-brand" href="${prefix}" aria-label="${escapeHtml(config.name)}，返回首页"><span aria-hidden="true">w.</span><span>${escapeHtml(config.name)}</span></a>
    <nav aria-label="主导航"><a class="seo-home-link" href="${prefix}">返回作品集</a><a class="button button-primary" href="${escapeHtml(mailto)}">聊聊合作 ↗</a></nav>
  </header>`;
}

function contactAndFooter(prefix) {
  return `<section class="seo-contact" aria-labelledby="contact-title">
      <h2 id="contact-title">聊聊你的技术需求。</h2>
      <p>把业务目标、现有系统和交付范围发给我，一起梳理关键问题与实现路径。</p>
      <a class="button button-primary" href="${escapeHtml(mailto)}">发送合作邮件 ↗</a>
    </section>
  </main>
  <footer class="seo-footer"><span>${escapeHtml(config.name)} · 架构与工程</span><nav aria-label="页脚导航"><a href="${prefix}">返回作品集</a><a href="${escapeHtml(mailto)}">${escapeHtml(config.email)}</a></nav></footer>
</body>
</html>
`;
}

function tags(values) {
  return `<ul class="seo-tags" aria-label="技术与主题">${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
}

function renderCase(entry) {
  const { data, seo, route, index } = entry;
  const prefix = '../../';
  const related = [1, 2, 3].map(offset => cases[(index + offset) % cases.length]);
  const schema = [{
    '@type': 'Article', '@id': `${absolute(route)}#article`, headline: data.title, description: seo.description,
    inLanguage: config.language, ...(seo.image ? { image: imageObject(seo.image) } : {}), author: person, publisher: person,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(route) },
    url: absolute(route)
  }, breadcrumbs(route, data.title)];
  return `${head({ title: seo.title, description: seo.description, route, prefix, type: 'article', schema, shareImage: absolute(seo.image || config.ogImage), shareImageAlt: seo.image ? data.title : config.siteName })}
<body class="seo-page">
  ${siteHeader(prefix)}
  <main id="main" class="seo-main">
    <nav class="seo-breadcrumbs" aria-label="面包屑导航"><a href="${prefix}">首页</a><span aria-hidden="true">/</span><a href="../">项目案例</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(data.title)}</span></nav>
    <article class="seo-article">
      <header class="seo-lede">
        <p class="seo-kicker">CASE ${String(index + 1).padStart(2, '0')} / ENGINEERING IN DETAIL</p>
        <h1>${escapeHtml(data.title)}</h1>
        <p class="seo-thesis">${escapeHtml(data.thesis)}</p>
        <p class="seo-meta">${escapeHtml(data.meta)}</p>
      </header>
      <section class="seo-section" aria-labelledby="context-title"><h2 id="context-title">问题与约束</h2><p>${escapeHtml(data.context)}</p></section>
      <section class="seo-section" aria-labelledby="flow-title">
        <h2 id="flow-title">核心链路简化示意</h2>
        <p>以下图示为技术思路的简化表达。</p>
        <ol class="seo-case-flow">${data.flow.map((step, stepIndex) => `<li><b>${String(stepIndex + 1).padStart(2, '0')} / ${escapeHtml(step.name)}</b><span>${escapeHtml(step.detail)}</span></li>`).join('')}</ol>
      </section>
      <section class="seo-section" aria-labelledby="decisions-title">
        <h2 id="decisions-title">架构取舍与实现</h2>
        <div class="seo-decision-grid">${data.decisions.map((decision, decisionIndex) => `
          <article class="seo-decision"><span>${String(decisionIndex + 1).padStart(2, '0')}</span><h3>${escapeHtml(decision.title)}</h3><p><strong>难点</strong>${escapeHtml(decision.problem)}</p><p><strong>方案</strong>${escapeHtml(decision.choice)}</p><p><strong>价值</strong>${escapeHtml(decision.benefit)}</p></article>`).join('')}
        </div>
      </section>
      <section class="seo-section seo-value" aria-labelledby="value-title"><h2 id="value-title">工程价值</h2><p>${escapeHtml(data.outcome)}</p></section>
      <section class="seo-section" aria-labelledby="checks-title"><h2 id="checks-title">验证关注点</h2><ul class="seo-checklist">${data.checks.map(check => `<li>${escapeHtml(check)}</li>`).join('')}</ul></section>
      <section class="seo-section" aria-labelledby="role-title"><h2 id="role-title">${escapeHtml(data.responsibilityLabel || '我的职责')}</h2><p>${escapeHtml(data.responsibility)}</p></section>
      ${data.stage ? `<section class="seo-section seo-stage" aria-labelledby="stage-title"><h2 id="stage-title">当前阶段</h2><p>${escapeHtml(data.stage)}</p></section>` : ''}
      <section class="seo-section" aria-labelledby="tags-title"><h2 id="tags-title">技术与主题</h2>${tags(data.tags)}</section>
    </article>
    <nav class="seo-related" aria-labelledby="related-title"><h2 id="related-title">继续看其他案例</h2><div class="seo-related-grid">${related.map(other => `<a href="../${escapeHtml(other.seo.slug)}/"><strong>${escapeHtml(other.data.title)}</strong><span>${escapeHtml(other.data.thesis)}</span></a>`).join('')}</div><a href="../">查看全部项目案例 ↗</a></nav>
    ${contactAndFooter(prefix)}`;
}

function renderHub() {
  const route = 'projects/';
  const prefix = '../';
  const schema = [{
    '@type': 'CollectionPage', '@id': absolute(route), name: hubTitle, description: hubDescription,
    inLanguage: config.language, url: absolute(route), image, author: person, publisher: person,
    mainEntity: { '@id': `${absolute(route)}#cases` }
  }, {
    '@type': 'ItemList', '@id': `${absolute(route)}#cases`, numberOfItems: cases.length,
    itemListElement: cases.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.data.title, url: absolute(entry.route) }))
  }, breadcrumbs(route, '项目案例')];
  return `${head({ title: hubTitle, description: hubDescription, route, prefix, type: 'website', schema })}
<body class="seo-page">
  ${siteHeader(prefix)}
  <main id="main" class="seo-main">
    <nav class="seo-breadcrumbs" aria-label="面包屑导航"><a href="${prefix}">首页</a><span aria-hidden="true">/</span><span aria-current="page">项目案例</span></nav>
    <header class="seo-lede"><p class="seo-kicker">PROJECTS / ENGINEERING IN DETAIL</p><h1>项目案例与工程原型</h1><p class="seo-thesis">从业务问题，到架构取舍与实现。</p><p class="seo-meta">业务案例保留实际职责；研发原型标注当前阶段。图示为技术思路简化表达。</p></header>
    <section class="seo-section" aria-labelledby="cases-title"><h2 id="cases-title">七个案例，展开看工程细节。</h2><div class="seo-hub-grid">${cases.map(entry => `
      <article class="seo-hub-card"><p class="seo-kicker">CASE ${String(entry.index + 1).padStart(2, '0')}</p><h2><a href="./${escapeHtml(entry.seo.slug)}/">${escapeHtml(entry.data.title)}</a></h2><p class="seo-meta">${escapeHtml(entry.data.meta)}</p><p>${escapeHtml(entry.data.thesis)}</p><p>${escapeHtml(entry.seo.description)}</p>${entry.data.stage ? `<p class="seo-stage">${escapeHtml(entry.data.stage)}</p>` : ''}${tags(entry.data.tags)}<a href="./${escapeHtml(entry.seo.slug)}/">阅读完整案例 ↗</a></article>`).join('')}
    </div></section>
    ${contactAndFooter(prefix)}`;
}

// Render and validate every input before writing any output. No timestamps or
// filesystem metadata are emitted, so unchanged sources produce identical files.
const outputs = new Map([['projects/index.html', renderHub()]]);
for (const entry of cases) outputs.set(`${entry.route}index.html`, renderCase(entry));
const canonicalRoutes = ['', 'resume.html', 'projects/', ...cases.map(entry => entry.route)];
outputs.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${canonicalRoutes.map(route => `  <url><loc>${escapeHtml(absolute(route))}</loc></url>`).join('\n')}
</urlset>
`);
outputs.set('robots.txt', `User-agent: *
Allow: /

Sitemap: ${absolute('sitemap.xml')}
`);

for (const [relativePath, content] of outputs) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.replace(/[\t ]+$/gm, ''), 'utf8');
}
console.log(`Generated ${cases.length + 1} project pages, sitemap.xml (${canonicalRoutes.length} URLs), and robots.txt.`);
