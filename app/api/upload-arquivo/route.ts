import { NextRequest, NextResponse } from "next/server";

// URL FIXA – CORRIGIDA
const PYTHON_URL = "http://127.0.0.1:8001/api/importar/arquivo";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const user_id = formData.get("user_id") as string;
    const tipo = formData.get("tipo") as string || "financeiro";
    const plano = formData.get("plano") as string || "starter";

    console.log("[Gateway] 📥 Recebido POST:", file?.name, "User:", user_id);

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo" }, { status: 400 });
    }

    if (!user_id) {
      return NextResponse.json({ error: "user_id obrigatório" }, { status: 400 });
    }

    const pythonFormData = new FormData();
    pythonFormData.append("file", file);
    pythonFormData.append("user_id", user_id);
    pythonFormData.append("tipo", tipo);
    pythonFormData.append("plano", plano);

    console.log(`[Gateway] 🔄 Encaminhando para Python: ${PYTHON_URL}`);
    const response = await fetch(PYTHON_URL, {
      method: "POST",
      body: pythonFormData,
    });

    const result = await response.json();
    console.log("[Gateway] ✅ Python respondeu:", result);

    return NextResponse.json(result, { status: response.status });
  } catch (error: any) {
    console.error("[Gateway] 💥 Erro:", error.message);
    return NextResponse.json(
      { error: error.code === "ECONNREFUSED" ? "Motor π indisponível" : "Erro interno" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: "Gateway funcionando. Use POST para upload." });
}