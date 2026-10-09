"use client";

import { useState } from "react";
import { HistoryFilters } from "@/components/history/HistoryFilters";
import { HistoryTable } from "@/components/history/HistoryTable";
import { useHistory } from "@/lib/hooks/useHistory";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import type { HistoryFilters as HistoryFiltersValue } from "@/types/history";

export default function AuditoriaPage() {
  const [filters, setFilters] = useState<HistoryFiltersValue>({});
  const { status, entries, error } = useHistory(filters);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Auditoría</h1>
      <HistoryFilters value={filters} onChange={setFilters} />
      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && <HistoryTable entries={entries} />}
    </div>
  );
}
