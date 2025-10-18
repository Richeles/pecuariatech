import { NextResponse } from 'next/server';

// POST { current_weight: number, days: number, adg?: number, lat?: number, lon?: number }
export async function POST(req: Request){
  try{
    const body = await req.json();
    const current = Number(body.current_weight || 0);
    const days = Number(body.days || 30);
    let adg = body.adg ? Number(body.adg) : 0.6; // default ADG (kg/day)
    const lat = body.lat; const lon = body.lon;

    // if lat/lon provided, call forecast to adjust ADG
    if (lat && lon) {
      try{
        const fRes = await fetch(${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/forecast_clima?lat=&lon=, { headers: { 'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY } });
        if (fRes.ok) {
          const fj = await fRes.json();
          const risk = fj?.summary?.risk || 'ok';
          if (risk === 'heat_stress') { adg = adg * 0.75; } // reduce ADG by 25% under heat stress
        }
      } catch (e) { /* ignore forecast failure */ }
    }

    const predicted = current + (adg * days);
    return NextResponse.json({ ok:true, current, days, adg, predicted });
  } catch(e:any){ return NextResponse.json({ok:false,error:e.message},{status:500}); }
}
