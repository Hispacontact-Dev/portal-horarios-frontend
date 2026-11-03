"use client";

import { Corners } from "@/components/dashboard/Corners";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { PERIOD_PRESETS, type AuditFilters, type PeriodPreset } from "@/lib/hooks/useAuditFilters";
import { AUDIT_CATEGORIES, type AuditCategory } from "@/lib/utils/history-labels";

interface ActorOption {
  id: string;
  label: string;
}

interface AuditFiltersPanelProps {
  filters: AuditFilters;
  draftQuery: string;
  activePreset: PeriodPreset | null;
  counts: Record<AuditCategory, number>;
  actorOptions: ActorOption[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (category: AuditCategory) => void;
  onActorChange: (actorId: string) => void;
  onFromChange: (day: string) => void;
  onToChange: (day: string) => void;
  onPeriodChange: (days: number) => void;
  onToggleLogins: () => void;
}

const SEGMENT_BASE = "h-9 px-3.5 text-[13px] transition-colors";
const SEGMENT_ON = "bg-[var(--accent)] text-[var(--bg)]";
const SEGMENT_OFF = "text-[var(--neutral-700)] hover:bg-[var(--accent-100)]";

export function AuditFiltersPanel({
  filters,
  draftQuery,
  activePreset,
  counts,
  actorOptions,
  onQueryChange,
  onCategoryChange,
  onActorChange,
  onFromChange,
  onToChange,
  onPeriodChange,
  onToggleLogins,
}: AuditFiltersPanelProps) {
  return (
    <section className="panel anim-up flex flex-col gap-3.5 px-[22px] py-4" style={{ animationDelay: ".05s" }}>
      <Corners />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neutral-700)]"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.34-4.34" />
          </svg>
          <Input
            value={draftQuery}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar empleado, usuario o valor…"
            aria-label="Buscar en el historial"
            className="w-full pl-9"
          />
        </div>

        <Select
          value={filters.actorId}
          onChange={(event) => onActorChange(event.target.value)}
          aria-label="Filtrar por usuario"
        >
          <option value="">Todos los usuarios</option>
          {actorOptions.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.label}
            </option>
          ))}
        </Select>

        <div className="flex flex-wrap border border-[var(--divider)]" role="group" aria-label="Tipo de evento">
          {AUDIT_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              aria-pressed={filters.category === category}
              onClick={() => onCategoryChange(category)}
              className={`${SEGMENT_BASE} ${filters.category === category ? SEGMENT_ON : SEGMENT_OFF}`}
            >
              {category}
              <span className="ml-1.5 text-[11px] tabular-nums opacity-70">{counts[category]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[var(--divider)] pt-2.5">
        <div className="flex border border-[var(--divider)]" role="group" aria-label="Periodo">
          {PERIOD_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              aria-pressed={activePreset === preset.label}
              onClick={() => onPeriodChange(preset.days)}
              className={`${SEGMENT_BASE} ${activePreset === preset.label ? SEGMENT_ON : SEGMENT_OFF}`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-[13px] text-[var(--neutral-700)]">
          Desde
          <Input
            type="date"
            value={filters.from}
            max={filters.to || undefined}
            onChange={(event) => onFromChange(event.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-[13px] text-[var(--neutral-700)]">
          Hasta
          <Input
            type="date"
            value={filters.to}
            min={filters.from || undefined}
            onChange={(event) => onToChange(event.target.value)}
          />
        </label>

        <div className="flex items-center gap-2.5 sm:ml-auto">
          <Switch
            checked={filters.includeLogins}
            label="Incluir inicios de sesión"
            // En la categoría Accesos los inicios de sesión son el contenido de la lista.
            disabled={filters.category === "Accesos"}
            onChange={onToggleLogins}
          />
          <span className="text-[13px]">Incluir inicios de sesión</span>
        </div>
      </div>
    </section>
  );
}
