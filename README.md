# 王子棋 · 架构设计 / 全栈开发 / AI 工程

个人履历、技术作品集与项目合作参考页，使用原生 HTML、CSS 和 JavaScript，由 GitHub Pages 托管。

**访问地址：[owenpi-alt.github.io](https://owenpi-alt.github.io/)**

通用入口会自动选择语言：[owenpi-alt.github.io](https://owenpi-alt.github.io/)。固定中文版在 [/zh/](https://owenpi-alt.github.io/zh/)，英文版在 [/en/](https://owenpi-alt.github.io/en/)。顶部 `中文 / EN` 始终可主动切换。

通用入口 `/`（包括 `/index.html`）的选择顺序：已手动选择的语言 → 浏览器语言偏好中第一个支持的中文或英文 → 默认中文。支持 `zh-*`、`en-*` 等语言标签；没有匹配或读取失败时使用中文。跳转保留查询参数和页内锚点，并用 `location.replace` 避免后退反复跳转。

固定 `/zh/`、`/en/`、案例和简历页面不自动改变语言，即使浏览器或已保存偏好不同也保留链接语言。手动点击、键盘选择、修饰键点击或中键打开语言链接时，会尝试在本机 `localStorage` 保存 `zh` / `en`；不阻止原生链接操作。浏览器禁止存储时，语言切换仍然可用，但不能持久记忆。无 JavaScript 时，通用入口保留完整中文内容，真实语言链接仍然可用。

## 页面

- `index.html`：中文首页的内容源，同时是自动语言入口的完整中文备用页面。
- `zh/index.html`：由生成器输出的固定中文首页，不在此文件单独编辑文案。
- `language-preference.js`：入口语言选择与本地手动偏好；不使用 IP 定位或外部服务。
- `en/index.html` / `en/resume.html`：完整英文首页和可打印英文简历。
- `bilingual.css`：语言切换与英文长文本的响应式排版。
- `styles.css`：基础布局和响应式规则。
- `workbench.css`：黑灰工程笔记风格；真实案例首屏、紧凑项目列表、移动端与无动画阅读体验。
- `portfolio.css`：服务列表、工程原型图示、交付流程与新版响应式样式。
- `casebook.css`：架构交互面板、技术案例长页与更鲜明的内容层次。
- `case-studies.js`：七个完整案例的数据，包含问题约束、链路、架构取舍、价值与验收关注点。
- `case-studies.en.js`：对应英文案例，保持同样的案例 key、职责和研发阶段边界。
- `architecture-lab.js`：三个可切换的设计场景、十二个可探索的架构节点。
- `architecture-lab.en.js`：英文设计场景与节点说明，供共享交互脚本使用。
- `app.js`：首屏项目流程切换、筛选、案例预览与联系交互。首屏与详情共用案例数据；无后端服务、追踪脚本或第三方运行依赖。
- `resume.html`：独立精简简历；使用页面按钮打印或保存 PDF。
- `assets/favicon.svg`：站点图标。
- `projects/` / `en/projects/`：中英文案例汇总及完整静态案例页，无需 JavaScript 即可阅读。
- `seo-pages.css`：独立案例页的排版和打印样式。
- `seo.config.json` / `seo.en.config.json`：两种语言的站点资料、同名案例 slug、搜索标题、摘要与分享图。
- `robots.txt` / `sitemap.xml`：抓取说明与二十个主站规范网址。
- `scripts/build-seo.mjs` / `scripts/check-seo.mjs`：生成静态案例并检查 SEO 结构。
- `.nojekyll`：直接发布静态文件。
- `.github/ISSUE_TEMPLATE/project-inquiry.yml` / `project-inquiry-en.yml`：中英文公开项目合作需求表单。

## 项目合作入口

业务邮箱：[chuangzaoxingfuvip@gmail.com](mailto:chuangzaoxingfuvip@gmail.com)。“聊聊合作”、服务咨询与案例咨询均直接打开邮件撰写窗口；页面同时提供邮箱复制入口。

[提交项目需求](https://github.com/OwenPi-alt/owenpi-alt.github.io/issues/new?template=project-inquiry.yml)

表单覆盖服务方向、业务目标、现有系统、交付范围和验收结果，时间与预算可选。提交需要 GitHub 账号，Issue 公开可见，请仅描述可公开的项目概要。

## 本地预览

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8080`。无需安装依赖或构建。

## 更新与发布

仓库的 Pages 来源设置为 `main` 分支的根目录。修改文件后提交并推送，GitHub Pages 自动构建并更新站点。

中文主页和简历维护在 `index.html` / `resume.html`，英文版本维护在 `en/` 的对应文件。案例源分别是 `case-studies.js` / `case-studies.en.js`；架构推演的英文数据位于 `architecture-lab.en.js`。更新事实、职责或阶段时，两种语言一起维护。

`app.js` 根据文档 `lang` 选择交互文案；`language-preference.js` 只在通用入口自动跳转。首页先展示项目，再介绍合作服务、技术拆解和个人经历。首屏摘录真实案例的四步流程，原型有明确标签；无 JavaScript 时仍可阅读并进入静态案例页。中文保留简版案例作为兼容内容；英文案例数据未加载时，真实链接会进入英文静态页，避免回退成中文弹窗。

脚本与增量样式的引用带有文件内容哈希 `?v=`，修改后需更新对应 URL 的版本值，并同步到旧址兼容仓库，避免浏览器混用新旧资源。

## SEO 与静态案例维护

首页案例标题是可抓取链接；“展开架构案例”链接支持普通点击预览、修饰键/新标签打开独立页面，关闭 JavaScript 时也能直接阅读。弹窗提供“独立阅读”入口。

修改任一语言的案例源、SEO 配置或独立页样式后，运行：

```sh
node scripts/build-seo.mjs
node scripts/check-seo.mjs
node --test scripts/test-language-preference.mjs
```

生成器不依赖 npm 包。`zh/index.html`、`projects/` 和 `en/projects/` 为生成文件，不单独改写，以免与来源内容漂移。生成后的 HTML 与 sitemap 一起提交，GitHub Pages 直接发布。

中英文各八张分享图均为 1200×630。中文位于 `assets/og-*.png`，英文位于 `assets/og-en-*.png`。源模板是 `scripts/social-card.template.html`；执行 `node scripts/build-social-previews.mjs` 后，使用浏览器把 `output/social/` 与 `output/social/en/` 的对应 HTML 渲染为配置指定的 PNG。标题、结构化数据和图片须与可见内容一致。

中英文各页使用自己的 canonical；中文首页为 `/zh/`，英文首页为 `/en/`。两种首页的 `x-default` 指向通用入口 `/`，该入口不作为重复 canonical 页加入 sitemap。案例和简历的路径保持原样，其 `x-default` 仍指向对应中文内容页。每页提供互指的 `zh-CN`、`en` alternates，语言切换保留对应案例或简历。

旧址兼容页指向主站对应语言、对应内容的 URL。sitemap 只包含主站二十个页面，旧址不使用 robots 阻止抓取，以便搜索引擎能读取 canonical。`robots.txt` 只有主域根路径生效。

### 搜索平台验证与提交

公开站点地图：[sitemap.xml](https://owenpi-alt.github.io/sitemap.xml)。根 robots 已声明该地址，供搜索引擎发现。

Google Search Console 的站点所有权验证、站点地图提交及收录监控需要真实登录和该资源的权限。目前未在网站中伪造验证标签，也未声称已经提交或收录。获得验证 HTML 文件或标签后可加入主站，再由账户持有人验证并提交站点地图。Bing 等平台同样以各自后台提供的验证材料和处理状态为准。

结构化数据采用主页 WebSite / WebPage / Person、简历 ProfilePage、案例 Article / BreadcrumbList 和汇总 CollectionPage / ItemList；不补造评分、发布日期、客户或效果数字。JSON-LD 检查通过不等于搜索引擎一定展示富结果，sitemap 也不保证收录或排名。

官方规则：[可抓取链接](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)、[canonical](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)、[sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。

项目图为技术思路示意。职业案例使用本人提供的事实；AIGC 与量化案例单独标为 AI 协作完成的个人工程 / 研究原型，详情说明当前阶段。页面不将离线原型描述为客户交付或实盘产品，不展示未经确认的吞吐、性能、盈利或业务效果指标。服务方向说明合作范围，不代表每类服务均已有客户案例。联系方式仅公开本人授权的业务邮箱与 GitHub；页面不包含其他私人联系方式、内部源码或源简历文件。

## 后续绑定独立域名

1. 在仓库 Settings → Pages → Custom domain 填入自己的域名。
2. 若使用子域名（例如 `www.example.com`），在域名服务商配置 CNAME，目标为 `owenpi-alt.github.io`。
3. 等待 GitHub DNS 检查和证书准备完成，再启用 Enforce HTTPS。
4. 同步更新两个 `seo*.config.json` 的 `siteUrl`，并更新中英文主页、简历的 canonical、hreflang、OG、JSON-LD 和相关主站地址；重建静态案例、分享图与 sitemap，再更新旧址副本。复制主页按钮自动读取当前语言的 canonical。
5. 若使用根域名，按 GitHub 当时的官方文档设置 A / AAAA 或 ALIAS 记录，不从示例猜测地址。

[GitHub Pages 自定义域名官方说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 回退

需要撤销某次更新时，使用 `git revert <commit>` 创建回退提交并推送。不要通过强制推送覆盖历史。

`output/` 用于本地浏览器验收资料，已被 Git 忽略，不随站点发布。
