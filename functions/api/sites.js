/**
 * TeslaTV - Cloudflare Pages Function: /api/sites
 * 返回视频源站点列表
 */

// 默认站点配置
const DEFAULT_SITES = {
    "sites": [
        {
            "key": "okzy",
            "name": "OK资源",
            "api": "https://okzy.cc/api.php/provide/vod"
        },
        {
            "key": "ffzy",
            "name": "非凡资源",
            "api": "https://ffzy5.tv/api.php/provide/vod"
        },
        {
            "key": "wolong",
            "name": "卧龙资源",
            "api": "https://collect.wolongzyw.com/api.php/provide/vod"
        },
        {
            "key": "ikun",
            "name": "iKun资源",
            "api": "https://ikunzyapi.com/api.php/provide/vod"
        },
        {
            "key": "hongniu",
            "name": "红牛资源",
            "api": "https://www.hongniuzy2.com/api.php/provide/vod"
        },
        {
            "key": "kuaikan",
            "name": "快看资源",
            "api": "https://kuaikan-api.com/api.php/provide/vod"
        },
        {
            "key": "subo",
            "name": "速播资源",
            "api": "https://subocaiji.com/api.php/provide/vod"
        },
        {
            "key": "360",
            "name": "360影视",
            "api": "https://360zy.com/api.php/provide/vod"
        }
    ]
};

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

    // 尝试从远程加载配置
    const remoteDbUrl = env.REMOTE_DB_URL;

    if (remoteDbUrl) {
        try {
            const response = await fetch(remoteDbUrl, {
                cf: { cacheTtl: 300 } // 缓存 5 分钟
            });
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.sites)) {
                    return new Response(JSON.stringify(data), { headers: corsHeaders });
                }
            }
        } catch (e) {
            console.error('Failed to load remote config:', e.message);
        }
    }

    // 返回默认配置
    return new Response(JSON.stringify(DEFAULT_SITES), {
        headers: corsHeaders
    });
}
