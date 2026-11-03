#!/usr/bin/env node
// Rebuild crawlable case pages from the same narratives used by the homepage.
// Run with: node scripts/build-seo.mjs (the current working directory is irrelevant).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const jsonLd = value => JSON.stringify(value, null, 2).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
const cssVersions = new Map(['styles.css', 'seo-pages.css', 'bilingual.css'].map(file => {
  const asset = path.join(root, file);
  return [file, fs.existsSync(asset) ? `?v=${createHash('sha256').update(fs.readFileSync(asset)).digest('hex').slice(0, 12)}` : ''];
}));
const languageScriptVersion = `?v=${createHash('sha256').update(fs.readFileSync(path.join(root, 'language-preference.js'))).digest('hex').slice(0, 12)}`;

function createLocale({ configFile, dataFile, base, english }) {
const config = JSON.parse(fs.readFileSync(path.join(root, configFile), 'utf8'));
const sandbox = { window: Object.create(null) };
vm.runInNewContext(fs.readFileSync(path.join(root, dataFile), 'utf8'), sandbox, {
  filename: dataFile,
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
  requireText(config[field], `${configFile}: ${field}`);
}
const siteUrl = new URL(config.siteUrl);
if (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.search || siteUrl.hash || siteUrl.username || siteUrl.password) {
  throw new Error('siteUrl must be an absolute HTTP(S) base URL without credentials, query, or fragment');
}
if (!siteUrl.pathname.endsWith('/')) throw new Error('siteUrl must end in /');
if (!/^[^\s@<>?&#]+@[^\s@<>?&#]+\.[^\s@<>?&#]+$/.test(config.email)) throw new Error('email must be a plain email address');
if (!/^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(config.language)) throw new Error('language must be a language tag');
requireAssetPath(config.ogImage, 'ogImage');
if (!caseStudies || typeof caseStudies !== 'object' || Array.isArray(caseStudies)) throw new Error(`${dataFile} must define window.PORTFOLIO_CASE_STUDIES`);
if (!config.cases || typeof config.cases !== 'object' || Array.isArray(config.cases)) throw new Error(`${configFile} must define cases`);

const keys = Object.keys(caseStudies);
if (keys.length !== 7) throw new Error(`Expected 7 source cases; found ${keys.length}`);
if (Object.keys(config.cases).length !== keys.length || keys.some(key => !Object.hasOwn(config.cases, key))) {
  throw new Error(`${configFile} cases must match ${dataFile} exactly`);
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
  return { key, index, data, seo, route: `${base}projects/${seo.slug}/` };
});

const absolute = route => new URL(route, siteUrl).href;
const homeRoute = english ? base : 'zh/';
const mailto = `mailto:${config.email}`;
const imageUrl = absolute(config.ogImage);
const person = { '@type': 'Person', '@id': absolute('#person'), name: config.name, url: absolute(homeRoute) };
const imageObject = imagePath => ({ '@type': 'ImageObject', url: absolute(imagePath), width: 1200, height: 630 });
const image = imageObject(config.ogImage);
const label = (zh, en) => english ? en : zh;
const hubRoute = `${base}projects/`;
const hubTitle = label(`项目案例与工程原型 | ${config.name}`, `Projects and Engineering Prototypes | ${config.name}`);
const hubDescription = label(`${config.name}的项目案例与工程原型：餐饮订单与支付、电销架构、营销触达、AI 客服、Dify 运营问答，以及 AIGC 工作流与量化研究。包含问题背景、架构取舍、职责与当前阶段。`, `Seven case studies in Java architecture, business systems, AI workflows and quantitative research, covering responsibilities, trade-offs and prototype stages.`);
const localizedRoutes = route => {
  const suffix = route.slice(base.length);
  return { zh: suffix, en: `en/${suffix}` };
};
const relativeRoute = (from, to) => `${path.posix.relative(from, to) || '.'}/`;
const assetPrefix = route => '../'.repeat(route.split('/').filter(Boolean).length);

function breadcrumbs(route, title) {
  const entries = [{ name: label('首页', 'Home'), route: homeRoute }, { name: label('项目案例', 'Projects'), route: hubRoute }];
  if (route !== hubRoute) entries.push({ name: title, route });
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absolute(route)}#breadcrumbs`,
    itemListElement: entries.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.name, item: absolute(entry.route) }))
  };
}

