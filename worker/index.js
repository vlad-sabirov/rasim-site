export default {
  async fetch(request, env) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const data = await request.json();
      const { name, contact, niche, ads, message } = data;

      if (!name || !contact) {
        return new Response(JSON.stringify({ ok: false, error: 'Missing fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const now = new Date();
      const date = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Tashkent' });
      const time = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tashkent' });

      let text = `\u{1F4E9} \u041D\u043E\u0432\u0430\u044F \u0437\u0430\u044F\u0432\u043A\u0430 \u0441 \u0441\u0430\u0439\u0442\u0430\n\n\u{1F4C5} \u0414\u0430\u0442\u0430: ${date} \u0432 ${time}\n\u{1F464} \u0418\u043C\u044F: ${name}\n\u{1F4DE} \u041A\u043E\u043D\u0442\u0430\u043A\u0442: ${contact}`;
      if (niche) text += `\n\u{1F3AF} \u041D\u0438\u0448\u0430: ${niche}`;
      if (ads) text += `\n\u{1F4CA} \u0420\u0435\u043A\u043B\u0430\u043C\u0430 \u0440\u0430\u043D\u0435\u0435: ${ads}`;
      if (message) text += `\n\u{1F4AC} \u0421\u043E\u043E\u0431\u0449\u0435\u043D\u0438\u0435: ${message}`;

      const tgResponse = await fetch(`https://api.telegram.org/bot${env.TG_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: env.TG_CHAT, text }),
      });

      const tgResult = await tgResponse.json();

      return new Response(JSON.stringify({ ok: tgResult.ok }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: 'Server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  },
};
