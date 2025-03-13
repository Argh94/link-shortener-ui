addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
    const url = new URL(request.url);

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };

    if (request.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === '/shorten') {
        const body = await request.json().catch(() => null);
        if (!body || !body.content) {
            return new Response(JSON.stringify({ error: "محتوا خالیه!" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const content = body.content;
        const customName = body.custom || Math.random().toString(36).substring(2, 8);
        const password = body.password || null;
        const maxUses = body.maxUses ? parseInt(body.maxUses) : null;
        const expireDays = body.expireDays ? parseInt(body.expireDays) : null;
        const disposable = body.disposable || false;
        const encryptionKey = body.encryptionKey || null;

        let storedContent = content;
        if (encryptionKey) {
            storedContent = await encrypt(content, encryptionKey);
        }

        const data = {
            content: storedContent,
            password,
            maxUses,
            uses: 0,
            createdAt: Date.now(),
            expireDays,
            disposable,
            encryptionKey
        };

        await SHORTENER_KV.put(customName, JSON.stringify(data));
        const shortUrl = `https://${url.host}/~${customName}`;
        return new Response(JSON.stringify({ url: shortUrl }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }

    if (url.pathname.startsWith('/update/~')) {
        const key = url.pathname.slice(8);
        const body = await request.json().catch(() => null);
        if (!body || !body.content) {
            return new Response(JSON.stringify({ error: "محتوا خالیه!" }), {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders }
            });
        }

        const storedData = await SHORTENER_KV.get(key);
        if (!storedData) return new Response("لینک پیدا نشد!", {
            status: 404,
            headers: { "Content-Type": "text/plain", ...corsHeaders }
        });

        const data = JSON.parse(storedData);
        if (data.password && body.password !== data.password) {
            return new Response("رمز اشتباهه!", {
                status: 403,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        const encryptionKey = body.encryptionKey || data.encryptionKey;
        data.content = encryptionKey ? await encrypt(body.content, encryptionKey) : body.content;
        if (encryptionKey) data.encryptionKey = encryptionKey;

        await SHORTENER_KV.put(key, JSON.stringify(data));
        const updatedData = await SHORTENER_KV.get(key);
        if (!updatedData) {
            return new Response("خطا در ذخیره‌سازی آپدیت!", {
                status: 500,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }
        const parsedUpdatedData = JSON.parse(updatedData);
        const finalContent = parsedUpdatedData.encryptionKey ? await decrypt(parsedUpdatedData.content, parsedUpdatedData.encryptionKey) : parsedUpdatedData.content;

        return new Response(JSON.stringify({
            message: "لینک آپدیت شد!",
            updatedContent: finalContent,
            rawData: parsedUpdatedData.content
        }), {
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }

    if (url.pathname.startsWith('/qr/~')) {
        const key = url.pathname.slice(4).split('?')[0];
        const storedData = await SHORTENER_KV.get(key);
        if (!storedData) return new Response("لینک پیدا نشد!", {
            status: 404,
            headers: { "Content-Type": "text/plain", ...corsHeaders }
        });

        const data = JSON.parse(storedData);
        const params = new URLSearchParams(url.search);
        if (data.password && params.get('pass') !== data.password) {
            return new Response("رمز اشتباهه!", {
                status: 403,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        const qrData = `https://${url.host}/~${key}${data.password ? '?pass=' + encodeURIComponent(data.password) : ''}`;
        return new Response(JSON.stringify({ qrText: qrData, message: "لینک رو توی یه QR Generator بذار!" }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders }
        });
    }

    if (url.pathname.startsWith('/~')) {
        const key = url.pathname.slice(2).split('?')[0];
        const storedData = await SHORTENER_KV.get(key);
        if (!storedData) {
            return new Response("لینک پیدا نشد!", {
                status: 404,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        const data = JSON.parse(storedData);
        const params = new URLSearchParams(url.search);
        const userPassword = params.get('pass');

        if (data.password && (!userPassword || userPassword !== data.password)) {
            return new Response("رمز اشتباهه!", {
                status: 403,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        if (data.maxUses !== null && data.uses >= data.maxUses) {
            return new Response("لینک منقضی شده!", {
                status: 410,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        if (data.expireDays !== null) {
            const expireTime = data.createdAt + (data.expireDays * 24 * 60 * 60 * 1000);
            if (Date.now() > expireTime) {
                return new Response("لینک منقضی شده!", {
                    status: 410,
                    headers: { "Content-Type": "text/plain", ...corsHeaders }
                });
            }
        }

        if (data.disposable && data.uses >= 1) {
            await SHORTENER_KV.delete(key);
            return new Response("لینک منقضی شده!", {
                status: 410,
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }

        let content = data.content;
        if (data.encryptionKey) {
            const userKey = params.get('key');
            if (!userKey) {
                return new Response("کلید رمزنگاری وارد نشده!", {
                    status: 403,
                    headers: { "Content-Type": "text/plain", ...corsHeaders }
                });
            }
            if (userKey !== data.encryptionKey) {
                return new Response("کلید رمزنگاری اشتباهه!", {
                    status: 403,
                    headers: { "Content-Type": "text/plain", ...corsHeaders }
                });
            }
            try {
                content = await decrypt(data.content, data.encryptionKey);
            } catch (e) {
                return new Response("خطا در رمزگشایی: " + e.message, {
                    status: 500,
                    headers: { "Content-Type": "text/plain", ...corsHeaders }
                });
            }
        }

        data.uses += 1;
        if (data.disposable) {
            await SHORTENER_KV.delete(key);
        } else {
            await SHORTENER_KV.put(key, JSON.stringify(data));
        }

        if (params.get('format') === 'base64') {
            return new Response(btoa(unescape(encodeURIComponent(content))), {
                headers: { "Content-Type": "text/plain", ...corsHeaders }
            });
        }
        return new Response(content, {
            headers: { "Content-Type": "text/plain", ...corsHeaders }
        });
    }

    return new Response("به کوتاه‌کننده من خوش اومدی! از /shorten استفاده کن.", {
        headers: { "Content-Type": "text/plain", ...corsHeaders }
    });
}

async function encrypt(text, key) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const keyData = encoder.encode(key.slice(0, 16));
    let encrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        encrypted[i] = data[i] ^ keyData[i % keyData.length];
    }
    return btoa(String.fromCharCode(...encrypted));
}

async function decrypt(encrypted, key) {
    const keyData = new TextEncoder().encode(key.slice(0, 16));
    const data = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
    let decrypted = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        decrypted[i] = data[i] ^ keyData[i % keyData.length];
    }
    return new TextDecoder().decode(decrypted);
}