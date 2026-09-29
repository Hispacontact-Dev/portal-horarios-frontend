"use client";

import { useState } from "react";
import type { Area } from "@/types/area";

// TODO: implementar carga real vía lib/api/areas.ts.
export function useAreas() {
  const [areas] = useState<Area[]>([]);
  const [isLoading] = useState(false);

  return { areas, isLoading };
}
