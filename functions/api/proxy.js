/**
 * TeslaTV - Cloudflare Pages Function: /api/proxy
 * HLS 视频流代理（用于解决跨域和支持 FFmpeg.wasm 方案）
 * 
 * 用法：
 * - /api/proxy?url=https://example.com/video.m3u8
 * - /api/proxy?url=https://example.com/segment.ts
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = url.searchParams.get('url');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Range',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Content-Type'
    };

    // 处理 OPTIONS 预检请求
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 验证 URL 格式
    let parsedUrl;
    try {
        parsedUrl = new URL(targetUrl);
    } catch (e) {
        return new Response(JSON.stringify({ error: 'Invalid URL' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 安全检查：只允许代理视频相关文件
    const allowedExtensions = ['.m3u8', '.ts', '.m4s', '.mp4', '.key', '.aac', '.mp3'];
    const pathname = parsedUrl.pathname.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => pathname.includes(ext)) ||
        pathname.includes('segment') ||
        pathname.includes('chunk') ||
        pathname.includes('playlist');

    // 对于 m3u8 播放列表，需要特殊处理
    const isM3U8 = pathname.endsWith('.m3u8') ||
        context.request.headers.get('Accept')?.includes('application/vnd.apple.mpegurl');

    try {
        // 复制原始请求头
        const headers = new Headers();
        headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        headers.set('Referer', parsedUrl.origin);

        // 转发 Range 头（支持分段下载）
        const rangeHeader = context.request.headers.get('Range');
        if (rangeHeader) {
            headers.set('Range', rangeHeader);
        }

        const response = await fetch(targetUrl, {
            method: context.request.method,
            headers: headers,
            redirect: 'follow'
        });

        if (!response.ok && response.status !== 206) {
            return new Response(JSON.stringify({
                error: 'Upstream request failed',
                status: response.status
            }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 处理 M3U8 播放列表（替换相对 URL 为代理 URL）
        if (isM3U8) {
            let m3u8Content = await response.text();

            // 获取基础 URL
            const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
            const proxyBase = url.origin + '/api/proxy?url=';

            // 替换相对路径为绝对代理路径
            m3u8Content = m3u8Content.split('\n').map(line => {
                line = line.trim();

                // 跳过注释和空行
                if (line.startsWith('#') || line === '') {
                    // 但需要处理 EXT-X-KEY 中的 URI
                    if (line.includes('URI="')) {
                        return line.replace(/URI="([^"]+)"/, (match, uri) => {
                            if (uri.startsWith('http')) {
                                return `URI="${proxyBase}${encodeURIComponent(uri)}"`;
                            } else {
                                return `URI="${proxyBase}${encodeURIComponent(baseUrl + uri)}"`;
                            }
                        });
                    }
                    return line;
                }

                // 处理 URL 行
                if (line.startsWith('http')) {
                    return proxyBase + encodeURIComponent(line);
                } else {
                    // 相对路径
                    return proxyBase + encodeURIComponent(baseUrl + line);
                }
            }).join('\n');

            return new Response(m3u8Content, {
                status: response.status,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Cache-Control': 'no-cache'
                }
            });
        }

        // 对于其他文件（.ts, .mp4 等），直接转发
        const responseHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
            responseHeaders.set(key, value);
        });

        // 对 .ts 分片设置合适的缓存
        if (pathname.endsWith('.ts') || pathname.includes('segment')) {
            responseHeaders.set('Cache-Control', 'public, max-age=3600');
        }

        return new Response(response.body, {
            status: response.status,
            headers: responseHeaders
        });

    } catch (error) {
        console.error('[Proxy] Error:', error.message);
        return new Response(JSON.stringify({
            error: 'Proxy request failed',
            message: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
