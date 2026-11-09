"use client";

import { listUsers } from "@/lib/api/users";
import { useAsyncResource } from "@/lib/hooks/useAsyncResource";
import type { User } from "@/types/user";

export function useUsersList() {
  return useAsyncResource<User[]>((signal) => listUsers(signal), []);
}
