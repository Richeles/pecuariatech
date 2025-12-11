export async function GET() {
  try {
    const resp = await fetch(
      "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.shtml",
      { cache: "no-store" }
    );

    const html = await resp.text();
    const lower = html.toLowerCase();

    let clima = "normal";

    if (lower.includes("el niño") || lower.includes("el nino")) {
      clima = "el_nino";
    } else if (lower.includes("la niña") || lower.includes("la nina")) {
      clima = "la_nina";
    }

    return Response.json({ clima });
  } catch (e) {
    return Response.json({ clima: "normal" });
  }
}
