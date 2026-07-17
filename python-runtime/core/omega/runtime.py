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