function head({ title, description, route, prefix, type, schema, shareImage = imageUrl, shareImageAlt = config.siteName }) {
  const alternates = localizedRoutes(route);
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
  <link rel="alternate" hreflang="zh-CN" href="${escapeHtml(absolute(alternates.zh))}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(absolute(alternates.en))}">
  <link rel="alternate" hreflang="x-default" href="${escapeHtml(absolute(alternates.zh))}">
  <meta property="og:type" content="${type}">
  <meta property="og:site_name" content="${escapeHtml(config.siteName)}">
  <meta property="og:locale" content="${english ? 'en_US' : escapeHtml(config.language.replaceAll('-', '_'))}">
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
  <link rel="stylesheet" href="${prefix}bilingual.css${cssVersions.get('bilingual.css')}">
  <script src="${prefix}language-preference.js${languageScriptVersion}" defer></script>
  <script type="application/ld+json">${jsonLd({ '@context': 'https://schema.org', '@graph': schema })}</script>
</head>`;
}

function siteHeader(homeHref, route) {
  const alternates = localizedRoutes(route);
  return `<a class="skip-link" href="#main">${label('跳到主要内容', 'Skip to main content')}</a>
  <header class="seo-header">
    <a class="seo-brand" href="${homeHref}" aria-label="${escapeHtml(label(`${config.name}，返回首页`, `${config.name}, home`))}"><span aria-hidden="true">w.</span><span>${escapeHtml(config.name)}</span></a>
    <nav aria-label="${label('主导航', 'Main navigation')}"><a class="seo-home-link" href="${homeHref}">${label('返回作品集', 'Back to portfolio')}</a><span class="language-switch" role="group" aria-label="${label('选择语言', 'Language')}"><a href="${relativeRoute(route, alternates.zh)}" lang="zh-CN" hreflang="zh-CN"${english ? '' : ' aria-current="page"'}>中文</a><a href="${relativeRoute(route, alternates.en)}" lang="en" hreflang="en"${english ? ' aria-current="page"' : ''}>EN</a></span><a class="button button-primary" href="${escapeHtml(mailto)}">${label('聊聊合作 ↗', 'Email me ↗')}</a></nav>
  </header>`;
}

function contactAndFooter(homeHref) {
  return `<section class="seo-contact" aria-labelledby="contact-title">
      <h2 id="contact-title">${label('聊聊你的技术需求。', 'Let’s talk about what you’re building.')}</h2>
      <p>${label('把业务目标、现有系统和交付范围发给我，一起梳理关键问题与实现路径。', 'Share your goals, current systems, and delivery scope. We can work through the key technical questions and a practical path forward.')}</p>
      <a class="button button-primary" href="${escapeHtml(mailto)}">${label('发送合作邮件 ↗', 'Send an email ↗')}</a>
    </section>
  </main>
  <footer class="seo-footer"><span>${escapeHtml(config.name)} · ${label('架构与工程', 'Architecture &amp; Engineering')}</span><nav aria-label="${label('页脚导航', 'Footer navigation')}"><a href="${homeHref}">${label('返回作品集', 'Back to portfolio')}</a><a href="${escapeHtml(mailto)}">${escapeHtml(config.email)}</a></nav></footer>
</body>
</html>
`;
}

function tags(values) {
  return `<ul class="seo-tags" aria-label="${label('技术与主题', 'Technologies and topics')}">${values.map(value => `<li>${escapeHtml(value)}</li>`).join('')}</ul>`;
}

function renderCase(entry) {
  const { data, seo, route, index } = entry;
  const prefix = assetPrefix(route);
  const homeHref = relativeRoute(route, homeRoute);
  const related = [1, 2, 3].map(offset => cases[(index + offset) % cases.length]);
  const schema = [{
    '@type': 'Article', '@id': `${absolute(route)}#article`, headline: data.title, description: seo.description,
    inLanguage: config.language, ...(seo.image ? { image: imageObject(seo.image) } : {}), author: person, publisher: person,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absolute(route) },
    url: absolute(route)
  }, breadcrumbs(route, data.title)];
  return `${head({ title: seo.title, description: seo.description, route, prefix, type: 'article', schema, shareImage: absolute(seo.image || config.ogImage), shareImageAlt: seo.image ? data.title : config.siteName })}
<body class="seo-page">
  ${siteHeader(homeHref, route)}
  <main id="main" class="seo-main">
    <nav class="seo-breadcrumbs" aria-label="${label('面包屑导航', 'Breadcrumbs')}"><a href="${homeHref}">${label('首页', 'Home')}</a><span aria-hidden="true">/</span><a href="../">${label('项目案例', 'Projects')}</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(data.title)}</span></nav>
    <article class="seo-article">
      <header class="seo-lede">
        <p class="seo-kicker">CASE ${String(index + 1).padStart(2, '0')} / ENGINEERING IN DETAIL</p>
        <h1>${escapeHtml(data.title)}</h1>
        <p class="seo-thesis">${escapeHtml(data.thesis)}</p>
        <p class="seo-meta">${escapeHtml(data.meta)}</p>
      </header>
      <section class="seo-section" aria-labelledby="context-title"><h2 id="context-title">${label('问题与约束', 'Context and constraints')}</h2><p>${escapeHtml(data.context)}</p></section>
      <section class="seo-section" aria-labelledby="flow-title">
        <h2 id="flow-title">${label('核心链路简化示意', 'Core workflow')}</h2>
        <p>${label('以下图示为技术思路的简化表达。', 'This diagram is a simplified view of the technical approach.')}</p>
        <ol class="seo-case-flow">${data.flow.map((step, stepIndex) => `<li><b>${String(stepIndex + 1).padStart(2, '0')} / ${escapeHtml(step.name)}</b><span>${escapeHtml(step.detail)}</span></li>`).join('')}</ol>
      </section>
      <section class="seo-section" aria-labelledby="decisions-title">
        <h2 id="decisions-title">${label('架构取舍与实现', 'Design decisions and implementation')}</h2>
        <div class="seo-decision-grid">${data.decisions.map((decision, decisionIndex) => `
          <article class="seo-decision"><span>${String(decisionIndex + 1).padStart(2, '0')}</span><h3>${escapeHtml(decision.title)}</h3><p><strong>${label('难点', 'Challenge')}</strong>${escapeHtml(decision.problem)}</p><p><strong>${label('方案', 'Approach')}</strong>${escapeHtml(decision.choice)}</p><p><strong>${label('价值', 'Value')}</strong>${escapeHtml(decision.benefit)}</p></article>`).join('')}
        </div>
      </section>
      <section class="seo-section seo-value" aria-labelledby="value-title"><h2 id="value-title">${label('工程价值', 'Engineering value')}</h2><p>${escapeHtml(data.outcome)}</p></section>
      <section class="seo-section" aria-labelledby="checks-title"><h2 id="checks-title">${label('验证关注点', 'Validation focus')}</h2><ul class="seo-checklist">${data.checks.map(check => `<li>${escapeHtml(check)}</li>`).join('')}</ul></section>
      <section class="seo-section" aria-labelledby="role-title"><h2 id="role-title">${escapeHtml(data.responsibilityLabel || label('我的职责', 'My contribution'))}</h2><p>${escapeHtml(data.responsibility)}</p></section>
      ${data.stage ? `<section class="seo-section seo-stage" aria-labelledby="stage-title"><h2 id="stage-title">${label('当前阶段', 'Current stage')}</h2><p>${escapeHtml(data.stage)}</p></section>` : ''}
      <section class="seo-section" aria-labelledby="tags-title"><h2 id="tags-title">${label('技术与主题', 'Technologies and topics')}</h2>${tags(data.tags)}</section>
    </article>
    <nav class="seo-related" aria-labelledby="related-title"><h2 id="related-title">${label('继续看其他案例', 'Explore more projects')}</h2><div class="seo-related-grid">${related.map(other => `<a href="../${escapeHtml(other.seo.slug)}/"><strong>${escapeHtml(other.data.title)}</strong><span>${escapeHtml(other.data.thesis)}</span></a>`).join('')}</div><a href="../">${label('查看全部项目案例 ↗', 'View all projects ↗')}</a></nav>
    ${contactAndFooter(homeHref)}`;
}

