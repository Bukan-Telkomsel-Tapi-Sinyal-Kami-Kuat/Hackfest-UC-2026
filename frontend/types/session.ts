export type OverloadStatus = "STABLE" | "WARNING" | "OVERLOAD";
export type InstructionType = "VERBAL" | "VISUAL_CARD" | "CALMING_MUSIC" | "BREAK";

export const INSTRUCTION_LABELS: Record<InstructionType, string> = {
  VERBAL: "Instruksi Verbal",
  VISUAL_CARD: "Kartu Visual",
  CALMING_MUSIC: "Musik Penenang",
  BREAK: "Jeda",
};

export interface BehavioralLog {
  id: string;
  sessionId: string;
  timestamp: string;
  engagementScore: number;
  gazeDirection: string;
  microExpression?: string;
  overloadStatus: OverloadStatus;
}

export interface ParentPrompt {
  id: string;
  sessionId: string;
  timestamp: string;
  aiMessage: string;
  instructionType: InstructionType;
  parentAcknowledged: boolean;
}

export interface Session {
  id: string;
  childId: string;
  startTime: string;
  endTime?: string;
  averageEngagement?: number;
  moduleSlug?: string;
}
