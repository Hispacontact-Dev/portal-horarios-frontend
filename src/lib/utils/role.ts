import type { Role } from "@/types/session";
import type { UserRole } from "@/types/user";
import { ROLE_LABELS } from "@/lib/utils/constants";

export function canonicalRole(role: UserRole): Role {
  if (role === "admin") return "gestion_humana";
  return role;
}

export function roleLabel(role: UserRole): string {
  return ROLE_LABELS[canonicalRole(role)];
}
