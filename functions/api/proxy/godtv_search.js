/**
 * TeslaTV - Cloudflare Pages Function: /api/proxy/godtv_search
 * GodTV 搜索适配器
 * 
 * 功能：
 * 1. 接收 ?wd=keyword 参数
 * 2. 模拟请求 GodTV 搜索页面
 * 3. 解析 HTML 返回标准化 JSON 格式
 */

export async function onRequest(context) {
    const url = new URL(context.request.url);
    const keyword = url.searchParams.get('wd');

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (!keyword) {
        return new Response(JSON.stringify({ list: [] }), { headers: corsHeaders });
    }

    try {
        const targetUrl = `https://godtv.pro/index.php/vod/search.html?wd=${encodeURIComponent(keyword)}`;
        console.log(`[GodTV Search] Fetching: ${targetUrl}`);

        const response = await fetch(targetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; GNU/Linux) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/110.0.5481.178 Chrome/110.0.5481.178 Safari/537.36 Tesla/2023.20.7',
                'Referer': 'https://godtv.pro/'
            },
            cf: { cacheTtl: 3600 } // 缓存1小时
        });

        if (!response.ok) {
            console.error(`[GodTV Search] Failed: ${response.status}`);
            return new Response(JSON.stringify({ list: [] }), { headers: corsHeaders });
        }

        const html = await response.text();
        const results = [];

        // 正则解析 HTML
        // 匹配列表项 <li class="l-list-box rel">...</li>
        // 使用非贪婪匹配获取关键信息
        // 注意：正则匹配 HTML 比较脆弱，需要尽量宽容

        // 1. 提取所有 li 块
        const listRegex = /<li class="l-list-box rel">([\s\S]*?)<\/li>/g;
        let match;

        while ((match = listRegex.exec(html)) !== null) {
            const itemHtml = match[1];

            try {
                // 提取链接和名称
                // <a href="/index.php/vod/play/id/25127/sid/1/nid/1.html" class="tim-link">...<h2 class="tim-title">庆余年 第二季</h2>
                const linkMatch = itemHtml.match(/href="([^"]+)"[^>]*class="tim-link"/);
                const titleMatch = itemHtml.match(/class="tim-title">([^<]+)</);

                // 提取图片
                // data-original="https://..."
                const imgMatch = itemHtml.match(/data-original="([^"]+)"/);

                // 提取状态/备注 (第xx集)
                // <span class="b">第36集完结</span>
                const remarkMatch = itemHtml.match(/<span class="b">([^<]+)<\/span>/);

                // 提取年份
                // <div class="Info">2024年</div>
                const yearMatch = itemHtml.match(/<div class="Info">([^<]+)<\/div>/);

                // 提取简介
                // <div class="Blurb">...</div>
                const contentMatch = itemHtml.match(/<div class="Blurb">([\s\S]*?)<\/div>/);

                // 提取类型
                // <div class="Genre hide">类型：剧情,古装...</div>
                const typeMatch = itemHtml.match(/<div class="Genre hide">([^<]+)<\/div>/);

                if (linkMatch && titleMatch) {
                    const href = linkMatch[1];
                    const fullUrl = href.startsWith('http') ? href : `https://godtv.pro${href}`;

                    // 构造符合 CMS 标准的返回对象
                    results.push({
                        vod_id: href, // 使用路径作为 ID
                        vod_name: titleMatch[1].trim(),
                        vod_pic: imgMatch ? imgMatch[1] : '',
                        vod_remarks: remarkMatch ? remarkMatch[1] : '',
                        vod_year: yearMatch ? yearMatch[1].replace('年', '') : '',
                        type_name: typeMatch ? typeMatch[1].replace('类型：', '') : 'GodTV',
                        vod_content: contentMatch ? contentMatch[1].trim() : '',
                        vod_play_from: 'GodTV',
                        // 构造特殊的 play_url 格式
                        // 我们的前端逻辑需要 vod_play_url 包含播放列表
                        // 格式: 播放组$$$集数$链接#集数$链接...
                        // GodTV 搜索结果直接给的是播放页链接，我们直接把它作为一个"直达链接"
                        // 格式: 直达播放$https://godtv.pro/...
                        vod_play_url: `点击播放$${fullUrl}`,
                        site_key: 'godtv', // 关键：前端识别这个 key 会调用 proxy/godtv
                        site_name: '🚀GodTV(免翻)'
                    });
                }
            } catch (e) {
                console.error('[GodTV Parse Error]', e);
            }
        }

        console.log(`[GodTV Search] Found ${results.length} items for "${keyword}"`);

        // 构造标准 CMS 返回格式
        const responseData = {
            code: 1,
            msg: '数据列表',
            page: 1,
            pagecount: 1,
            limit: 20,
            total: results.length,
            list: results
        };

        return new Response(JSON.stringify(responseData), { headers: corsHeaders });

    } catch (error) {
        console.error(`[GodTV Search Error] ${error.message}`);
        return new Response(JSON.stringify({ list: [], error: error.message }), { headers: corsHeaders });
    }
}
