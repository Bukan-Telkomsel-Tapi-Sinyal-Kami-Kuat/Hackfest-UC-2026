# service/test_emotion.py
from emotion import classify_from_face, classify_from_manual, FaceSignal, ManualSignal

def print_result(label, result):
    print(f"\n{'='*55}")
    print(f"  TEST : {label}")
    print(f"{'='*55}")
    print(f"  STATE      : {result.state.upper()}")
    print(f"  CONFIDENCE : {result.confidence}")
    print(f"  DELTA      : {result.recommended_delta:+d}")
    print(f"  SIGNALS    :")
    for s in result.signals_triggered:
        print(f"    → {s}")

# ── Face tests ────────────────────────────────────────────────────────────────

face_tests = [
    ("Overwhelmed — alis turun + cemberut + gaze off lama", FaceSignal(
        brow_lowerer=0.65, mouth_frown=0.55, cheek_squint=0.60,
        eye_openness_left=0.70, eye_openness_right=0.70,
        gaze_on_screen=False, seconds_on_question=35.0,
        disability_mode="tunarungu",
    )),
    ("Confused — alis dalam naik + mata setengah tutup", FaceSignal(
        brow_inner_up=0.55, eye_openness_left=0.35, eye_openness_right=0.30,
        gaze_on_screen=True, seconds_on_question=32.0,
        disability_mode="disleksia",
    )),
    ("Engaged — senyum + mata terbuka + menatap layar", FaceSignal(
        mouth_smile=0.60, eye_openness_left=0.90, eye_openness_right=0.88,
        gaze_on_screen=True, seconds_on_question=12.0,
        disability_mode="disleksia",
    )),
    ("Bored — mata hampir tutup + gaze off + jawab cepat", FaceSignal(
        eye_openness_left=0.28, eye_openness_right=0.30,
        gaze_on_screen=False, seconds_on_question=5.0,
        disability_mode="tunarungu",
    )),
    ("Sinyal lemah — default engaged", FaceSignal(
        brow_lowerer=0.08, mouth_smile=0.12,
        eye_openness_left=0.75, eye_openness_right=0.73,
        gaze_on_screen=True, seconds_on_question=10.0,
        disability_mode="disleksia",
    )),
]

# ── Manual tests ──────────────────────────────────────────────────────────────

manual_tests = [
    ("Tunanetra — aku_bingung",   ManualSignal(button_pressed="aku_bingung")),
    ("Tunanetra — ulangi",        ManualSignal(button_pressed="ulangi")),
    ("Tunanetra — lanjut",        ManualSignal(button_pressed="lanjut")),
    ("Tunanetra — terlalu_mudah", ManualSignal(button_pressed="terlalu_mudah")),
]

# ── Run ───────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("\n" + "█"*55)
    print("  EMOTION CLASSIFIER — LOCAL TEST")
    print("█"*55)

    print("\n── FACE SIGNAL (tunarungu + disleksia) ──")
    for label, signal in face_tests:
        print_result(label, classify_from_face(signal))

    print("\n\n── MANUAL BUTTON (tunanetra) ──")
    for label, signal in manual_tests:
        print_result(label, classify_from_manual(signal))

    print(f"\n\n{'='*55}")
    print("  Done.")
    print(f"{'='*55}\n")