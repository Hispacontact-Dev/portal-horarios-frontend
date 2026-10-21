"use client";

import { useAsyncAction } from "@/lib/hooks/useAsyncAction";
import { revertDayToDefault, setDayStatus } from "@/lib/api/schedules";
import type { DayStatusChangeInput, ScheduleDayEntry } from "@/types/schedule";

type DayStatusChangeArgs =
  | { type: "set"; input: DayStatusChangeInput }
  | { type: "revert"; employeeId: string; date: string; expectedUpdatedAt: string };

async function submitDayStatusChange(args: DayStatusChangeArgs): Promise<ScheduleDayEntry> {
  if (args.type === "set") return setDayStatus(args.input);
  return revertDayToDefault(args.employeeId, args.date, args.expectedUpdatedAt);
}

export function useDayStatusChange() {
  const action = useAsyncAction<DayStatusChangeArgs, ScheduleDayEntry>(submitDayStatusChange);

  function setStatus(input: DayStatusChangeInput) {
    return action.submit({ type: "set", input });
  }

  function revert(employeeId: string, date: string, expectedUpdatedAt: string) {
    return action.submit({ type: "revert", employeeId, date, expectedUpdatedAt });
  }

  return { state: action.state, retry: action.retry, setStatus, revert };
}
