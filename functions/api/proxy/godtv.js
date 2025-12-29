/**
 * TeslaTV - Cloudflare Pages Function: /api/proxy/godtv
 * GodTV 专用代理接口
 * 
 * 用法：
 * - /api/proxy/godtv?url=https://godtv.pro/index.php/vod/play/id/80352/sid/1/nid/1.html
 * 
 * 功能：
 * 1. 模拟 Tesla User-Agent 访问目标 URL
 * 2. 提取页面中的 `player_aaaa` 变量
 * 3. 返回真实的 m3u8 播放地址
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const targetUrl = url.searchParams.get('url');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    // OPTION 预检
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        // 构造请求，模拟 Tesla 车机
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; GNU/Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/110.0.5481.178 Chrome/110.0.5481.178 Safari/537.36 Tesla/2023.20.7',
                'Referer': 'https://godtv.pro/'
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ error: 'Upstream request failed', status: response.status }), {
                status: response.status,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const html = await response.text();

        // 提取 player_aaaa 变量
        // 目标格式: var player_aaaa={...}
        const match = html.match(/var\s+player_aaaa\s*=\s*(\{.*?\});/s);

        if (match && match[1]) {
            try {
                const playerData = JSON.parse(match[1]);
                const m3u8Url = playerData.url;

                if (m3u8Url) {
                    return new Response(JSON.stringify({
                        success: true,
                        url: m3u8Url,
                        original_data: playerData
                    }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                    });
                }
            } catch (e) {
                // JSON 解析失败
            }
        }

        return new Response(JSON.stringify({ error: 'Failed to extract video URL' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
