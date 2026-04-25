export type ModuleCategory = "bahasa" | "matematika" | "komunikasi" | "motorik";
export type ModuleLevel = "Dasar" | "Menengah" | "Lanjutan";

export interface ModuleStep {
  title: string;
  body: string;
}

export interface LearningModule {
  id: string;
  slug: string;
  title: string;
  category: ModuleCategory;
  level: ModuleLevel;
  duration: string;
  cover: string;
  summary: string;
  objectives: string[];
  steps: ModuleStep[];
}
