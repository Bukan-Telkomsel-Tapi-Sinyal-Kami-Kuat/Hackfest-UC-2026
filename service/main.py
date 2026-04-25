# service/emotion.py
from pydantic import BaseModel, Field
from typing import Literal

EmotionState = Literal["overwhelmed", "confused", "engaged", "bored"]

# ── Input dari MediaPipe JS ───────────────────────────────────────────────────

class FaceSignal(BaseModel):
    """
    Dikirim dari frontend setiap ~2 detik.
    Semua nilai adalah rata-rata dari beberapa frame.
    """
    # Blendshapes — nilai 0.0 sampai 1.0
    brow_lowerer:        float = Field(default=0.0, ge=0, le=1)  # alis turun (mengernyit)
    brow_inner_up:       float = Field(default=0.0, ge=0, le=1)  # alis dalam naik (bingung/khawatir)
    mouth_smile:         float = Field(default=0.0, ge=0, le=1)  # senyum
    mouth_frown:         float = Field(default=0.0, ge=0, le=1)  # cemberut
    cheek_squint:        float = Field(default=0.0, ge=0, le=1)  # mata menyipit (fokus/tegang)

    # Eye tracking
    eye_openness_left:   float = Field(default=1.0, ge=0, le=1)  # 0=tutup, 1=terbuka penuh
    eye_openness_right:  float = Field(default=1.0, ge=0, le=1)
    gaze_on_screen:      bool  = Field(default=True)              # apakah menatap layar

    # Konteks sesi (dari app logic, bukan MediaPipe)
    seconds_on_question: float = Field(default=0.0, ge=0)        # berapa lama di soal ini
    disability_mode:     Literal["tunanetra", "tunarungu", "disleksia"] = "disleksia"

class EmotionResult(BaseModel):
    state:             EmotionState
    confidence:        float
    signals_triggered: list[str]
    recommended_delta: int            # -2, -1, 0, +1

# ── Thresholds ────────────────────────────────────────────────────────────────

EMOTION_DELTA: dict[EmotionState, int] = {
    "overwhelmed": -2,
    "confused":    -1,
    "engaged":      0,
    "bored":       +1,
}

def classify_from_face(signal: FaceSignal) -> EmotionResult:
    scores: dict[EmotionState, float] = {
        "overwhelmed": 0.0,
        "confused":    0.0,
        "engaged":     0.0,
        "bored":       0.0,
    }
    triggered: list[str] = []

    # ── Sinyal OVERWHELMED ────────────────────────────────────────────────────
    # Alis turun + cemberut + mata menyipit bersamaan = frustrasi/kewalahan
    if signal.brow_lowerer > 0.4 and signal.mouth_frown > 0.3:
        scores["overwhelmed"] += 0.5
        triggered.append(f"brow_lowerer={signal.brow_lowerer:.2f} + mouth_frown={signal.mouth_frown:.2f}")

    if signal.cheek_squint > 0.5 and signal.mouth_frown > 0.2:
        scores["overwhelmed"] += 0.25
        triggered.append(f"cheek_squint={signal.cheek_squint:.2f} (tegang)")

    # Mata tidak di layar lama = menyerah
    if not signal.gaze_on_screen and signal.seconds_on_question > 20:
        scores["overwhelmed"] += 0.3
        triggered.append(f"gaze_off_screen + {signal.seconds_on_question:.0f}s on question")

    # ── Sinyal CONFUSED ───────────────────────────────────────────────────────
    # Alis dalam naik = ekspresi "hah?" klasik
    if signal.brow_inner_up > 0.35:
        scores["confused"] += 0.45
        triggered.append(f"brow_inner_up={signal.brow_inner_up:.2f} (ekspresi bingung)")

    # Sering kedip / mata setengah tertutup = processing berat
    avg_eye = (signal.eye_openness_left + signal.eye_openness_right) / 2
    if avg_eye < 0.4:
        scores["confused"] += 0.3
        triggered.append(f"avg_eye_openness={avg_eye:.2f} (mata setengah tutup)")

    # Lama di soal tapi masih menatap layar = berusaha tapi tidak bisa
    if signal.gaze_on_screen and signal.seconds_on_question > 30:
        scores["confused"] += 0.25
        triggered.append(f"gaze_on + {signal.seconds_on_question:.0f}s (stuck)")

    # ── Sinyal ENGAGED ────────────────────────────────────────────────────────
    # Senyum + mata terbuka + menatap layar = ideal
    if signal.mouth_smile > 0.3 and avg_eye > 0.7 and signal.gaze_on_screen:
        scores["engaged"] += 0.6
        triggered.append(f"smile={signal.mouth_smile:.2f} + eyes_open + gaze_on")
    elif signal.gaze_on_screen and avg_eye > 0.6:
        scores["engaged"] += 0.3
        triggered.append("gaze_on + eyes_open (neutral engaged)")

    # ── Sinyal BORED ─────────────────────────────────────────────────────────
    # Tidak menatap layar + jawab cepat = tidak tertarik
    if not signal.gaze_on_screen and signal.seconds_on_question < 8:
        scores["bored"] += 0.4
        triggered.append(f"gaze_off + hanya {signal.seconds_on_question:.0f}s (terlalu mudah)")

    # Mata hampir tertutup tapi tidak ada tanda bingung = mengantuk/bosan
    if avg_eye < 0.35 and signal.brow_inner_up < 0.2 and signal.brow_lowerer < 0.2:
        scores["bored"] += 0.35
        triggered.append(f"avg_eye={avg_eye:.2f} (droopy, bukan confused)")

    # ── Tentukan pemenang ─────────────────────────────────────────────────────
    winner: EmotionState = max(scores, key=lambda k: scores[k])
    confidence = round(scores[winner], 2)

    if confidence < 0.15:
        winner = "engaged"
        confidence = 0.5
        triggered.append("default: sinyal lemah → engaged")

    return EmotionResult(
        state=winner,
        confidence=confidence,
        signals_triggered=triggered,
        recommended_delta=EMOTION_DELTA[winner],
    )


# ── Fallback untuk tunanetra (manual input) ───────────────────────────────────

class ManualSignal(BaseModel):
    """Dipakai kalau webcam tidak tersedia (mode tunanetra)."""
    button_pressed: Literal["aku_bingung", "ulangi", "lanjut", "terlalu_mudah"]

MANUAL_EMOTION_MAP: dict[str, EmotionState] = {
    "aku_bingung":   "confused",
    "ulangi":        "overwhelmed",
    "lanjut":        "engaged",
    "terlalu_mudah": "bored",
}

def classify_from_manual(signal: ManualSignal) -> EmotionResult:
    state = MANUAL_EMOTION_MAP[signal.button_pressed]
    return EmotionResult(
        state=state,
        confidence=1.0,   # manual = certainty penuh
        signals_triggered=[f"manual_button={signal.button_pressed}"],
        recommended_delta=EMOTION_DELTA[state],
    )