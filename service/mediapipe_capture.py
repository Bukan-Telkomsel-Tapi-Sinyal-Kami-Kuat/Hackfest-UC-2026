# service/mediapipe_capture.py
import cv2
import time
import math
import collections
import mediapipe as mp
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
from mediapipe.tasks.python.vision import (
    FaceLandmarkerOptions, FaceLandmarker,
    HandLandmarkerOptions, HandLandmarker,
)

from emotion import FaceSignal, classify_from_face, EmotionResult

MODEL_PATH_FACE = "face_landmarker.task"
MODEL_PATH_HAND = "hand_landmarker.task"

EMOTION_COLOR = {
    "overwhelmed": (0,   0,   255),
    "confused":    (0,   165, 255),
    "engaged":     (0,   200, 0  ),
    "bored":       (200, 200, 0  ),
}

# ── Landmark index MediaPipe Hands ────────────────────────────────────────────
# 0=WRIST, 4=THUMB_TIP, 8=INDEX_TIP, 12=MIDDLE_TIP, 16=RING_TIP, 20=PINKY_TIP
WRIST       = 0
INDEX_TIP   = 8
MIDDLE_TIP  = 12

# ── MediaPipe Face blendshape helper ─────────────────────────────────────────
def get_bs(categories, name: str) -> float:
    for c in categories:
        if c.category_name == name:
            return round(c.score, 3)
    return 0.0

# ── Deteksi posisi tangan relatif terhadap wajah ──────────────────────────────
def analyze_hand_position(
    hand_landmarks_list,
    face_landmarks_list,
    frame_w: int,
    frame_h: int,
) -> dict:
    """
    Return dict sinyal tangan:
    {
        "hand_on_forehead": bool,   # tangan di jidat → confused
        "hand_covers_face": bool,   # tangan nutupin wajah → overwhelmed
        "hand_on_cheek":    bool,   # tangan di pipi → confused ringan
        "hand_detected":    bool,
    }
    """
    result = {
        "hand_on_forehead": False,
        "hand_covers_face": False,
        "hand_on_cheek":    False,
        "hand_detected":    False,
    }

    if not hand_landmarks_list or not face_landmarks_list:
        return result

    result["hand_detected"] = True

    # Ambil landmark wajah untuk estimasi bounding box wajah
    face_lms = face_landmarks_list[0]

    # Titik wajah penting (dalam koordinat normalized 0-1)
    # 10 = dahi atas, 152 = dagu, 234 = pipi kiri, 454 = pipi kanan
    # 33 = sudut mata kiri, 263 = sudut mata kanan
    forehead_y  = face_lms[10].y   # normalized y dahi
    chin_y      = face_lms[152].y  # normalized y dagu
    left_cheek  = face_lms[234].x
    right_cheek = face_lms[454].x
    eye_y       = (face_lms[33].y + face_lms[263].y) / 2   # rata2 y mata

    face_height = abs(chin_y - forehead_y)
    face_width  = abs(right_cheek - left_cheek)

    # Center wajah
    face_cx = (left_cheek + right_cheek) / 2
    face_cy = (forehead_y + chin_y) / 2

    # Cek tiap tangan
    for hand_lms in hand_landmarks_list:
        # Ambil posisi ujung jari tengah dan telunjuk sebagai proxy posisi tangan
        index_tip  = hand_lms[INDEX_TIP]
        middle_tip = hand_lms[MIDDLE_TIP]
        wrist      = hand_lms[WRIST]

        # Rata-rata posisi tangan
        hand_x = (index_tip.x + middle_tip.x) / 2
        hand_y = (index_tip.y + middle_tip.y) / 2

        # Jarak tangan ke center wajah (normalized)
        dist_to_face = math.sqrt(
            (hand_x - face_cx) ** 2 + (hand_y - face_cy) ** 2
        )

        # Threshold: tangan dianggap "di wajah" kalau dalam 0.6x lebar wajah
        face_proximity = face_width * 0.8

        if dist_to_face < face_proximity:
            # Tangan dekat wajah — tentukan zona
            
            # Zona jidat: y < eye_y - 0.3*face_height
            forehead_threshold = eye_y - face_height * 0.25
            if hand_y < forehead_threshold:
                result["hand_on_forehead"] = True

            # Zona menutupi wajah: tangan di tengah wajah secara horizontal
            elif (left_cheek - face_width * 0.3 < hand_x < right_cheek + face_width * 0.3
                  and forehead_y < hand_y < chin_y):
                # Kalau wrist juga di zona wajah = nutupin wajah
                if (left_cheek < wrist.x < right_cheek and
                        forehead_y < wrist.y < chin_y):
                    result["hand_covers_face"] = True
                else:
                    result["hand_on_cheek"] = True

    return result


