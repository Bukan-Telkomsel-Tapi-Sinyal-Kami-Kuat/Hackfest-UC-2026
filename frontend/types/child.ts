export type DisabilityType =
  | "AUTISM"
  | "ADHD"
  | "DOWN_SYNDROME"
  | "SENSORY_PROCESSING_DISORDER"
  | "OTHER";

export const DISABILITY_LABELS: Record<DisabilityType, string> = {
  AUTISM: "Autisme",
  ADHD: "ADHD",
  DOWN_SYNDROME: "Down Syndrome",
  SENSORY_PROCESSING_DISORDER: "Gangguan Pemrosesan Sensorik",
  OTHER: "Lainnya",
};

export const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: "AUTISM", label: "Autisme" },
  { value: "ADHD", label: "ADHD" },
  { value: "DOWN_SYNDROME", label: "Down Syndrome" },
  { value: "SENSORY_PROCESSING_DISORDER", label: "Gangguan Pemrosesan Sensorik" },
  { value: "OTHER", label: "Lainnya" },
];

export interface Child {
  id: string;
  name: string;
  birthDate: string;
  disabilityType: DisabilityType;
  parentId: string;
  createdAt: string;
}
