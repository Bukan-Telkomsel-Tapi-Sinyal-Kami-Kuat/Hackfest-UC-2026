import type { LearningModule } from "@/types/module";
import { apiFetch } from "./auth";

export async function getAdminModules(): Promise<LearningModule[]> {
  return apiFetch<LearningModule[]>("/admin/modules");
}

export async function createAdminModule(
  data: Omit<LearningModule, "id">
): Promise<LearningModule> {
  return apiFetch<LearningModule>("/admin/modules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAdminModule(
  id: string,
  patch: Partial<Omit<LearningModule, "id">>
): Promise<LearningModule | null> {
  return apiFetch<LearningModule>(`/admin/modules/${id}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  }).catch(() => null);
}

export async function deleteAdminModule(id: string): Promise<void> {
  await apiFetch<void>(`/admin/modules/${id}`, { method: "DELETE" });
}

export interface ModuleStats {
  moduleSlug: string;
  totalSessions: number;
  avgEngagement: number | null;
  lastUsed: string | null;
}

export async function getModuleStats(): Promise<ModuleStats[]> {
  return [];
}
