"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWeekSchedule } from "@/lib/hooks/useWeekSchedule";
import { HorariosView } from "@/components/schedules/HorariosView";
import { Spinner } from "@/components/ui/Spinner";
import { addWeeks, mondayOf, parseISODate, toISODate } from "@/lib/utils/week";
import { ROUTE_PATHS } from "@/lib/utils/constants";

const MIN_OFFSET = -8;
const MAX_OFFSET = 8;

function offsetFromParam(semana: string | null): number {
  if (!semana) return 0;
  const thisMonday = mondayOf(new Date());
  const targetMonday = mondayOf(parseISODate(semana));
  const diffWeeks = Math.round((targetMonday.getTime() - thisMonday.getTime()) / (7 * 86400000));
  return Math.min(MAX_OFFSET, Math.max(MIN_OFFSET, diffWeeks));
}

function HorariosPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offset = offsetFromParam(searchParams.get("semana"));

  const { state, retry } = useWeekSchedule(offset);

  function goToOffset(nextOffset: number) {
    const clamped = Math.min(MAX_OFFSET, Math.max(MIN_OFFSET, nextOffset));
    const monday = addWeeks(mondayOf(new Date()), clamped);
    router.push(`${ROUTE_PATHS.horarios}?semana=${toISODate(monday)}`);
  }

  return (
    <HorariosView
      state={state}
      retry={retry}
      offset={offset}
      canGoPrev={offset > MIN_OFFSET}
      canGoNext={offset < MAX_OFFSET}
      onPrev={() => goToOffset(offset - 1)}
      onNext={() => goToOffset(offset + 1)}
      onToday={() => router.push(ROUTE_PATHS.horarios)}
    />
  );
}

export default function HorariosPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <HorariosPageContent />
    </Suspense>
  );
}
