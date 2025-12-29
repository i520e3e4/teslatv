/**
 * TeslaTV - Cloudflare Pages Function: /api/tmdb-proxy
 * TMDB API 代理
 * 
 * 支持两种模式：
 * 1. 如果配置了 TMDB_PROXY_URL，通过反代访问（适合大陆用户）
 * 2. 否则直接访问 TMDB 官方 API（需要服务器能访问 TMDB）
 */

export async function onRequest(context) {
    const { env } = context;
    const url = new URL(context.request.url);
    const tmdbPath = url.searchParams.get('path');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!tmdbPath) {
        return new Response(JSON.stringify({ error: 'Missing path' }), {
            status: 400,
            headers: corsHeaders
        });
    }

    const TMDB_API_KEY = env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
        return new Response(JSON.stringify({ error: 'TMDB API Key not configured' }), {
            status: 500,
            headers: corsHeaders
        });
    }

    // 构建请求参数
    const params = new URLSearchParams();
    params.set('api_key', TMDB_API_KEY);
    params.set('language', 'zh-CN');

    // 复制其他参数
    for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'path') {
            params.set(key, value);
        }
    }

    // 判断使用反代还是直连
    // 如果配置了 TMDB_PROXY_URL，通过反代访问（适合大陆用户）
    let tmdbUrl;
    const TMDB_PROXY_URL = env.TMDB_PROXY_URL;

    if (TMDB_PROXY_URL) {
        // 使用用户配置的反代
        const proxyBase = TMDB_PROXY_URL.replace(/\/$/, '');
        tmdbUrl = `${proxyBase}/api/3${tmdbPath}?${params.toString()}`;
        console.log('[TMDB Proxy] Using custom proxy:', proxyBase);
    } else {
        // 直连 TMDB（Cloudflare Workers 可以访问）
        tmdbUrl = `https://api.themoviedb.org/3${tmdbPath}?${params.toString()}`;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout

        const response = await fetch(tmdbUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cf: { cacheTtl: 36000 }, // 缓存 10 小时
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.error('[TMDB Proxy] Request failed:', response.status, response.statusText);
            return new Response(JSON.stringify({
                error: 'TMDB request failed',
                status: response.status
            }), {
                status: response.status,
                headers: corsHeaders
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: corsHeaders
        });
    } catch (error) {
        console.error('[TMDB Proxy] Error:', error.message);
        return new Response(JSON.stringify({
            error: 'Proxy request failed',
            message: error.message
        }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
