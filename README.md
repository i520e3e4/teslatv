# 🚗 TeslaTV - 特斯拉车载影视播放系统

<p align="center">
  <img src="public/tesla-icon.svg" width="80" alt="TeslaTV Logo">
</p>

<p align="center">
  <strong>专为 Tesla 车机浏览器优化的流媒体聚合平台</strong><br>
  支持行车模式视频播放 • Netflix 风格 UI • 48+ 视频源聚合
</p>

<p align="center">
  <a href="#-核心特性">核心特性</a> •
  <a href="#-行车模式播放器">行车模式</a> •
  <a href="#-快速部署">快速部署</a> •
  <a href="#-配置说明">配置说明</a>
</p>

---

## ✨ 核心特性

### 🚘 特斯拉专属优化

| 特性 | 说明 |
|------|------|
| **行车模式播放** | 突破特斯拉 D 档视频播放限制，Canvas 渲染绕过系统检测 |
| **车机浏览器适配** | 针对 Tesla 浏览器优化触控交互，支持全屏沉浸式播放 |
| **低延迟响应** | 首页秒开，视频流无缓冲，适合车内 4G/5G 网络 |
| **大屏 UI 设计** | 15 英寸横屏优化布局，字体与按钮尺寸适配车内操作 |

### 📺 三种播放器方案

```
tesla-player.html        - 标准播放器（P 档使用）
tesla-canvas-player.html - Canvas 渲染播放器（D 档备用）
tesla-webcodec-player.html - WebCodec 纯 Canvas 播放器（实验性）
```

### 🎬 流媒体聚合

- **TMDb 元数据驱动**：高清海报、评分、简介，Netflix 级视觉体验
- **48+ 视频源整合**：自动测速、智能排序、失效过滤
- **SSE 实时搜索**：结果即时呈现，边搜边显
- **自动故障转移**：播放失败自动切换下一线路

### 🌏 大陆用户优化

- **TMDB 反代支持**：Cloudflare Worker 一键部署，国内流畅访问
- **本地资源化**：核心库本地部署，无 CDN 依赖
- **智能 IP 检测**：自动识别网络环境，切换最佳配置

---

## 🚗 行车模式播放器

> **突破限制**：特斯拉车机在 D 档（行驶中）会禁用视频播放。TeslaTV 提供多种绕过方案：

### 播放器对比

| 播放器 | 技术原理 | D 档状态 | 适用场景 |
|--------|----------|----------|----------|
| **Canvas 播放器** | 隐藏 `<video>` + Canvas 渲染 | ⚠️ 部分有效 | 兼容性最好 |
| **WebCodec 播放器** | VideoDecoder API + 纯 Canvas | ✅ 理论可行 | 需浏览器支持 |
| **标准播放器** | 原生 `<video>` 标签 | ❌ 会被阻止 | 仅 P 档使用 |

### 使用方法

1. 访问网站首页，搜索或选择影片
2. 点击播放时，系统自动检测 Tesla 浏览器
3. 如在 D 档，会提示使用 Canvas 播放器
4. 或直接访问：`https://你的域名/tesla-canvas-player.html?url=视频地址&title=标题`

---

## 🚀 快速部署

### Cloudflare Pages 部署（推荐）

最适合 Tesla 车机访问，全球 CDN 加速：

1. Fork 本仓库到你的 GitHub
2. 登录 [Cloudflare Pages](https://pages.cloudflare.com/)
3. Create Project → 连接 GitHub 仓库
4. 配置环境变量（见下方）
5. 部署完成后绑定自定义域名

### 环境变量配置

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `TMDB_API_KEY` | ✅ | [TMDb API 密钥](https://www.themoviedb.org/settings/api) |
| `TMDB_PROXY_URL` | ✅ 大陆必填 | TMDB 反代地址 |
| `ACCESS_PASSWORD` | ❌ | 访问密码保护 |
| `REMOTE_DB_URL` | ❌ | 远程站点配置地址 |

### TMDB 反代部署

大陆用户必须部署反代才能正常显示海报：

1. 登录 Cloudflare → Workers & Pages → Create Worker
2. 粘贴 `cloudflare-tmdb-proxy.js` 内容
3. 保存部署，获取 URL（如 `https://tmdb-proxy.xxx.workers.dev`）
4. 将 URL 填入 Cloudflare Pages 环境变量 `TMDB_PROXY_URL`
5. **重新部署** Cloudflare Pages 项目

---

## 🔧 配置说明

### 站点配置 (db.json)

所有视频源配置在 `db.json` 文件中：

```json
{
  "sites": [
    {
      "key": "site1",
      "name": "资源站1",
      "api": "https://api.example.com/api.php/provide/vod",
      "active": true
    }
  ]
}
```

### 本地开发

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 TMDB_API_KEY

# 启动开发服务器
node server.js

# 访问 http://localhost:3000
```

### Docker 部署

```bash
docker run -d -p 3000:3000 \
  -e TMDB_API_KEY="your_key" \
  -e TMDB_PROXY_URL="https://your-proxy.workers.dev" \
  -v $(pwd)/db.json:/app/db.json \
  --name teslatv \
  ghcr.io/ednovas/dongguatv:latest
```

---

## 🛠️ 技术栈

| 类别 | 技术 |
|------|------|
| **前端** | Vue.js 3, Bootstrap 5, DPlayer, HLS.js |
| **后端** | Node.js, Express |
| **数据源** | TMDb API, 48+ Maccms APIs |
| **部署** | Cloudflare Pages, Docker, Vercel |
| **特斯拉适配** | Canvas 渲染, WebCodecs API, MediaSession 屏蔽 |

---

## 📱 多端支持

- **Tesla 车机**：15 英寸横屏优化，触控友好
- **手机/平板**：响应式布局，支持 PWA 添加到主屏
- **Android TV**：提供 APK 安装包，遥控器适配
- **电脑浏览器**：完整功能体验

---

## ⚠️ 免责声明

1. 本项目仅供学习 Node.js 和 Vue.js 技术使用
2. **行车时请专注驾驶，视频播放功能建议仅供副驾乘客使用**
3. 项目不内置任何视频资源，需自行配置合法接口
4. 开发者不对使用本项目产生的任何后果负责

---

## 📄 许可证

MIT License

---

<p align="center">
  <sub>🚗 Drive Safe, Watch Smart</sub>
</p>
