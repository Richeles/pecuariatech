#!/usr/bin/env python3
"""
Script gerador da Camada Ω completa + integração automática no main.py existente.
(Versão corrigida conforme orientações – 2026-07-16)
Executar na raiz do projeto (onde está a pasta python-runtime).
"""

import os
import shutil
import re

BASE_DIR = "python-runtime"
CORE_DIR = os.path.join(BASE_DIR, "core", "omega")
MOTORS_DIR = os.path.join(CORE_DIR, "motors")

# Conteúdo de todos os arquivos (com as correções aplicadas)
files_content = {
    # Inicializadores
    os.path.join(BASE_DIR, "core", "__init__.py"): "",
    os.path.join(CORE_DIR, "__init__.py"): "",
    os.path.join(MOTORS_DIR, "__init__.py"): "",

    # fact.py (inalterado)
    os.path.join(CORE_DIR, "fact.py"): '''\
import time
import uuid
from typing import Any, List, Dict

class Fact:
    def __init__(self, key: str, value: Any, level: str = "operacional",
                 confidence: float = 1.0, source: str = "unknown",
                 evidence: List[Dict] = None, dependencies: List[str] = None,
                 ttl: float = None):
        self.id = uuid.uuid4().hex[:8]
        self.key = key
        self.value = value
        self.level = level
        self.confidence = confidence
        self.source = source
        self.evidence = evidence or []
        self.dependencies = dependencies or []
        self.timestamp = time.time()
        self.ttl = ttl
        self.version = 1

    def to_dict(self):
        return {
            "id": self.id,
            "key": self.key,
            "value": self.value,
            "level": self.level,
            "confidence": self.confidence,
            "source": self.source,
            "evidence": self.evidence,
            "dependencies": self.dependencies,
            "timestamp": self.timestamp,
            "ttl": self.ttl,
            "version": self.version
        }
''',

    # center.py (inalterado)
    os.path.join(CORE_DIR, "center.py"): '''\
import hashlib
import json
from collections import defaultdict, deque
from typing import Any, Dict, List, Optional
from .fact import Fact
from .resolver import ConflictResolver

class OmegaCenter:
    def __init__(self):
        self._facts: Dict[str, Fact] = {}
        self._history: List[Fact] = []
        self._observers: Dict[str, List[str]] = defaultdict(list)
        self._motors: Dict[str, Any] = {}
        self.resolver = ConflictResolver()
        self.changed_queue = deque()

    def register_motor(self, name: str, motor):
        self._motors[name] = motor
        for key in motor.observes:
            self._observers[key].append(name)

    def publish(self, key, value, level="operacional", confidence=1.0,
                source="unknown", evidence=None, dependencies=None, ttl=None):
        new_fact = Fact(key, value, level, confidence, source, evidence, dependencies, ttl)
        existing = self._facts.get(key)
        if existing:
            new_fact = self.resolver.resolve(existing, new_fact)
            if existing.value == new_fact.value and abs(existing.confidence - new_fact.confidence) < 0.0001:
                return existing
        self._facts[key] = new_fact
        self._history.append(new_fact)
        self.changed_queue.append(key)
        return new_fact

    def read(self, key, default=None):
        fact = self._facts.get(key)
        return fact.value if fact else default

    def read_fact(self, key):
        return self._facts.get(key)

    def pop_changed_key(self):
        if self.changed_queue:
            return self.changed_queue.popleft()
        return None

    def has_pending_changes(self):
        return len(self.changed_queue) > 0

    def get_observers_for_key(self, key):
        return self._observers.get(key, [])

    def get_motor(self, name):
        return self._motors.get(name)

    def snapshot(self):
        return {k: f.to_dict() for k, f in self._facts.items()}

    def state_signature(self):
        sig = {}
        for key, fact in self._facts.items():
            raw = json.dumps(fact.value, sort_keys=True, default=str)
            sig[key] = (hashlib.sha256(raw.encode()).hexdigest(), round(fact.confidence, 6))
        return sig
''',

    # resolver.py (inalterado)
    os.path.join(CORE_DIR, "resolver.py"): '''\
class ConflictResolver:
    def resolve(self, existing, new):
        if new.confidence > existing.confidence:
            new.version = existing.version + 1
            new.evidence = existing.evidence + new.evidence
            new.dependencies = list(set(existing.dependencies + new.dependencies))
            return new
        if existing.value == new.value and abs(existing.confidence - new.confidence) < 0.0001:
            return existing
        existing.version += 1
        existing.evidence += new.evidence
        existing.dependencies = list(set(existing.dependencies + new.dependencies))
        return existing
''',

    # kernel.py (inalterado)
    os.path.join(CORE_DIR, "kernel.py"): '''\
import logging
from .center import OmegaCenter
from .runtime import OmegaRuntime
from .projection import ProjectionEngine

logger = logging.getLogger(__name__)

class OmegaKernel:
    def __init__(self):
        self.center = OmegaCenter()
        self.runtime = OmegaRuntime(self.center)
        self.projection = ProjectionEngine(self.center)

    def boot(self):
        self.runtime.register_default_motors()
        logger.info("Kernel Ω iniciado com Centro Cognitivo e Runtime orientado a eventos.")

    def processar(self, user_id: str, conteudo: bytes, formato: str, filename: str = "", **kwargs):
        self.center.publish("user_id", user_id, source="kernel")
        self.center.publish("conteudo", conteudo, source="kernel")
        self.center.publish("formato", formato, source="kernel")
        self.center.publish("filename", filename, source="kernel")
        self.center.publish("dados_brutos", kwargs.get("dados_brutos"), source="kernel")
        self.center.publish("tipo_fornecido", kwargs.get("tipo", "auto"), source="kernel")

        self.runtime.run()

        confidence = self.center.read("validation.score", 0.0)
        if confidence >= 0.95:
            self.center.publish("kernel.converged", True, level="executivo", confidence=1.0, source="kernel")
        else:
            self.center.publish("kernel.feedback", {"reprocess": True, "confidence": confidence},
                                level="tatico", confidence=1.0, source="kernel")

        projection_result = self.projection.execute()
        return {
            "projection": projection_result,
            "facts": self.center.snapshot(),
            "signature": self.center.state_signature(),
        }
''',

    # runtime.py (com novos motores registrados)
    os.path.join(CORE_DIR, "runtime.py"): '''\
import logging
from .center import OmegaCenter
from .motors.recognition import RecognitionMotor
from .motors.semantic import SemanticMotor
from .motors.statistical import StatisticalMotor
from .motors.layout import LayoutMotor
from .motors.fingerprint import FingerprintMotor
from .motors.type_inference import TypeInferenceMotor   # NOVO
from .motors.normalizer import NormalizerMotor           # NOVO
from .motors.validator import ValidatorMotor
from .motors.persistence import PersistenceMotor
from .motors.learning import LearningMotor

logger = logging.getLogger(__name__)

class OmegaRuntime:
    def __init__(self, center: OmegaCenter):
        self.center = center
        self.worklist = []

    def register_default_motors(self):
        motors = [
            ("recognition", RecognitionMotor()),
            ("semantic", SemanticMotor()),
            ("statistical", StatisticalMotor()),
            ("fingerprint", FingerprintMotor()),
            ("layout", LayoutMotor()),
            ("type_inference", TypeInferenceMotor()),   # NOVO
            ("normalizer", NormalizerMotor()),          # NOVO
            ("validator", ValidatorMotor()),
            ("persistence", PersistenceMotor()),
            ("learning", LearningMotor()),
        ]
        for name, motor in motors:
            self.center.register_motor(name, motor)
        self.worklist = [name for name, _ in motors]

    def run(self):
        iteration = 0
        MAX_ITERATIONS = 100
        while self.worklist and iteration < MAX_ITERATIONS:
            motor_name = self.worklist.pop(0)
            motor = self.center.get_motor(motor_name)
            if motor is None:
                continue
            before = self.center.state_signature()
            try:
                motor.execute(self.center)
            except Exception:
                logger.exception("Erro executando %s", motor_name)
            after = self.center.state_signature()
            if before == after:
                iteration += 1
                continue
            while self.center.has_pending_changes():
                key = self.center.pop_changed_key()
                if key is None:
                    break
                observers = self.center.get_observers_for_key(key)
                for observer in observers:
                    if observer not in self.worklist:
                        self.worklist.append(observer)
            iteration += 1
        if iteration >= MAX_ITERATIONS:
            logger.warning("Runtime interrompido por limite de iterações.")
''',

    # projection.py (inalterado)
    os.path.join(CORE_DIR, "projection.py"): '''\
class ProjectionEngine:
    def __init__(self, center):
        self.center = center

    def execute(self):
        facts = self.center.snapshot()
        return {
            "tipo": facts.get("tipo", {}).get("value", "financeiro"),
            "inseridos": facts.get("inseridos", {}).get("value", 0),
            "erros": facts.get("erros", {}).get("value", 0),
            "confianca": facts.get("validation.score", {}).get("value", 0),
            "fingerprint": facts.get("fingerprint", {}).get("value", ""),
            "persistence_status": facts.get("persistence.status", {}).get("value", "pending"),
        }
''',

    # Motores originais (recognition, semantic, statistical, fingerprint, layout, learning – sem alterações)
    os.path.join(MOTORS_DIR, "recognition.py"): '''\
class RecognitionMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados or not isinstance(dados, list):
            return
        formato = center.read("formato", "unknown")
        filename = center.read("filename", "")
        doc_type = "spreadsheet" if formato == "excel" else "unknown"
        origin = "unknown"
        if dados and isinstance(dados, list) and dados:
            sample = str(dados[0]).lower()
            if "sicredi" in sample or "sicredi" in filename.lower():
                origin = "Sicredi"
            elif "banco do brasil" in sample:
                origin = "Banco do Brasil"
        if center.read("recognition.document_type") != doc_type:
            center.publish("recognition.document_type", doc_type, confidence=0.90, source="recognition")
        if center.read("recognition.origin") != origin:
            center.publish("recognition.origin", origin, confidence=0.85, source="recognition")
''',

    os.path.join(MOTORS_DIR, "semantic.py"): '''\
class SemanticMotor:
    observes = ["recognition.document_type"]
    def execute(self, center):
        entities = ["RECEITA", "DESPESA"]
        if center.read("semantic.entities") != entities:
            center.publish("semantic.entities", entities, confidence=0.90, source="semantic")
''',

    os.path.join(MOTORS_DIR, "statistical.py"): '''\
import pandas as pd

class StatisticalMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados or not isinstance(dados, list):
            return
        df = pd.DataFrame(dados)
        stats = {}
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                stats[col] = {"mean": df[col].mean(), "std": df[col].std()}
        if center.read("statistics.profile") != stats:
            center.publish("statistics.profile", stats, confidence=0.95, source="statistical")
''',

    os.path.join(MOTORS_DIR, "fingerprint.py"): '''\
import hashlib
import json

class FingerprintMotor:
    observes = ["dados_brutos"]
    def execute(self, center):
        dados = center.read("dados_brutos")
        if not dados:
            return
        structure = {
            "formato": center.read("formato"),
            "colunas": list(dados[0].keys()) if dados else [],
            "row_count": len(dados)
        }
        raw = json.dumps(structure, sort_keys=True, default=str)
        fp = hashlib.sha256(raw.encode()).hexdigest()[:12]
        if center.read("fingerprint") != fp:
            center.publish("fingerprint", fp, confidence=1.0, source="fingerprint")
''',

    os.path.join(MOTORS_DIR, "layout.py"): '''\
class LayoutMotor:
    observes = ["fingerprint"]
    def execute(self, center):
        fp = center.read("fingerprint", "")
        origin = center.read("recognition.origin", "unknown")
        layout_id = f"{origin}_{fp[:8]}" if fp else "unknown"
        if center.read("layout.id") != layout_id:
            center.publish("layout.id", layout_id, confidence=0.90, source="layout")
''',

    os.path.join(MOTORS_DIR, "learning.py"): '''\
class LearningMotor:
    observes = ["fingerprint"]
    def execute(self, center):
        fp = center.read("fingerprint")
        origin = center.read("recognition.origin")
        if not fp:
            return
        learning_event = {"fingerprint": fp, "origin": origin}
        if center.read("learning.last") != learning_event:
            center.publish("learning.last", learning_event, level="tatico", confidence=0.95, source="learning")
''',

    # ===== NOVOS MOTORES (CORRIGIDOS) =====

    # type_inference.py (sem alterações)
    os.path.join(MOTORS_DIR, "type_inference.py"): '''\
class TypeInferenceMotor:
    observes = ["dados_brutos", "formato", "tipo_fornecido"]

    def execute(self, center):
        tipo_fornecido = center.read("tipo_fornecido", "auto")
        if tipo_fornecido != "auto":
            if center.read("tipo") != tipo_fornecido:
                center.publish("tipo", tipo_fornecido, confidence=1.0, source="type_inference")
            return

        dados = center.read("dados_brutos")
        formato = center.read("formato", "csv")
        if not dados:
            return

        tipo = self._inferir(dados, formato)
        if center.read("tipo") != tipo:
            center.publish("tipo", tipo, confidence=0.98, source="type_inference")

    def _inferir(self, dados_brutos, formato: str) -> str:
        cabecalho = []
        if formato == "csv":
            if isinstance(dados_brutos, dict) and dados_brutos.get("linhas"):
                linhas = dados_brutos["linhas"]
                separador = dados_brutos.get("separador", ",")
                cabecalho = [c.strip().lower() for c in linhas[0].split(separador)]
        elif formato == "excel":
            if isinstance(dados_brutos, list) and dados_brutos:
                cabecalho = [c.lower() for c in dados_brutos[0].keys()]
        else:
            return "financeiro"

        colunas = set(cabecalho)
        if {"brinco", "lote", "sexo", "raca", "peso_entrada"}.issubset(colunas):
            return "rebanho"
        if {"piquete", "area_ha", "lotacao_ua", "forragem"}.issubset(colunas):
            return "pastagem"
        if {"lote", "peso_inicial", "peso_atual", "gmd"}.issubset(colunas):
            return "engorda"
        return "financeiro"
''',

    # normalizer.py (CORRIGIDO – delega ao UniversalImporter)
    os.path.join(MOTORS_DIR, "normalizer.py"): '''\
import logging

logger = logging.getLogger(__name__)

class NormalizerMotor:
    observes = ["dados_brutos", "tipo", "formato"]

    def execute(self, center):
        dados = center.read("dados_brutos")
        tipo = center.read("tipo", "financeiro")
        formato = center.read("formato", "csv")
        if not dados:
            return

        canonical = self._normalizar(dados, formato, tipo)
        if canonical is not None:
            center.publish("canonical_model", canonical, confidence=0.95, source="normalizer")

    def _normalizar(self, dados_brutos, formato, tipo):
        # Usa os normalizadores reais do UniversalImporter (import local para evitar circular)
        from main import UniversalImporter

        if tipo == "pastagem":
            return UniversalImporter.normalizar_pastagem(dados_brutos, formato)
        elif tipo == "rebanho":
            return UniversalImporter.normalizar_rebanho(dados_brutos, formato)
        elif tipo == "engorda":
            return UniversalImporter.normalizar_engorda(dados_brutos, formato)
        else:
            return UniversalImporter.normalizar_financeiro(dados_brutos, formato)
''',

    # validator.py (CORRIGIDO – generalizado para todos os módulos)
    os.path.join(MOTORS_DIR, "validator.py"): '''\
class ValidatorMotor:
    observes = ["canonical_model"]

    def execute(self, center):
        canonical = center.read("canonical_model")
        if not canonical:
            if center.read("validation.score") != 0.0:
                center.publish("validation.score", 0.0, confidence=1.0, source="validator")
            return

        errors = []
        for idx, rec in enumerate(canonical):
            # Identificador pode ser 'descricao', 'piquete', 'brinco' ou 'lote'
            identificador = rec.get("descricao") or rec.get("piquete") or rec.get("brinco") or rec.get("lote")
            if not identificador:
                errors.append(f"Linha {idx+1}: identificador ausente")
                continue
            # Valor principal (pode ser 'valor', 'area_ha', 'peso_entrada', etc.)
            valor_principal = rec.get("valor") or rec.get("area_ha") or rec.get("peso_entrada") or rec.get("peso_inicial")
            if valor_principal is not None and valor_principal <= 0:
                errors.append(f"Linha {idx+1}: valor inválido ({valor_principal})")
                continue

        score = 1.0 - len(errors) / max(len(canonical), 1)

        old_score = center.read("validation.score")
        if old_score != score:
            center.publish("validation.score", score, confidence=0.95, source="validator")

        old_errors = center.read("validation.errors")
        if old_errors != errors:
            center.publish("validation.errors", errors, confidence=1.0, source="validator")
''',

    # persistence.py (já real, mantido)
    os.path.join(MOTORS_DIR, "persistence.py"): '''\
import logging
from datetime import datetime
from supabase_client import supabase  # ajuste o import conforme seu projeto

logger = logging.getLogger(__name__)

class PersistenceMotor:
    observes = ["canonical_model", "tipo", "user_id"]

    def execute(self, center):
        canonical = center.read("canonical_model")
        tipo = center.read("tipo", "financeiro")
        user_id = center.read("user_id")

        if not canonical or not user_id:
            return
        if center.read("persistence.status") == "done":
            return

        table_map = {
            "financeiro": "movimentacoes",
            "rebanho": "animais",
            "pastagem": "pastagens",
            "engorda": "lotes_engorda",
        }
        table = table_map.get(tipo, "movimentacoes")

        inseridos = 0
        erros = 0
        for registro in canonical:
            try:
                payload = {"user_id": user_id, **registro, "criado_em": datetime.now().isoformat()}
                supabase.table(table).insert(payload).execute()
                inseridos += 1
            except Exception as e:
                logger.exception(f"Erro ao inserir em {table}: {e}")
                erros += 1

        center.publish("inseridos", inseridos, confidence=1.0, source="persistence")
        center.publish("erros", erros, confidence=1.0, source="persistence")
        center.publish("persistence.status", "done", confidence=1.0, source="persistence")
''',
}

