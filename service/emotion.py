# service/emotion.py
from pydantic import BaseModel, Field
from typing import Literal

EmotionState = Literal["overwhelmed", "confused", "engaged", "bored"]

class FaceSignal(BaseModel):
    brow_lowerer:        float = Field(default=0.0, ge=0, le=1)
    brow_inner_up:       float = Field(default=0.0, ge=0, le=1)
    mouth_smile:         float = Field(default=0.0, ge=0, le=1)
    mouth_frown:         float = Field(default=0.0, ge=0, le=1)
    cheek_squint:        float = Field(default=0.0, ge=0, le=1)
    eye_openness_left:   float = Field(default=1.0, ge=0, le=1)
    eye_openness_right:  float = Field(default=1.0, ge=0, le=1)
    gaze_on_screen:      bool  = Field(default=True)
    seconds_on_question: float = Field(default=0.0, ge=0)
    disability_mode:     Literal["tunanetra", "tunarungu", "disleksia"] = "disleksia"

class ManualSignal(BaseModel):
    button_pressed: Literal["aku_bingung", "ulangi", "lanjut", "terlalu_mudah"]

class EmotionResult(BaseModel):
    state:             EmotionState
    confidence:        float
    signals_triggered: list[str]
    recommended_delta: int

EMOTION_DELTA: dict[EmotionState, int] = {
    "overwhelmed": -2,
    "confused":    -1,
    "engaged":      0,
    "bored":       +1,
}

MANUAL_EMOTION_MAP: dict[str, EmotionState] = {
    "aku_bingung":   "confused",
    "ulangi":        "overwhelmed",
    "lanjut":        "engaged",
    "terlalu_mudah": "bored",
}

def classify_from_face(signal: FaceSignal) -> EmotionResult:
    scores: dict[EmotionState, float] = {
        "overwhelmed": 0.0,
        "confused":    0.0,
        "engaged":     0.0,
        "bored":       0.0,
    }
    triggered: list[str] = []

    avg_eye = (signal.eye_openness_left + signal.eye_openness_right) / 2

    # ── OVERWHELMED ───────────────────────────────────────────────────────────
    if signal.brow_lowerer > 0.4 and signal.mouth_frown > 0.3:
        scores["overwhelmed"] += 0.5
        triggered.append(f"brow_lowerer={signal.brow_lowerer:.2f} + mouth_frown={signal.mouth_frown:.2f}")

    if signal.cheek_squint > 0.5 and signal.mouth_frown > 0.2:
        scores["overwhelmed"] += 0.25
        triggered.append(f"cheek_squint={signal.cheek_squint:.2f} (tegang)")

    if not signal.gaze_on_screen and signal.seconds_on_question > 20:
        scores["overwhelmed"] += 0.3
        triggered.append(f"gaze_off + {signal.seconds_on_question:.0f}s on question")

    # ── CONFUSED ──────────────────────────────────────────────────────────────
    if signal.brow_inner_up > 0.35:
        scores["confused"] += 0.45
        triggered.append(f"brow_inner_up={signal.brow_inner_up:.2f} (ekspresi bingung)")

    if avg_eye < 0.4:
        scores["confused"] += 0.3
        triggered.append(f"avg_eye={avg_eye:.2f} (mata setengah tutup)")

    # Stuck hanya dihitung kalau TIDAK ada sinyal positif (tidak senyum)
    if signal.gaze_on_screen and signal.seconds_on_question > 30 and signal.mouth_smile < 0.2:
        scores["confused"] += 0.25
        triggered.append(f"gaze_on + {signal.seconds_on_question:.0f}s (stuck)")

    # ── ENGAGED ───────────────────────────────────────────────────────────────
    if signal.mouth_smile > 0.3 and avg_eye > 0.7 and signal.gaze_on_screen:
        scores["engaged"] += 0.6
        triggered.append(f"smile={signal.mouth_smile:.2f} + eyes_open + gaze_on")
    elif signal.gaze_on_screen and avg_eye > 0.6 and signal.mouth_smile < 0.2:
        # neutral engaged — hanya kalau tidak ada sinyal negatif kuat
        if signal.brow_inner_up < 0.35 and signal.brow_lowerer < 0.4:
            scores["engaged"] += 0.3
            triggered.append("gaze_on + eyes_open (neutral engaged)")

    # ── BORED ─────────────────────────────────────────────────────────────────
    if not signal.gaze_on_screen and signal.seconds_on_question < 8:
        scores["bored"] += 0.4
        triggered.append(f"gaze_off + hanya {signal.seconds_on_question:.0f}s (terlalu mudah)")

    if avg_eye < 0.35 and signal.brow_inner_up < 0.2 and signal.brow_lowerer < 0.2:
        scores["bored"] += 0.35
        triggered.append(f"avg_eye={avg_eye:.2f} (droopy, bukan confused)")

    # ── Pemenang ──────────────────────────────────────────────────────────────
    winner: EmotionState = max(scores, key=lambda k: scores[k])
    confidence = round(min(scores[winner], 1.0), 2)   # ← clamp max 1.0

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

def classify_from_manual(signal: ManualSignal) -> EmotionResult:
    state = MANUAL_EMOTION_MAP[signal.button_pressed]
    return EmotionResult(
        state=state,
        confidence=1.0,
        signals_triggered=[f"manual_button={signal.button_pressed}"],
        recommended_delta=EMOTION_DELTA[state],
    )