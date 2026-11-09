"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

interface RoleGateProps {
  children: ReactNode;
  /** Qué mostrar a quien no administra; por defecto, nada. */
  fallback?: ReactNode;
}

export function RoleGate({ children, fallback = null }: RoleGateProps) {
  const { session } = useAuth();

  if (session?.role !== "gestion_humana") {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
