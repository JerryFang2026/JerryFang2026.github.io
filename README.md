# Aquifer Notes · 网站

Jerry 的英文博客 + 水文地质专业书目资料库。纯静态网站，零依赖，只需要 Python 3。

## 目录结构

```
site/
├─ index.html            首页（博客列表）
├─ post.html             文章页（?id=文章slug）
├─ library.html          资料库（搜索/筛选/详情）
├─ about.html            关于
├─ assets/style.css      样式（明暗双主题）
├─ assets/app.js         前端逻辑；站名/副标题在文件开头 SITE 处改
├─ posts/*.md            文章源文件（英文，Markdown + frontmatter）
├─ posts/_zh_drafts/     中文草稿备份（不参与构建，不发布）
├─ extensions/           分享出去的小工具源码（如 open-in-new-tab Chrome 扩展）
├─ i18n/books_en.json    26 册书编目注释的英文翻译（构建时合并）
├─ data/                 生成的数据（不要手改）
├─ build.py              构建：posts/*.md + ../outputs 编目数据 + i18n → data/*.js
├─ artifact_template.html 单文件版模板
├─ make_artifact.py      构建单文件版 artifact.html（Claude Artifact 分享用）
└─ artifact.html         生成的单文件版
```

## 加一篇新文章

1. 在 `posts/` 新建 `YYYY-MM-DD-slug.md`（英文）：

```markdown
---
title: Post title
date: 2026-09-01
category: Essays
summary: One-line summary shown in the list.
---

Body text. Supports # headings, **bold**, [links](url), - lists, > quotes, and ``` fenced code blocks.
```

2. 在 site 目录运行 `python build.py`。完成。

发布后读者不需要强制刷新：页面打开时会自动向服务器核对一次文章列表是否最新（`assets/app.js` 里的 `refreshData`），旧了就原地换成新的。资料库页面同理。

## 资料库加书

新一批书扫描 → 编目（数据进 `../outputs/`）→ 给新书补英文注释进 `i18n/books_en.json` → `python build.py`。

## 本地预览

```
python -m http.server 8787 --directory D:/资料库/site
```

## 部署（目标：外人可访问的正式网站）

推荐 GitHub Pages（免费 + HTTPS + 可绑自购域名）：

1. 有 GitHub 账号，网页上新建仓库（如 `aquifer-notes`）；
2. 在 site 目录：`git init` → commit → 推送到仓库（首次推送会弹 GitHub 登录窗口授权）；
3. 仓库 Settings → Pages → Source 选 main 分支根目录；
4. 几分钟后站点上线于 `https://<用户名>.github.io/aquifer-notes/`；
5. （可选）买域名后在 Pages 设置里绑定。

国内访问不稳可换 Cloudflare Pages，同样免费、流程类似。

## Claude Artifact 版

`python make_artifact.py` 生成单文件 `artifact.html`。
已发布：https://claude.ai/code/artifact/3d0bbd9e-e133-4c97-a943-c729b069f8ab
（更新方式：让 Claude 重新构建并 republish 同一路径。）
