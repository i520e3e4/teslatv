# TeslaTV 独立播放器部署

此目录包含用于部署到子域名 `player.686423.xyz` 的文件。

## 文件列表

- `player.html` - 独立播放器页面

## 部署方式

### 方式 A：Cloudflare Pages（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages → 创建项目 → 直接上传
3. 上传此目录下的所有文件
4. 项目名称设为 `teslatv-player`
5. 部署完成后，进入 **自定义域名**
6. 添加 `player.686423.xyz`

### 方式 B：VPS + Nginx

```bash
# 1. 上传文件到服务器
scp player.html root@你的VPS:/var/www/player/

# 2. 配置 Nginx
server {
    listen 443 ssl http2;
    server_name player.686423.xyz;
    
    root /var/www/player;
    index player.html;
    
    # SSL 证书配置
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # CORS 允许跨域
    add_header Access-Control-Allow-Origin "*";
    
    location / {
        try_files $uri $uri/ =404;
    }
}

# 3. 重载 Nginx
nginx -t && systemctl reload nginx
```

## 验证

部署后访问：
```
https://player.686423.xyz/player.html?url=https://test.m3u8
```

如果能看到播放器界面，说明部署成功。
