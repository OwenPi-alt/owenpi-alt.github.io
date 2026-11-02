# 王子棋 · 架构设计 / 全栈开发 / AI 工程

个人履历、技术作品集与项目合作参考页，使用原生 HTML、CSS 和 JavaScript，由 GitHub Pages 托管。

**访问地址：[owenpi-alt.github.io](https://owenpi-alt.github.io/)**

## 页面

- `index.html`：合作服务、四类技术图谱、七个项目案例、交付流程和职业经历。
- `styles.css`：深色主题、响应式布局、动效与减少动态效果支持。
- `portfolio.css`：服务列表、工程原型图示、交付流程与新版响应式样式。
- `casebook.css`：架构交互面板、技术案例长页与更鲜明的内容层次。
- `case-studies.js`：七个完整案例的数据，包含问题约束、链路、架构取舍、价值与验收关注点。
- `architecture-lab.js`：三个可切换的设计场景、十二个可探索的架构节点。
- `app.js`：本地交互，无后端服务、追踪脚本或第三方运行依赖。
- `resume.html`：独立精简简历；使用页面按钮打印或保存 PDF。
- `assets/favicon.svg`：站点图标。
- `.nojekyll`：直接发布静态文件。
- `.github/ISSUE_TEMPLATE/project-inquiry.yml`：公开项目合作需求表单。

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

主页基础文案维护在 `index.html`，完整案例内容维护在 `case-studies.js`，架构设计推演维护在 `architecture-lab.js`，打印简历维护在 `resume.html`。`app.js` 保留简版案例作为跨版本缓存或扩展资源缺失时的兼容内容。修改经历时同步相关页面，保留真实职责及项目归属。

脚本与增量样式的引用带有文件内容哈希 `?v=`，修改后需更新对应 URL 的版本值，并同步到旧址兼容仓库，避免浏览器混用新旧资源。

项目图为技术思路示意。职业案例使用本人提供的事实；AIGC 与量化案例单独标为 AI 协作完成的个人工程 / 研究原型，详情说明当前阶段。页面不将离线原型描述为客户交付或实盘产品，不展示未经确认的吞吐、性能、盈利或业务效果指标。服务方向说明合作范围，不代表每类服务均已有客户案例。联系方式仅公开本人授权的业务邮箱与 GitHub；页面不包含其他私人联系方式、内部源码或源简历文件。

## 后续绑定独立域名

1. 在仓库 Settings → Pages → Custom domain 填入自己的域名。
2. 若使用子域名（例如 `www.example.com`），在域名服务商配置 CNAME，目标为 `owenpi-alt.github.io`。
3. 等待 GitHub DNS 检查和证书准备完成，再启用 Enforce HTTPS。
4. 将 `index.html` 中 canonical、`og:url` 改为新域名，更新本文件的访问地址。复制主页按钮自动读取 canonical。
5. 若使用根域名，按 GitHub 当时的官方文档设置 A / AAAA 或 ALIAS 记录，不从示例猜测地址。

[GitHub Pages 自定义域名官方说明](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

## 回退

需要撤销某次更新时，使用 `git revert <commit>` 创建回退提交并推送。不要通过强制推送覆盖历史。

`output/` 用于本地浏览器验收资料，已被 Git 忽略，不随站点发布。
