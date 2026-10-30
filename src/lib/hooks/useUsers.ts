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

  // Devuelve la cuenta creada (no un booleano) para que quien llame pueda agregarla
  // a su lista local sin volver a pedir el listado completo.
  async function submit(values: UserCreate): Promise<User | null> {
    if (state.status === "submitting") return null;

    setState({ status: "submitting", values, error: null, user: null });

    try {
      const user = await createUser(values);
      setState({ status: "success", values: null, error: null, user });
      return user;
    } catch (err) {
      const classified = err instanceof ApiError ? classifyError(err) : null;
      setState({ status: "error", values, error: classified ?? UNKNOWN_ERROR, user: null });
      return null;
    }
  }

  return { state, submit };
}
