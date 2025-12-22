/**
 * TeslaTV - Cloudflare Pages Function: /api/auth/check
 * 检查是否需要密码
 */

export async function onRequest(context) {
    const { env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // 检查是否配置了访问密码
    const accessPassword = env.ACCESS_PASSWORD || '';
    const requirePassword = accessPassword.length > 0;

    return new Response(JSON.stringify({ requirePassword }), {
        headers: corsHeaders
    });
}
