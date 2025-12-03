export async function GET() {
  return Response.json({
    ok: true,
    version: "v23",
    uptime: 12345,
    time: Date.now()
  });
}
