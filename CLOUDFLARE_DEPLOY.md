# TeslaTV - Cloudflare Pages 部署指南

## 前置要求

1. [Cloudflare 账号](https://dash.cloudflare.com/)
2. [Node.js 18+](https://nodejs.org/)
3. TMDb API Key（[获取](https://www.themoviedb.org/settings/api)）

## 部署步骤

### 方法一：通过 Cloudflare Dashboard（推荐）

1. **登录 Cloudflare Dashboard**
   - 访问 https://dash.cloudflare.com/
   - 点击 "Workers & Pages"

2. **创建 Pages 项目**
   - 点击 "Create application" → "Pages"
   - 选择 "Connect to Git"
   - 授权并选择你的 GitHub/GitLab 仓库

3. **配置构建设置**
   ```
   Framework preset: None
   Build command: (留空)
   Build output directory: public
   Root directory: /
   ```

4. **配置环境变量**
   在 Settings → Environment Variables 中添加：
   
   | 变量名 | 说明 | 必填 |
   |--------|------|------|
   | `TMDB_API_KEY` | TMDb API 密钥 | ✅ |
   | `ACCESS_PASSWORD` | 访问密码（可选） | ❌ |
   | `TMDB_PROXY_URL` | 大陆用户需要 | 大陆必填 |
   | `REMOTE_DB_URL` | 远程配置 URL | ❌ |

5. **部署**
   - 点击 "Save and Deploy"
   - 等待部署完成

### 方法二：通过 Wrangler CLI

1. **安装 Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **部署**
   ```bash
   wrangler pages deploy public --project-name teslatv
   ```

4. **配置环境变量**
   通过 Dashboard 或 CLI 配置：
   ```bash
   wrangler pages secret put TMDB_API_KEY --project-name teslatv
   ```

## 大陆用户额外配置

如果你的主要用户在中国大陆，需要部署 TMDB 反代：

1. 创建新的 Cloudflare Worker
2. 复制 `cloudflare-tmdb-proxy.js` 内容
3. 部署并获取 Worker URL
4. 将 URL 配置到 `TMDB_PROXY_URL` 环境变量

## 验证部署

部署完成后，访问你的 Pages URL（如 `teslatv.pages.dev`）验证：

- [x] 首页正常加载
- [x] 搜索功能正常
- [x] 视频播放正常
- [x] TeslaTV 品牌显示正确

## 故障排除

### 问题：TMDb 数据不显示
→ 检查 `TMDB_API_KEY` 是否正确配置

### 问题：搜索无结果
→ 检查 Pages Functions 日志（Dashboard → Pages → Functions → Logs）

### 问题：大陆用户无法加载图片
→ 需要配置 `TMDB_PROXY_URL` 反代
