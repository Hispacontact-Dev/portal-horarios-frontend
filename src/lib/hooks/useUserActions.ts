"use client";

import { deactivateUser, updateUserRole } from "@/lib/api/users";
import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import type { User, UserRoleUpdate } from "@/types/user";

interface ChangeRoleInput extends UserRoleUpdate {
  id: string;
}

export function useChangeUserRole() {
  return useAsyncAction<ChangeRoleInput, User>(({ id, role }) => updateUserRole(id, { role }));
}

export function useDeactivateUser() {
  return useAsyncAction<string, User>((id) => deactivateUser(id));
}