# ── Gabungkan sinyal wajah + tangan → FaceSignal yang diperkaya ──────────────
def to_face_signal(
    blendshapes,
    face_detected: bool,
    hand_signals: dict,
    seconds_on_question: float,
    disability_mode: str = "disleksia",
) -> tuple[FaceSignal, list[str]]:
    """Return (FaceSignal, extra_hand_triggers)"""

    extra_triggers: list[str] = []

    if not face_detected or blendshapes is None:
        return FaceSignal(
            gaze_on_screen=False,
            seconds_on_question=seconds_on_question,
            disability_mode=disability_mode,
        ), extra_triggers

    first = blendshapes[0]
    if hasattr(first, "categories"):
        bs = first.categories
    elif isinstance(first, list):
        bs = first
    else:
        bs = blendshapes

    blink_left  = get_bs(bs, "eyeBlinkLeft")
    blink_right = get_bs(bs, "eyeBlinkRight")

    signal = FaceSignal(
        brow_lowerer       = max(get_bs(bs, "browLowererLeft"), get_bs(bs, "browLowererRight")),
        brow_inner_up      = get_bs(bs, "browInnerUp"),
        mouth_smile        = max(get_bs(bs, "mouthSmileLeft"), get_bs(bs, "mouthSmileRight")),
        mouth_frown        = max(get_bs(bs, "mouthFrownLeft"), get_bs(bs, "mouthFrownRight")),
        cheek_squint       = max(get_bs(bs, "cheekSquintLeft"), get_bs(bs, "cheekSquintRight")),
        eye_openness_left  = round(1.0 - blink_left, 3),
        eye_openness_right = round(1.0 - blink_right, 3),
        gaze_on_screen     = True,
        seconds_on_question= seconds_on_question,
        disability_mode    = disability_mode,
    )

    # Kumpulkan trigger dari tangan untuk ditambah ke hasil classify
    if hand_signals.get("hand_on_forehead"):
        extra_triggers.append("✋ tangan di jidat (confused +0.5)")
    if hand_signals.get("hand_covers_face"):
        extra_triggers.append("🤦 tangan nutupin wajah (overwhelmed +0.4)")
    if hand_signals.get("hand_on_cheek"):
        extra_triggers.append("🤔 tangan di pipi (confused +0.3)")

    return signal, extra_triggers


# ── Classify dengan hand boost ────────────────────────────────────────────────
def classify_with_hand(signal: FaceSignal, hand_signals: dict) -> EmotionResult:
    from emotion import EMOTION_DELTA

    result = classify_from_face(signal)

    # Boost score berdasarkan posisi tangan
    boost_confused    = 0.0
    boost_overwhelmed = 0.0

    if hand_signals.get("hand_on_forehead"):
        boost_confused += 0.5
    if hand_signals.get("hand_on_cheek"):
        boost_confused += 0.3
    if hand_signals.get("hand_covers_face"):
        boost_overwhelmed += 0.4

    # Terapkan boost — re-evaluate pemenang
    if boost_confused > 0 or boost_overwhelmed > 0:
        # Simulasi score baru
        from emotion import EmotionResult as ER
        scores = {"overwhelmed": 0.0, "confused": 0.0, "engaged": 0.0, "bored": 0.0}

        # Base dari hasil classify sebelumnya
        scores[result.state] = result.confidence

        # Tambah boost tangan
        scores["confused"]    = min(1.0, scores["confused"]    + boost_confused)
        scores["overwhelmed"] = min(1.0, scores["overwhelmed"] + boost_overwhelmed)

        winner = max(scores, key=lambda k: scores[k])
        new_conf = round(min(scores[winner], 1.0), 2)

        new_triggers = result.signals_triggered.copy()
        if hand_signals.get("hand_on_forehead"):
            new_triggers.insert(0, "✋ tangan di jidat → confused +0.5")
        if hand_signals.get("hand_covers_face"):
            new_triggers.insert(0, "🤦 tangan nutupin wajah → overwhelmed +0.4")
        if hand_signals.get("hand_on_cheek"):
            new_triggers.insert(0, "🤔 tangan di pipi → confused +0.3")

        return ER(
            state=winner,
            confidence=new_conf,
            signals_triggered=new_triggers,
            recommended_delta=EMOTION_DELTA[winner],
        )

    return result


