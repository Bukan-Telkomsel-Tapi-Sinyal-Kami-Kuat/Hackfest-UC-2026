import type { LearningModule, ModuleCategory } from "@/types/module";

const KEY = "visea_admin_modules";

function readCustomModules(): LearningModule[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeCustomModules(data: LearningModule[]) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export async function getAdminModules(): Promise<LearningModule[]> {
  return readCustomModules();
}

export async function createAdminModule(
  data: Omit<LearningModule, "id">
): Promise<LearningModule> {
  const module: LearningModule = { ...data, id: `cm_${Date.now()}` };
  const all = readCustomModules();
  all.unshift(module);
  writeCustomModules(all);
  return module;
}

export async function updateAdminModule(
  id: string,
  patch: Partial<Omit<LearningModule, "id">>
): Promise<LearningModule | null> {
  const all = readCustomModules();
  const idx = all.findIndex((m) => m.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  writeCustomModules(all);
  return all[idx];
}

export async function deleteAdminModule(id: string): Promise<void> {
  writeCustomModules(readCustomModules().filter((m) => m.id !== id));
}

export interface ModuleStats {
  moduleSlug: string;
  totalSessions: number;
  avgEngagement: number | null;
  lastUsed: string | null;
}

export async function getModuleStats(): Promise<ModuleStats[]> {
  if (typeof window === "undefined") return [];
  try {
    const sessions: Array<{
      moduleSlug?: string;
      averageEngagement?: number;
      startTime: string;
    }> = JSON.parse(localStorage.getItem("visea_sessions") ?? "[]");

    const map = new Map<string, { count: number; engSum: number; engCount: number; last: string }>();

    for (const s of sessions) {
      const slug = s.moduleSlug ?? "unknown";
      const prev = map.get(slug) ?? { count: 0, engSum: 0, engCount: 0, last: "" };
      map.set(slug, {
        count: prev.count + 1,
        engSum: prev.engSum + (s.averageEngagement ?? 0),
        engCount: prev.engCount + (s.averageEngagement !== undefined ? 1 : 0),
        last: !prev.last || s.startTime > prev.last ? s.startTime : prev.last,
      });
    }

    return Array.from(map.entries()).map(([slug, d]) => ({
      moduleSlug: slug,
      totalSessions: d.count,
      avgEngagement: d.engCount > 0 ? d.engSum / d.engCount : null,
      lastUsed: d.last || null,
    }));
  } catch {
    return [];
  }
}
