import type { Child, DisabilityType } from "@/types/child";
import { apiFetch } from "./auth";

export async function getChildren(_parentId: string): Promise<Child[]> {
  return apiFetch<Child[]>("/children");
}

export async function getChildById(id: string): Promise<Child | null> {
  return apiFetch<Child>(`/children/${id}`).catch(() => null);
}

export async function addChild(
  _parentId: string,
  data: { name: string; birthDate: string; disabilityType: DisabilityType }
): Promise<Child> {
  return apiFetch<Child>("/children", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateChild(
  id: string,
  data: Partial<Pick<Child, "name" | "birthDate" | "disabilityType">>
): Promise<Child | null> {
  return apiFetch<Child>(`/children/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }).catch(() => null);
}

export async function deleteChild(id: string): Promise<void> {
  await apiFetch<void>(`/children/${id}`, { method: "DELETE" });
}

export function getAgeInYears(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}