# ── Overlay ───────────────────────────────────────────────────────────────────
def draw_overlay(frame, result: EmotionResult, signal: FaceSignal,
                 stable_state: str, hand_signals: dict):
    color        = EMOTION_COLOR.get(result.state, (255, 255, 255))
    stable_color = EMOTION_COLOR.get(stable_state, (255, 255, 255))
    h, w = frame.shape[:2]

    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, 185), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.5, frame, 0.5, 0, frame)

    cv2.putText(frame,
        f"RAW    : {result.state.upper()}  conf={result.confidence}",
        (10, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.65, color, 2)

    cv2.putText(frame,
        f"STABLE : {stable_state.upper()}",
        (10, 62), cv2.FONT_HERSHEY_SIMPLEX, 1.0, stable_color, 2)

    cv2.putText(frame,
        f"delta={result.recommended_delta:+d}  |  {signal.seconds_on_question:.0f}s  |  {signal.disability_mode}",
        (10, 95), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (200, 200, 200), 1)

    # Hand indicator
    hand_text = ""
    if hand_signals.get("hand_on_forehead"):
        hand_text = "HAND: JIDAT"
    elif hand_signals.get("hand_covers_face"):
        hand_text = "HAND: NUTUPIN WAJAH"
    elif hand_signals.get("hand_on_cheek"):
        hand_text = "HAND: PIPI"
    elif hand_signals.get("hand_detected"):
        hand_text = "HAND: detected"

    if hand_text:
        cv2.putText(frame, hand_text,
            (10, 120), cv2.FONT_HERSHEY_SIMPLEX, 0.6,
            (0, 165, 255), 2)

    for i, s in enumerate(result.signals_triggered[:2]):
        cv2.putText(frame, f"> {s}",
            (10, 145 + i * 20),
            cv2.FONT_HERSHEY_SIMPLEX, 0.45, (180, 180, 180), 1)

    avg_eye = (signal.eye_openness_left + signal.eye_openness_right) / 2
    for i, line in enumerate([
        f"smile  : {signal.mouth_smile:.2f}",
        f"frown  : {signal.mouth_frown:.2f}",
        f"brow_lo: {signal.brow_lowerer:.2f}",
        f"brow_up: {signal.brow_inner_up:.2f}",
        f"eye    : {avg_eye:.2f}",
        f"gaze   : {'ON' if signal.gaze_on_screen else 'OFF'}",
        f"hand   : {'YES' if hand_signals.get('hand_detected') else 'no'}",
    ]):
        cv2.putText(frame, line,
            (w - 175, 25 + i * 22),
            cv2.FONT_HERSHEY_SIMPLEX, 0.48, (180, 255, 180), 1)

    return frame


# ── Main ──────────────────────────────────────────────────────────────────────
def run(disability_mode: str = "disleksia", window_size: int = 15):
    face_options = FaceLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=MODEL_PATH_FACE),
        output_face_blendshapes=True,
        output_facial_transformation_matrixes=False,
        num_faces=1,
        running_mode=mp_vision.RunningMode.IMAGE,
    )
    hand_options = HandLandmarkerOptions(
        base_options=mp_python.BaseOptions(model_asset_path=MODEL_PATH_HAND),
        num_hands=2,
        running_mode=mp_vision.RunningMode.IMAGE,
    )

    face_lmk = FaceLandmarker.create_from_options(face_options)
    hand_lmk = HandLandmarker.create_from_options(hand_options)
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("[ERROR] Webcam tidak bisa dibuka.")
        return

    print(f"[INFO] Face + Hand tracking aktif — mode: {disability_mode}")
    print("[INFO] Coba taruh tangan di jidat untuk trigger confused!")
    print("[INFO] Tekan 'q' keluar | '+'/'-' timer | 'r' reset\n")

    state_window = collections.deque(maxlen=window_size)
    seconds_sim  = 0.0
    last_tick    = time.time()
    last_stable  = "engaged"

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            now = time.time()
            seconds_sim += now - last_tick
            last_tick = now

            rgb      = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

            # Detect wajah dan tangan
            face_det = face_lmk.detect(mp_image)
            hand_det = hand_lmk.detect(mp_image)

            face_detected = len(face_det.face_landmarks) > 0
            hand_signals  = analyze_hand_position(
                hand_landmarks_list=hand_det.hand_landmarks if hand_det.hand_landmarks else [],
                face_landmarks_list=face_det.face_landmarks if face_detected else [],
                frame_w=frame.shape[1],
                frame_h=frame.shape[0],
            )

            signal, _ = to_face_signal(
                blendshapes=face_det.face_blendshapes if face_detected else None,
                face_detected=face_detected,
                hand_signals=hand_signals,
                seconds_on_question=seconds_sim,
                disability_mode=disability_mode,
            )

            result = classify_with_hand(signal, hand_signals)

            # Sliding window
            state_window.append(result.state)
            stable_state = max(set(state_window), key=list(state_window).count)

            if stable_state != last_stable:
                print(f"[{seconds_sim:6.1f}s] {last_stable.upper()} → {stable_state.upper()}"
                      f"  conf={result.confidence}  delta={result.recommended_delta:+d}")
                print(f"          {result.signals_triggered}")
                last_stable = stable_state

            frame = draw_overlay(frame, result, signal, stable_state, hand_signals)
            cv2.imshow("Emotion Tracker (Face + Hand) — Q keluar", frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('+'):
                seconds_sim += 5.0
                print(f"[+5s] → {seconds_sim:.1f}s")
            elif key == ord('-'):
                seconds_sim = max(0.0, seconds_sim - 5.0)
                print(f"[-5s] → {seconds_sim:.1f}s")
            elif key == ord('r'):
                seconds_sim = 0.0
                state_window.clear()
                print("[reset]")

    finally:
        cap.release()
        cv2.destroyAllWindows()
        face_lmk.close()
        hand_lmk.close()
        print("\n[INFO] Selesai.")


if __name__ == "__main__":
    import sys
    mode = sys.argv[1] if len(sys.argv) > 1 else "disleksia"
    run(disability_mode=mode)