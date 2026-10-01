"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

interface RoleGateProps {
  children: ReactNode;
}

export function RoleGate({ children }: RoleGateProps) {
  const { session } = useAuth();

  if (session?.role !== "junta_directiva") {
    return null;
  }

  return <>{children}</>;
}
