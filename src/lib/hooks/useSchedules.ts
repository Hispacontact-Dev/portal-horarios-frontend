"use client";

import { useState } from "react";
import type { Schedule } from "@/types/schedule";

// TODO: feature futura "horarios" — el backend todavía no expone endpoints para esto.
export function useSchedules() {
  const [schedules] = useState<Schedule[]>([]);

  return { schedules };
}
