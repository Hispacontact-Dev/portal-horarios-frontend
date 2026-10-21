"use client";

import Link from "next/link";
import { RoleGate } from "@/components/auth/RoleGate";
import { useScheduleWeekNavigation } from "@/lib/hooks/useScheduleWeekNavigation";
import { useWeekSchedule } from "@/lib/hooks/useWeekSchedule";
import { useScheduleFilters } from "@/lib/hooks/useScheduleFilters";
import { applyScheduleFilters } from "@/lib/utils/scheduleFilters";
import { WeekNavigator } from "@/components/schedules/WeekNavigator";
import { ScheduleFiltersBar } from "@/components/schedules/ScheduleFiltersBar";
import { ScheduleWeekView } from "@/components/schedules/ScheduleWeekView";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HorariosPage() {
  const { offset, goPrev, goNext, canGoPrev, canGoNext } = useScheduleWeekNavigation();
  const { state, retry } = useWeekSchedule(offset);

  const employees = state.status === "success" || state.status === "empty" ? state.data.employees : [];
  const { filters, setFilter, clearAll } = useScheduleFilters(employees);
  const filteredEmployees = applyScheduleFilters(employees, filters);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Horarios</h1>
        <RoleGate>
          <Link href="/horarios/administrar" className="text-sm font-medium text-blue-700 hover:underline">
            Administrar horarios
          </Link>
        </RoleGate>
      </div>

      {state.status === "loading" && <Spinner />}
      {state.status === "error" && <ErrorState message={state.error.message} onRetry={retry} />}

      {(state.status === "success" || state.status === "empty") && (
        <>
          <WeekNavigator
            weekStart={state.data.week_start}
            weekEnd={state.data.week_end}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            onPrev={goPrev}
            onNext={goNext}
          />
          <ScheduleFiltersBar employees={employees} filters={filters} onChange={setFilter} onClear={clearAll} />

          {employees.length === 0 && <EmptyState message="No hay datos de horarios para esta semana." />}
          {employees.length > 0 && filteredEmployees.length === 0 && (
            <EmptyState message="Ningún resultado coincide con los filtros aplicados." />
          )}
          {filteredEmployees.length > 0 && <ScheduleWeekView employees={filteredEmployees} />}
        </>
      )}
    </div>
  );
}
