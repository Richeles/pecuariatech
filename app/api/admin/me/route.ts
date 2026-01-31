import { NextResponse } from "next/server"
import { isAdminMaster } from "../_lib/isAdmin"

export async function GET() {
  const isAdmin = await isAdminMaster()
  return NextResponse.json({ is_admin: isAdmin })
}
