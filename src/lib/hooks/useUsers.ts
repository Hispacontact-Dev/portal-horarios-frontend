"use client";

import { useState } from "react";
import { createUser } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import { classifyError, type ClassifiedError } from "@/lib/api/errors";
import type { User, UserCreate } from "@/types/user";

type UseUsersStatus = "idle" | "submitting" | "success" | "error";

interface UseUsersState {
  status: UseUsersStatus;
  values: UserCreate | null;
  error: ClassifiedError | null;
  user: User | null;
}

const UNKNOWN_ERROR: ClassifiedError = {
  kind: "unknown",
  message: "Error inesperado, intentá de nuevo",
};

export function useUsers() {
  const [state, setState] = useState<UseUsersState>({
    status: "idle",
    values: null,
    error: null,
    user: null,
  });

  async function submit(values: UserCreate): Promise<boolean> {
    if (state.status === "submitting") return false;

    setState({ status: "submitting", values, error: null, user: null });

    try {
      const user = await createUser(values);
      setState({ status: "success", values: null, error: null, user });
      return true;
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState({ status: "error", values, error: classified ?? UNKNOWN_ERROR, user: null });
      return false;
    }
  }

  return { state, submit };
}
