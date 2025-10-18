import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat') || '-15.6';
    const lon = searchParams.get('lon') || '-56.1';
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) return NextResponse.json({ok:false,error:'OPENWEATHER_API_KEY not set'},{status:400});
    const u = https://api.openweathermap.org/data/2.5/onecall?lat=&lon=&units=metric&exclude=minutely,hourly,alerts&appid=;
    const r = await fetch(u);
    const j = await r.json();
    return NextResponse.json({ok:true,raw:j});
  } catch (e:any) { return NextResponse.json({ok:false,error:e.message},{status:500}); }
}