function renderHub() {
  const route = hubRoute;
  const prefix = assetPrefix(route);
  const homeHref = relativeRoute(route, homeRoute);
  const schema = [{
    '@type': 'CollectionPage', '@id': absolute(route), name: hubTitle, description: hubDescription,
    inLanguage: config.language, url: absolute(route), image, author: person, publisher: person,
    mainEntity: { '@id': `${absolute(route)}#cases` }
  }, {
    '@type': 'ItemList', '@id': `${absolute(route)}#cases`, numberOfItems: cases.length,
    itemListElement: cases.map((entry, index) => ({ '@type': 'ListItem', position: index + 1, name: entry.data.title, url: absolute(entry.route) }))
  }, breadcrumbs(route, label('项目案例', 'Projects'))];
  return `${head({ title: hubTitle, description: hubDescription, route, prefix, type: 'website', schema })}
<body class="seo-page">
  ${siteHeader(homeHref, route)}
  <main id="main" class="seo-main">
    <nav class="seo-breadcrumbs" aria-label="${label('面包屑导航', 'Breadcrumbs')}"><a href="${homeHref}">${label('首页', 'Home')}</a><span aria-hidden="true">/</span><span aria-current="page">${label('项目案例', 'Projects')}</span></nav>
    <header class="seo-lede"><p class="seo-kicker">PROJECTS / ENGINEERING IN DETAIL</p><h1>${label('项目案例与工程原型', 'Projects and engineering prototypes')}</h1><p class="seo-thesis">${label('从业务问题，到架构取舍与实现。', 'From business problems to design decisions and implementation.')}</p><p class="seo-meta">${label('业务案例保留实际职责；研发原型标注当前阶段。图示为技术思路简化表达。', 'Business case studies describe my actual contributions; research prototypes state their current stage. Diagrams simplify the technical approach.')}</p></header>
    <section class="seo-section" aria-labelledby="cases-title"><h2 id="cases-title">${label('七个案例，展开看工程细节。', 'Seven case studies, with the engineering details.')}</h2><div class="seo-hub-grid">${cases.map(entry => `
      <article class="seo-hub-card"><p class="seo-kicker">CASE ${String(entry.index + 1).padStart(2, '0')}</p><h2><a href="./${escapeHtml(entry.seo.slug)}/">${escapeHtml(entry.data.title)}</a></h2><p class="seo-meta">${escapeHtml(entry.data.meta)}</p><p>${escapeHtml(entry.data.thesis)}</p><p>${escapeHtml(entry.seo.description)}</p>${entry.data.stage ? `<p class="seo-stage">${escapeHtml(entry.data.stage)}</p>` : ''}${tags(entry.data.tags)}<a href="./${escapeHtml(entry.seo.slug)}/">${label('阅读完整案例 ↗', 'Read the full case study ↗')}</a></article>`).join('')}
    </div></section>
    ${contactAndFooter(homeHref)}`;
}

