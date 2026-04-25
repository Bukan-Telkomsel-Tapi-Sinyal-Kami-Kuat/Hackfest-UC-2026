import type { Child, DisabilityType } from "@/types/child";

const KEY = "visea_children";

function readAll(): Child[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeAll(children: Child[]) {
  localStorage.setItem(KEY, JSON.stringify(children));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getChildren(parentId: string): Promise<Child[]> {
  await delay(300);
  return readAll().filter((c) => c.parentId === parentId);
}

export async function getChildById(id: string): Promise<Child | null> {
  await delay(200);
  return readAll().find((c) => c.id === id) ?? null;
}

export async function addChild(
  parentId: string,
  data: { name: string; birthDate: string; disabilityType: DisabilityType }
): Promise<Child> {
  await delay(400);
  const child: Child = {
    id: `ch_${Date.now()}`,
    parentId,
    createdAt: new Date().toISOString(),
    ...data,
  };
  const all = readAll();
  all.push(child);
  writeAll(all);
  return child;
}

export async function updateChild(
  id: string,
  data: Partial<Pick<Child, "name" | "birthDate" | "disabilityType">>
): Promise<Child | null> {
  await delay(300);
  const all = readAll();
  const idx = all.findIndex((c) => c.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...data };
  writeAll(all);
  return all[idx];
}

export async function deleteChild(id: string): Promise<void> {
  await delay(300);
  writeAll(readAll().filter((c) => c.id !== id));
}

export function getAgeInYears(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}
