import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  console.log("🧪 [TEST] Recebido POST em /api/test-upload");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const tipo = formData.get("tipo") as string | null;

    console.log("🧪 [TEST] Dados recebidos:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      tipo,
    });

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 }
      );
    }

    // Simula processamento
    return NextResponse.json({
      message: "✅ Teste de integração bem-sucedido!",
      received: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        tipo,
      },
      timestamp: new Date().toISOString(),
      status: "OK",
    });

  } catch (error: any) {
    console.error("🧪 [TEST] Erro:", error);
    return NextResponse.json(
      { error: "Erro no teste", detail: error.message },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    message: "🧪 Endpoint de teste de upload",
    usage: "POST com multipart/form-data contendo 'file' e opcional 'tipo'",
  });
}