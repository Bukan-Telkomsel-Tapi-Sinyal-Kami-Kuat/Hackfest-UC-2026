export type FocusLevel = "high" | "medium" | "low" | "unknown";

export interface BiometricState {
  focusLevel: FocusLevel;
  gazeX: number | null;
  gazeY: number | null;
  eyeOpenness: number | null;
  headPose: {
    pitch: number | null;
    yaw: number | null;
    roll: number | null;
  };
  lastUpdatedAt: number | null;
}

export const DEFAULT_BIOMETRIC_STATE: BiometricState = {
  focusLevel: "unknown",
  gazeX: null,
  gazeY: null,
  eyeOpenness: null,
  headPose: { pitch: null, yaw: null, roll: null },
  lastUpdatedAt: null,
};