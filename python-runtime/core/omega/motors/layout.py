class LayoutMotor:
    observes = ["fingerprint"]
    def execute(self, center):
        fp = center.read("fingerprint", "")
        origin = center.read("recognition.origin", "unknown")
        layout_id = f"{origin}_{fp[:8]}" if fp else "unknown"
        if center.read("layout.id") != layout_id:
            center.publish("layout.id", layout_id, confidence=0.90, source="layout")