def criar_estrutura():
    print("📁 Criando estrutura da Camada Ω...")
    for filepath, content in files_content.items():
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"   ✔ {filepath}")

def integrar_main():
    main_path = os.path.join(BASE_DIR, "main.py")
    if not os.path.exists(main_path):
        print("⚠️  main.py não encontrado em python-runtime/. Nenhuma integração automática realizada.")
        print("   Adicione manualmente o trecho do OmegaKernel ao endpoint /api/importar/arquivo.")
        return

    with open(main_path, "r", encoding="utf-8") as f:
        conteudo = f.read()

    if "OmegaKernel" in conteudo:
        print("ℹ️  OmegaKernel já está presente no main.py. Nenhuma alteração necessária.")
        return

    backup_path = main_path + ".bak_omega"
    shutil.copy2(main_path, backup_path)
    print(f"📦 Backup do main.py original salvo em {backup_path}")

    import_line = "from core.omega.kernel import OmegaKernel\n"
    if import_line not in conteudo:
        linhas = conteudo.split('\n')
        ultimo_import = 0
        for i, linha in enumerate(linhas):
            if linha.startswith('import ') or linha.startswith('from '):
                ultimo_import = i
        linhas.insert(ultimo_import + 1, import_line)
        conteudo = '\n'.join(linhas)

    # Localiza o endpoint antigo
    padrao_inicio = r'@app\.post\("/api/importar/arquivo"\)'
    match = re.search(padrao_inicio, conteudo)
    if not match:
        print("⚠️  Não foi possível localizar o endpoint /api/importar/arquivo. Ajuste manual necessário.")
        return

    inicio_endpoint = match.start()
    resto = conteudo[inicio_endpoint:]
    fim_relativo = len(resto)
    for outro_match in re.finditer(r'@app\.(get|post|put|delete)\(', resto[1:], re.DOTALL):
        fim_relativo = outro_match.start() + 1
        break
    fim_endpoint = inicio_endpoint + fim_relativo

    novo_endpoint = '''\
@app.post("/api/importar/arquivo")
async def importar_arquivo(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    tipo: str = Form("auto"),
    plano: str = Form("starter")
):
    request_id = uuid.uuid4().hex[:8]
    start_time = time.time()

    logger.info("=" * 60)
    logger.info(f"[{request_id}] 🚀 INÍCIO – Importador Universal com Ω")
    logger.info(f"[{request_id}] 📁 Arquivo: {file.filename}")
    logger.info(f"[{request_id}] 👤 User: {user_id}")
    logger.info(f"[{request_id}] 🏷️ Tipo recebido: {tipo}")
    logger.info("=" * 60)

    try:
        conteudo = await file.read()
        tamanho = len(conteudo)
        if tamanho == 0:
            return JSONResponse({"error": "Arquivo vazio", "request_id": request_id}, status_code=400)
        if tamanho > UniversalImporter.MAX_FILE_SIZE:
            return JSONResponse({"error": "Arquivo excede limite de 50MB", "request_id": request_id}, status_code=413)

        info = UniversalImporter.detectar(file.filename, conteudo)
        if info["formato"] == "unknown" or not info.get("valido"):
            return JSONResponse({"error": f"Formato não reconhecido", "request_id": request_id}, status_code=400)

        engine = info.get("engine")
        dados_brutos = UniversalImporter.ler(conteudo, info["formato"], engine=engine)
        if not dados_brutos:
            return JSONResponse({"error": "Nenhum dado encontrado.", "request_id": request_id}, status_code=400)

        # ========== CAMADA Ω ==========
        kernel = OmegaKernel()
        kernel.boot()
        resultado_omega = kernel.processar(
            user_id=user_id,
            conteudo=conteudo,
            formato=info["formato"],
            filename=file.filename,
            dados_brutos=dados_brutos,
            tipo=tipo  # "auto" aciona inferência automática
        )

        facts = resultado_omega["facts"]
        tipo_final = facts.get("tipo", {}).get("value", "financeiro")
        inseridos = facts.get("inseridos", {}).get("value", 0)
        erros = facts.get("erros", {}).get("value", 0)
        proj = resultado_omega["projection"]

        # Monta relatório de resposta
        relatorio = {
            "mensagem": f"✅ Dados de {tipo_final} importados com sucesso!",
            "arquivo": file.filename,
            "tipo_detectado": tipo_final,
            "inseridos": inseridos,
            "erros": erros,
            "modulos": {tipo_final: True, "dashboard": True, "views": True},
            "projection": proj
        }

        elapsed = round(time.time() - start_time, 2)
        logger.info(f"[{request_id}] ✅ Processamento Ω concluído em {elapsed}s")
        return JSONResponse(relatorio)

    except Exception as e:
        logger.exception(f"[{request_id}] 💥 ERRO: {e}")
        return JSONResponse({"error": "Falha interna no processamento", "request_id": request_id}, status_code=500)
'''

    novo_conteudo = conteudo[:inicio_endpoint] + novo_endpoint + conteudo[fim_endpoint:]
    with open(main_path, "w", encoding="utf-8") as f:
        f.write(novo_conteudo)
    print("🔌 Endpoint /api/importar/arquivo integrado ao OmegaKernel com sucesso!")

if __name__ == "__main__":
    criar_estrutura()
    integrar_main()
    print("\n✅ Camada Ω completa e corrigida instalada com sucesso!")
    print("   - Inferência de tipo automática")
    print("   - Normalização delegada ao UniversalImporter")
    print("   - Validação genérica para todos os módulos")
    print("   - Persistência real no Supabase")
    print("   Pronto para testar o upload automático e ver o dashboard atualizar!\n")