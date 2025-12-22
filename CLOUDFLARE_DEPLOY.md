# TeslaTV - Cloudflare Pages 部署指南

## 前置要求

1. [Cloudflare 账号](https://dash.cloudflare.com/)
2. [GitHub 账号](https://github.com/)  
3. TMDb API Key（[获取](https://www.themoviedb.org/settings/api)）

---

## 第一步：部署 TMDB 反代（中国大陆用户必须）

> ⚠️ 如果你的用户主要在中国大陆，必须先部署 TMDB 反代，否则影片封面和信息无法显示。

### 1.1 创建 Cloudflare Worker

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 **Workers & Pages** → **Create** → **Create Worker**
3. 给 Worker 命名（如 `tmdb-proxy`）
4. 点击 **Deploy** 创建空 Worker

### 1.2 编辑 Worker 代码

1. 点击刚创建的 Worker → **Edit Code**
2. 删除默认代码，粘贴 `cloudflare-tmdb-proxy.js` 的全部内容
3. 点击 **Deploy** 保存

### 1.3 记录 Worker URL

部署成功后，你会获得一个 URL，格式如：
```
https://tmdb-proxy.你的用户名.workers.dev
```

**记下这个 URL**，后面配置 TeslaTV 时需要用到。

---

## 第二步：推送代码到 GitHub

```bash
cd d:/workspace/kerkerker/dongguaTV-tesla

# 设置远程仓库（替换为你的仓库地址）
git remote set-url origin https://github.com/你的用户名/teslatv.git

# 推送代码
git push -u origin main
```

---

## 第三步：部署到 Cloudflare Pages

### 3.1 创建 Pages 项目

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击 **Workers & Pages** → **Create** → **Pages**
3. 选择 **Connect to Git**
4. 授权并选择你的 `teslatv` 仓库

### 3.2 配置构建设置

| 设置项 | 值 |
|--------|-----|
| Framework preset | None |
| Build command | *(留空)* |
| Build output directory | `public` |

### 3.3 配置环境变量

在 **Settings** → **Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `TMDB_API_KEY` | `你的TMDB API Key` | **必填** |
| `TMDB_PROXY_URL` | `https://tmdb-proxy.xxx.workers.dev` | **大陆必填** |
| `ACCESS_PASSWORD` | `你的访问密码` | 可选 |

### 3.4 保存并部署

点击 **Save and Deploy**，等待部署完成。

---

## 环境变量详解

| 变量 | 说明 | 示例 |
|------|------|------|
| `TMDB_API_KEY` | TMDb API 密钥，用于获取影片信息和封面 | `3056754f5a50bf5171f9d411e3029fb3` |
| `TMDB_PROXY_URL` | TMDB 反代地址（大陆用户必须） | `https://tmdb-proxy.xxx.workers.dev` |
| `ACCESS_PASSWORD` | 访问密码，留空则无需密码 | `mypassword123` |
| `REMOTE_DB_URL` | 远程站点配置 URL（可选，用于动态更新站点） | `https://xxx/sites.json` |

---

## 验证部署

部署完成后，访问你的 Pages URL（如 `teslatv.pages.dev`）：

- [x] 首页正常显示
- [x] 影片封面正常加载（需要 TMDB 反代）
- [x] 搜索功能正常
- [x] 视频播放正常
- [x] TeslaTV 品牌显示

---

## 资源站点

项目已内置 **25 个精选影视资源站点**（来自 [LunaTV-config](https://github.com/hafrey1/LunaTV-config)）：

| 站点 | 站点 | 站点 |
|------|------|------|
| 爱奇艺资源 | 豆瓣资源 | 天涯影视 |
| 茅台资源 | 卧龙资源 | iKun资源 |
| 电影天堂 | 猫眼资源 | 量子资源 |
| 360资源 | 极速资源 | 魔都资源 |
| 非凡资源 | 暴风资源 | 最大资源 |
| 无尽资源 | 新浪资源 | 旺旺资源 |
| 速播资源 | 金鹰点播 | 飘零资源 |
| U酷影视 | 光速资源 | 红牛资源 |
| 魔都动漫 | | |

---

## 故障排除

### 问题：影片封面不显示
→ 检查 `TMDB_PROXY_URL` 是否正确配置

### 问题：搜索无结果
→ 检查 Pages Functions 日志：Dashboard → Pages → Functions → Logs

### 问题：视频无法播放
→ 资源站点可能失效，尝试其他资源站点
