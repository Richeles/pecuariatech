import {
  NextResponse,
} from "next/server";

import {
  getFinanceiroSnapshot,
} from "@/app/services/financeiro/getFinanceiroSnapshot";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

/* =====================================================
   GET
===================================================== */

export async function GET() {

  const response =
    await getFinanceiroSnapshot();

  return NextResponse.json(
    response
  );
}