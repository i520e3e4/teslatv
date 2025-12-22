/**
 * TeslaTV - Cloudflare Pages Function: /api/tmdb-image/[size]/[filename]
 * TMDB 图片代理
 */

export async function onRequest(context) {
    const { params, env } = context;
    const { size, filename } = params;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // 验证参数
    const allowedSizes = ['w300', 'w342', 'w500', 'w780', 'w1280', 'original'];
    if (!allowedSizes.includes(size)) {
        return new Response('Invalid size', {
            status: 400,
            headers: corsHeaders
        });
    }

    // 构建 TMDB 图片 URL
    let targetUrl = `https://image.tmdb.org/t/p/${size}/${filename}`;

    // 如果配置了反代，使用反代 URL
    if (env.TMDB_PROXY_URL) {
        const proxyBase = env.TMDB_PROXY_URL.replace(/\/$/, '');
        targetUrl = `${proxyBase}/t/p/${size}/${filename}`;
    }

    try {
        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cf: { cacheTtl: 86400 } // 缓存 1 天
        });

        if (!response.ok) {
            return new Response('Image not found', {
                status: response.status,
                headers: corsHeaders
            });
        }

        // 转发响应
        const headers = new Headers(response.headers);
        headers.set('Cache-Control', 'public, max-age=86400'); // 1 天
        Object.entries(corsHeaders).forEach(([key, value]) => {
            headers.set(key, value);
        });

        return new Response(response.body, {
            status: response.status,
            headers
        });

    } catch (error) {
        console.error('Image proxy error:', error.message);
        return new Response('Image fetch failed', {
            status: 500,
            headers: corsHeaders
        });
    }
}
