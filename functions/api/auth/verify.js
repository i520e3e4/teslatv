/**
 * TeslaTV - Cloudflare Pages Function: /api/auth/verify
 * 验证密码
 */

export async function onRequest(context) {
    const { env } = context;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (context.request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    if (context.request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: corsHeaders
        });
    }

    try {
        const body = await context.request.json();
        const { password, passwordHash } = body;

        // 获取配置的密码列表
        const accessPasswordRaw = env.ACCESS_PASSWORD || '';
        const passwords = accessPasswordRaw ? accessPasswordRaw.split(',').map(p => p.trim()).filter(p => p) : [];

        if (passwords.length === 0) {
            // 没有配置密码，直接通过
            return new Response(JSON.stringify({ success: true }), {
                headers: corsHeaders
            });
        }

        // 使用 SubtleCrypto 计算 SHA-256 哈希
        const hashPassword = async (pwd) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(pwd);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        };

        // 如果提供了明文密码
        if (password) {
            const inputHash = await hashPassword(password);
            const validPasswords = await Promise.all(passwords.map(p => hashPassword(p)));

            if (validPasswords.includes(inputHash)) {
                return new Response(JSON.stringify({
                    success: true,
                    passwordHash: inputHash
                }), {
                    headers: corsHeaders
                });
            }
        }

        // 如果提供了密码哈希（用于验证已保存的登录状态）
        if (passwordHash) {
            const validHashes = await Promise.all(passwords.map(p => hashPassword(p)));

            if (validHashes.includes(passwordHash)) {
                return new Response(JSON.stringify({ success: true }), {
                    headers: corsHeaders
                });
            }
        }

        return new Response(JSON.stringify({ success: false }), {
            headers: corsHeaders
        });

    } catch (e) {
        console.error('Auth verify error:', e);
        return new Response(JSON.stringify({ error: 'Invalid request' }), {
            status: 400,
            headers: corsHeaders
        });
    }
}
