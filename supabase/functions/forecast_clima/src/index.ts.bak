import { serve } from 'std/server';

serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const lat = url.searchParams.get('lat') || '0';
    const lon = url.searchParams.get('lon') || '0';
    const key = Deno.env.get('OPENWEATHER_API_KEY') || '';
    if (!key) return new Response(JSON.stringify({ok:false,error:'OPENWEATHER_API_KEY not set'}),{status:400});
    const oUrl = https://api.openweathermap.org/data/2.5/onecall?lat=&lon=&units=metric&exclude=minutely,hourly,alerts&appid=;
    const r = await fetch(oUrl);
    const j = await r.json();
    const temp = j.current?.temp ?? (j.daily && j.daily[0]?.temp?.day) ?? null;
    const risk = (temp && temp > 35) ? 'heat_stress' : 'ok';
    return new Response(JSON.stringify({ok:true,summary:{temp,risk},raw:j}),{headers:{'Content-Type':'application/json'}});
  } catch (e) {
    return new Response(JSON.stringify({ok:false,error:String(e)}),{status:500});
  }
});
