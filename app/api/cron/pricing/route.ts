import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // 🔐 REGRA Z — SERVICE ROLE (backend puro)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 🚀 EXECUTA ENGINE CFO
    const { error } = await supabase.rpc('aplicar_pricing_engine')

    if (error) {
      console.error('[PRICING ENGINE ERROR]', error)

      return NextResponse.json({
        ok: false,
        error: error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      message: 'AI Pricing aplicado com sucesso'
    })

  } catch (err: any) {
    console.error('[CRON ERROR]', err)

    return NextResponse.json({
      ok: false,
      error: 'internal_error'
    }, { status: 500 })
  }
}