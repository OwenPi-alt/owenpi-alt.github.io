# 王子棋 · Backend × AI

个人简介与技术作品集，使用原生 HTML、CSS 和 JavaScript，由 GitHub Pages 托管。

**访问地址：[owenpi-alt.github.io](https://owenpi-alt.github.io/)**

## 页面

- `index.html`：个人主页、技术图谱、项目筛选与详情、技术栈和职业经历。
- `styles.css`：深色主题、响应式布局、动效与减少动态效果支持。
- `app.js`：本地交互，无后端服务、追踪脚本或第三方运行依赖。
- `resume.html`：独立精简简历；使用页面按钮打印或保存 PDF。
- `assets/favicon.svg`：站点图标。
- `.nojekyll`：直接发布静态文件。

## 本地预览

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

浏览器访问 `http://127.0.0.1:8080`。无需安装依赖或构建。

## 更新与发布

仓库的 Pages 来源设置为 `main` 分支的根目录。修改文件后提交并推送，GitHub Pages 自动构建并更新站点。

主页基础文案维护在 `index.html`，项目弹窗内容维护在 `app.js`，打印简历维护在 `resume.html`。修改经历时同步相关页面，保留真实职责及项目归属。

项目图为技术思路示意。履历使用本人提供的事实，不展示未经确认的吞吐、性能或业务效果指标。公开页面不包含私人联系方式或源简历文件。

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
