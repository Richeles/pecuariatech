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
