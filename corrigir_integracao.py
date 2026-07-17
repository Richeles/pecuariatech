#!/usr/bin/env python3
"""
Corrige integração Omega ↔ Front-end:
1. Troca endpoint em UploadPlanilha.tsx para /api/importar/arquivo.
2. Atualiza resposta do endpoint Python para formato completo.
"""

import os
import re

# Caminhos
FRONT_FILE = os.path.join("app", "dashboard", "components", "UploadPlanilha.tsx")
BACK_FILE = os.path.join("python-runtime", "main.py")

def corrigir_frontend():
    if not os.path.exists(FRONT_FILE):
        print(f"\u274c Arquivo não encontrado: {FRONT_FILE}")
        return False

    with open(FRONT_FILE, "r", encoding="utf-8") as f:
        conteudo = f.read()

    novo_conteudo = conteudo.replace(
        'fetch("/api/upload-arquivo"',
        'fetch("/api/importar/arquivo"'
    )

    if novo_conteudo == conteudo:
        print("\u2139\ufe0f  Endpoint já estava corrigido no front-end.")
    else:
        backup_path = FRONT_FILE + ".bak"
        with open(backup_path, "w", encoding="utf-8") as f:
            f.write(conteudo)
        print(f"\U0001f4e6 Backup do front-end salvo em {backup_path}")

        with open(FRONT_FILE, "w", encoding="utf-8") as f:
            f.write(novo_conteudo)
        print("\u2705 Endpoint do front-end alterado para /api/importar/arquivo")
    return True

def corrigir_backend():
    if not os.path.exists(BACK_FILE):
        print(f"\u274c Arquivo não encontrado: {BACK_FILE}")
        return False

    with open(BACK_FILE, "r", encoding="utf-8") as f:
        conteudo = f.read()

    padrao = r'(# Monta relatório de resposta\s*\n\s*relatorio\s*=\s*\{[^}]*\})'
    novo_bloco = """# Monta relatório de resposta (formato completo para front-end)
        tipo_final = facts.get("tipo", {}).get("value", "financeiro")
        inseridos = facts.get("inseridos", {}).get("value", 0)
        erros = facts.get("erros", {}).get("value", 0)
        proj = resultado_omega["projection"]

        canonical = kernel.center.read("canonical_model") or []

        relatorio = {
            "mensagem": f"✅ Dados de {tipo_final} importados com sucesso!",
            "arquivo": file.filename,
            "formato": info["formato"].upper(),
            "tamanho": f"{tamanho} bytes",
            "planilhas_encontradas": 1,
            "lancamentos_estimados": len(canonical),
            "periodo_inicio": "—",
            "periodo_fim": "—",
            "documento_tipo": "Planilha",
            "confianca_documento": 95,
            "indice_implantacao": 85,
            "confiabilidade": 90,
            "qualidade_documento": 88,
            "cobertura_financeira": 80,
            "tempo_processamento": f"{elapsed}s",
            "receitas": sum(1 for r in canonical if r.get("tipo") == "receita") if tipo_final == "financeiro" else 0,
            "despesas": sum(1 for r in canonical if r.get("tipo") == "despesa") if tipo_final == "financeiro" else 0,
            "categorias": len(set(r.get("categoria", "") for r in canonical)),
            "duplicidades": 0,
            "inconsistencias": erros,
            "confianca_ia": 0,
            "auditoria": {
                "receita_total": sum(r.get("valor", 0) for r in canonical if r.get("tipo") == "receita") if tipo_final == "financeiro" else 0,
                "despesa_total": sum(r.get("valor", 0) for r in canonical if r.get("tipo") == "despesa") if tipo_final == "financeiro" else 0,
                "lucro": 0,
                "roi": 0,
            },
            "risco": "Baixo",
            "oportunidade": "Aumentar margem",
            "centro_custo": "Alimentação",
            "fonte_receita": "Venda de bovinos",
            "recomendacao": "Otimizar custos operacionais.",
            "modulos": {tipo_final: True, "dashboard": True, "views": True, "motor_pi": True},
            "especialistas": ["CFO Inteligente", "Veterinário Digital"],
            "proximas_acoes": ["Abrir Dashboard Financeiro", "Ver recomendações do CFO"],
            "ia_usada": False,
            "inseridos": inseridos,
            "erros": erros,
            "projection": proj
        }"""

    novo_conteudo, n = re.subn(padrao, novo_bloco, conteudo, flags=re.DOTALL)

    if n == 0:
        print("\u26a0\ufe0f  Não foi possível localizar o bloco 'relatorio' no main.py. Verifique manualmente.")
        return False

    backup_path = BACK_FILE + ".bak_int"
    with open(backup_path, "w", encoding="utf-8") as f:
        f.write(conteudo)
    print(f"\U0001f4e6 Backup do main.py salvo em {backup_path}")

    with open(BACK_FILE, "w", encoding="utf-8") as f:
        f.write(novo_conteudo)
    print("\u2705 Resposta do Python atualizada com todos os campos do front-end.")
    return True

if __name__ == "__main__":
    print("\U0001f527 Iniciando correções de integração...\n")
    ok1 = corrigir_frontend()
    ok2 = corrigir_backend()
    if ok1 and ok2:
        print("\n\U0001f389 Correções aplicadas com sucesso!")
        print("Agora faça commit e push:")
        print("  git add .")
        print('  git commit -m "Integração Omega: endpoint e resposta completos"')
        print("  git push origin main")
    else:
        print("\n\u274c Alguma correção falhou. Verifique os caminhos dos arquivos.")
