/**
 * TeslaTV - Cloudflare Pages Function: /api/config
 * 返回应用配置信息
 */

export async function onRequest(context) {
    const { env } = context;
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    // 处理 OPTIONS 预检请求
    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // 返回配置
    const config = {
        tmdb_api_key: env.TMDB_API_KEY || '',
        tmdb_proxy_url: env.TMDB_PROXY_URL || '',
        enable_local_image_cache: false, // Cloudflare 不支持本地缓存
        sync_enabled: false,
        multi_user_mode: false
    };

    return new Response(JSON.stringify(config), {
        headers: corsHeaders
    });
}
