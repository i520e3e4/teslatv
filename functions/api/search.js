/**
 * TeslaTV - Cloudflare Pages Function: /api/search
 * 流式搜索 API (SSE)
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const keyword = url.searchParams.get('wd');
    const stream = url.searchParams.get('stream') === 'true';

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!keyword) {
        return new Response(JSON.stringify({ error: 'Missing keyword' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 获取站点列表
    const sitesResponse = await fetch(new URL('/api/sites', context.request.url).toString());
    const sitesData = await sitesResponse.json();
    const sites = sitesData.sites || [];

    // [New] Inject GodTV Adapter
    // Allows searching GodTV content alongside other generic sites
    sites.push({
        key: 'godtv',
        name: '🚀GodTV(免翻)',
        api: new URL('/api/proxy/godtv_search', context.request.url).toString()
    });

    if (!stream) {
        // 非流式模式：一次性返回所有结果
        const allResults = [];

        const searchPromises = sites.map(async (site) => {
            try {
                const response = await fetch(`${site.api}?ac=detail&wd=${encodeURIComponent(keyword)}`, {
                    cf: { cacheTtl: 3600 }
                });
                const data = await response.json();

                if (data.list && Array.isArray(data.list)) {
                    return data.list.map(item => ({
                        vod_id: item.vod_id,
                        vod_name: item.vod_name,
                        vod_pic: item.vod_pic,
                        vod_remarks: item.vod_remarks,
                        vod_year: item.vod_year,
                        type_name: item.type_name,
                        vod_content: item.vod_content,
                        vod_play_from: item.vod_play_from,
                        vod_play_url: item.vod_play_url,
                        site_key: site.key,
                        site_name: site.name
                    }));
                }
                return [];
            } catch (e) {
                console.error(`Search error for ${site.name}:`, e.message);
                return [];
            }
        });

        const results = await Promise.all(searchPromises);
        results.forEach(r => allResults.push(...r));

        return new Response(JSON.stringify({ list: allResults }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // 流式模式 (SSE)
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // 异步发送搜索结果
    (async () => {
        try {
            const searchPromises = sites.map(async (site) => {
                try {
                    const response = await fetch(`${site.api}?ac=detail&wd=${encodeURIComponent(keyword)}`, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });
                    const data = await response.json();

                    if (data.list && Array.isArray(data.list) && data.list.length > 0) {
                        const items = data.list.map(item => ({
                            vod_id: item.vod_id,
                            vod_name: item.vod_name,
                            vod_pic: item.vod_pic,
                            vod_remarks: item.vod_remarks,
                            vod_year: item.vod_year,
                            type_name: item.type_name,
                            vod_content: item.vod_content,
                            vod_play_from: item.vod_play_from,
                            vod_play_url: item.vod_play_url,
                            site_key: site.key,
                            site_name: site.name
                        }));

                        await writer.write(encoder.encode(`data: ${JSON.stringify(items)}\n\n`));
                    }
                } catch (e) {
                    console.error(`Search error for ${site.name}:`, e.message);
                }
            });

            await Promise.all(searchPromises);
            await writer.write(encoder.encode('event: done\ndata: {}\n\n'));
        } catch (e) {
            console.error('SSE error:', e);
        } finally {
            await writer.close();
        }
    })();

    return new Response(readable, {
        headers: {
            ...corsHeaders,
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
}