return { config, cases, base, homeRoute, absolute, renderHub, renderCase };
}

// Validate both languages and render every page before writing any output.
// No timestamps or filesystem metadata are emitted, so unchanged sources produce identical files.
const locales = [
  createLocale({ configFile: 'seo.config.json', dataFile: 'case-studies.js', base: '', english: false }),
  createLocale({ configFile: 'seo.en.config.json', dataFile: 'case-studies.en.js', base: 'en/', english: true })
];
const [zh, en] = locales;
if (zh.config.language !== 'zh-CN' || en.config.language !== 'en') throw new Error('Expected zh-CN and en language configs');
if (zh.config.siteUrl !== en.config.siteUrl) throw new Error('Both languages must share the same canonical siteUrl');
for (const entry of zh.cases) {
  const counterpart = en.cases.find(candidate => candidate.key === entry.key);
  if (!counterpart || counterpart.seo.slug !== entry.seo.slug) throw new Error(`${entry.key}: both languages must use the same case key and slug`);
}
const outputs = new Map();
// Keep the Chinese entry and its fixed language URL from one authoring source.
const neutralHome = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const fixedChineseHome = neutralHome
  .replace(/\b(href|src)="\.\//g, '$1="../')
  .replace(/(<script src="\.\.\/language-preference\.js[^\"]*")>/, '$1 defer>');
outputs.set('zh/index.html', fixedChineseHome);
const canonicalRoutes = [];
for (const locale of locales) {
  outputs.set(`${locale.base}projects/index.html`, locale.renderHub());
  for (const entry of locale.cases) outputs.set(`${entry.route}index.html`, locale.renderCase(entry));
  canonicalRoutes.push(locale.homeRoute, `${locale.base}resume.html`, `${locale.base}projects/`, ...locale.cases.map(entry => entry.route));
}
outputs.set('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${canonicalRoutes.map(route => `  <url><loc>${escapeHtml(zh.absolute(route))}</loc></url>`).join('\n')}
</urlset>
`);
outputs.set('robots.txt', `User-agent: *
Allow: /

Sitemap: ${zh.absolute('sitemap.xml')}
`);

for (const [relativePath, content] of outputs) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content.replace(/[\t ]+$/gm, ''), 'utf8');
}
console.log(`Generated ${locales.reduce((count, locale) => count + locale.cases.length + 1, 0)} project pages, sitemap.xml (${canonicalRoutes.length} URLs), and robots.txt.`);
