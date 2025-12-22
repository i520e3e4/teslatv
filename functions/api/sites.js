/**
 * TeslaTV - Cloudflare Pages Function: /api/sites
 * 返回视频源站点列表
 * 
 * 站点来源：LunaTV-config 完整版精选
 * https://github.com/hafrey1/LunaTV-config
 */

// 默认站点配置（来自 LunaTV-config 完整版精选）
const DEFAULT_SITES = {
    "sites": [
        {
            "key": "iqiyizy",
            "name": "爱奇艺资源",
            "api": "https://iqiyizyapi.com/api.php/provide/vod"
        },
        {
            "key": "dbzy",
            "name": "豆瓣资源",
            "api": "https://caiji.dbzy5.com/api.php/provide/vod"
        },
        {
            "key": "tyyszy",
            "name": "天涯影视",
            "api": "https://tyyszy.com/api.php/provide/vod"
        },
        {
            "key": "mtzy",
            "name": "茅台资源",
            "api": "https://caiji.maotaizy.cc/api.php/provide/vod"
        },
        {
            "key": "wolong",
            "name": "卧龙资源",
            "api": "https://wolongzyw.com/api.php/provide/vod"
        },
        {
            "key": "ikun",
            "name": "iKun资源",
            "api": "https://ikunzyapi.com/api.php/provide/vod"
        },
        {
            "key": "dytt",
            "name": "电影天堂",
            "api": "http://caiji.dyttzyapi.com/api.php/provide/vod"
        },
        {
            "key": "maoyan",
            "name": "猫眼资源",
            "api": "https://api.maoyanapi.top/api.php/provide/vod"
        },
        {
            "key": "liangzi",
            "name": "量子资源",
            "api": "https://cj.lzcaiji.com/api.php/provide/vod"
        },
        {
            "key": "360zy",
            "name": "360资源",
            "api": "https://360zyzz.com/api.php/provide/vod"
        },
        {
            "key": "jisu",
            "name": "极速资源",
            "api": "https://jszyapi.com/api.php/provide/vod"
        },
        {
            "key": "modu",
            "name": "魔都资源",
            "api": "https://www.mdzyapi.com/api.php/provide/vod"
        },
        {
            "key": "ffzy",
            "name": "非凡资源",
            "api": "https://api.ffzyapi.com/api.php/provide/vod"
        },
        {
            "key": "bfzy",
            "name": "暴风资源",
            "api": "https://bfzyapi.com/api.php/provide/vod"
        },
        {
            "key": "zuida",
            "name": "最大资源",
            "api": "https://api.zuidapi.com/api.php/provide/vod"
        },
        {
            "key": "wujin",
            "name": "无尽资源",
            "api": "https://api.wujinapi.me/api.php/provide/vod"
        },
        {
            "key": "xinlang",
            "name": "新浪资源",
            "api": "https://api.xinlangapi.com/xinlangapi.php/provide/vod"
        },
        {
            "key": "wangwang",
            "name": "旺旺资源",
            "api": "https://api.wwzy.tv/api.php/provide/vod"
        },
        {
            "key": "subo",
            "name": "速播资源",
            "api": "https://subocaiji.com/api.php/provide/vod"
        },
        {
            "key": "jinying",
            "name": "金鹰点播",
            "api": "https://jinyingzy.com/api.php/provide/vod"
        },
        {
            "key": "piaoling",
            "name": "飘零资源",
            "api": "https://p2100.net/api.php/provide/vod"
        },
        {
            "key": "uku",
            "name": "U酷影视",
            "api": "https://api.ukuapi88.com/api.php/provide/vod"
        },
        {
            "key": "guangsu",
            "name": "光速资源",
            "api": "https://api.guangsuapi.com/api.php/provide/vod"
        },
        {
            "key": "hongniu",
            "name": "红牛资源",
            "api": "https://www.hongniuzy2.com/api.php/provide/vod"
        },
        {
            "key": "modudm",
            "name": "魔都动漫",
            "api": "https://caiji.moduapi.cc/api.php/provide/vod"
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
