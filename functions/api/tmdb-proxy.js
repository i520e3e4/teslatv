/**
 * TeslaTV - Cloudflare Pages Function: /api/tmdb-proxy
 * TMDB API 代理
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

    // 构建 TMDB URL
    const params = new URLSearchParams();
    params.set('api_key', TMDB_API_KEY);
    params.set('language', 'zh-CN');

    // 复制其他参数
    for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'path') {
            params.set(key, value);
        }
    }

    const tmdbUrl = `https://api.themoviedb.org/3${tmdbPath}?${params.toString()}`;

    try {
        const response = await fetch(tmdbUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cf: { cacheTtl: 36000 } // 缓存 10 小时
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: corsHeaders
        });
    } catch (error) {
        console.error('TMDB proxy error:', error.message);
        return new Response(JSON.stringify({ error: 'Proxy request failed' }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
