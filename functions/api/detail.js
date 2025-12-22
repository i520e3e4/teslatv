/**
 * TeslaTV - Cloudflare Pages Function: /api/detail
 * 获取视频详情
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    let id, siteKey;

    if (context.request.method === 'POST') {
        try {
            const body = await context.request.json();
            id = body.id;
            siteKey = body.siteKey;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
                status: 400,
                headers: corsHeaders
            });
        }
    } else {
        id = url.searchParams.get('id');
        siteKey = url.searchParams.get('site_key');
    }

    if (!id || !siteKey) {
        return new Response(JSON.stringify({ error: 'Missing id or site_key' }), {
            status: 400,
            headers: corsHeaders
        });
    }

    // 获取站点列表
    const sitesResponse = await fetch(new URL('/api/sites', context.request.url).toString());
    const sitesData = await sitesResponse.json();
    const sites = sitesData.sites || [];
    const site = sites.find(s => s.key === siteKey);

    if (!site) {
        return new Response(JSON.stringify({ error: 'Site not found' }), {
            status: 404,
            headers: corsHeaders
        });
    }

    try {
        const response = await fetch(`${site.api}?ac=detail&ids=${id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cf: { cacheTtl: 3600 }
        });

        const data = await response.json();

        if (data.list && data.list.length > 0) {
            return new Response(JSON.stringify({ list: [data.list[0]] }), {
                headers: corsHeaders
            });
        } else {
            return new Response(JSON.stringify({ error: 'Not found', list: [] }), {
                status: 404,
                headers: corsHeaders
            });
        }
    } catch (error) {
        console.error('Detail fetch error:', error.message);
        return new Response(JSON.stringify({ error: 'Detail fetch failed', list: [] }), {
            status: 500,
            headers: corsHeaders
        });
    }
}
