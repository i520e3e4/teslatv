/**
 * TeslaTV - Cloudflare Pages Function: /api/sites
 * 返回视频源站点列表
 * 
 * 自动同步 LunaTV-config 完整版（🎬+🔞）资源
 * https://github.com/hafrey1/LunaTV-config
 * 
 * 配置源：
 * - full: 完整版（88个资源，🎬+🔞）
 * - jingjian: 精简+成人版（61个资源）
 * - jin18: 精简版（31个资源，仅🎬）
 */

// LunaTV-config CORSAPI 订阅地址
const LUNATV_CONFIG_URL = 'https://pz.v88.qzz.io';

// 默认使用完整版 (full)，包含 🎬+🔞
const DEFAULT_SOURCE = 'full';

// 备用静态站点配置（当远程获取失败时使用）
const FALLBACK_SITES = {
    "sites": [
        { "key": "iqiyizy", "name": "🎬爱奇艺资源", "api": "https://iqiyizyapi.com/api.php/provide/vod" },
        { "key": "dbzy", "name": "🎬豆瓣资源", "api": "https://caiji.dbzy5.com/api.php/provide/vod" },
        { "key": "wolong", "name": "🎬卧龙资源", "api": "https://wolongzyw.com/api.php/provide/vod" },
        { "key": "ikun", "name": "🎬iKun资源", "api": "https://ikunzyapi.com/api.php/provide/vod" },
        { "key": "ffzy", "name": "🎬非凡资源", "api": "https://api.ffzyapi.com/api.php/provide/vod" },
        { "key": "hongniu", "name": "🎬红牛资源", "api": "https://www.hongniuzy2.com/api.php/provide/vod" },
        { "key": "subo", "name": "🎬速播资源", "api": "https://subocaiji.com/api.php/provide/vod" },
        { "key": "360zy", "name": "🎬360资源", "api": "https://360zyzz.com/api.php/provide/vod" }
    ]
};

/**
 * 将 LunaTV-config 的 api_site 格式转换为 TeslaTV 的 sites 格式
 */
function convertLunaTVFormat(data) {
    if (!data || !data.api_site) {
        return null;
    }

    const sites = [];
    for (const [key, value] of Object.entries(data.api_site)) {
        sites.push({
            key: key.replace(/\./g, '_'),
            name: value.name || key,
            api: value.api,
            detail: value.detail || ''
        });
    }

    return { sites };
}

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

    // 优先使用用户自定义的远程配置
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
            console.error('[Sites] Failed to load custom remote config:', e.message);
        }
    }

    // 从 LunaTV-config CORSAPI 获取完整版配置
    // 使用 format=0 (原始 JSON) + source=full (完整版 🎬+🔞)
    const source = env.LUNATV_SOURCE || DEFAULT_SOURCE;
    const lunaTVUrl = `${LUNATV_CONFIG_URL}?format=0&source=${source}`;

    try {
        console.log('[Sites] Fetching from LunaTV-config:', lunaTVUrl);

        const response = await fetch(lunaTVUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            cf: { cacheTtl: 7200 } // 缓存 2 小时（与 LunaTV-config 推荐一致）
        });

        if (response.ok) {
            const data = await response.json();

            // 转换 LunaTV-config 格式为 TeslaTV 格式
            const convertedData = convertLunaTVFormat(data);

            if (convertedData && convertedData.sites.length > 0) {
                // [Modified] Inject GodTV Adapter
                convertedData.sites.unshift({
                    key: 'godtv',
                    name: '🚀GodTV(免翻)',
                    api: new URL('/api/proxy/godtv_search', context.request.url).toString()
                });

                console.log(`[Sites] Successfully loaded ${convertedData.sites.length} sites from LunaTV-config`);
                return new Response(JSON.stringify(convertedData), { headers: corsHeaders });
            }
        }
    } catch (e) {
        console.error('[Sites] Failed to load LunaTV-config:', e.message);
    }

    // 返回备用静态配置
    // 返回备用静态配置
    console.log('[Sites] Using fallback static config');

    // Inject GodTV into fallback
    const fallbackData = JSON.parse(JSON.stringify(FALLBACK_SITES));
    fallbackData.sites.unshift({
        key: 'godtv',
        name: '🚀GodTV(免翻)',
        api: new URL('/api/proxy/godtv_search', context.request.url).toString()
    });

    return new Response(JSON.stringify(fallbackData), {
        headers: corsHeaders
    });
}
