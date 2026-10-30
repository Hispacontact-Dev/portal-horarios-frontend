"use client";

export type ConfigTab = "areas" | "estados" | "usuarios" | "cargos" | "plantillas" | "festivos";

interface ConfigTabsProps {
  active: ConfigTab;
  onChange: (tab: ConfigTab) => void;
}

const TABS: { key: ConfigTab; label: string }[] = [
  { key: "areas", label: "Áreas" },
  { key: "estados", label: "Estados" },
  { key: "usuarios", label: "Usuarios" },
  { key: "cargos", label: "Cargos" },
  { key: "plantillas", label: "Plantillas de turno" },
  { key: "festivos", label: "Festivos" },
];

export function ConfigTabs({ active, onChange }: ConfigTabsProps) {
  return (
    <div role="tablist" className="anim-up flex gap-1 overflow-x-auto border-b border-[var(--divider)]">
      {TABS.map((tab, i) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`font-heading flex items-baseline gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            active === tab.key
              ? "border-[var(--accent)] text-[var(--accent-800)]"
              : "border-transparent text-[var(--neutral-700)] hover:bg-[var(--accent-100)] hover:text-[var(--accent-700)]"
          }`}
        >
          <span className="text-[11px] text-[var(--accent-700)]">0{i + 1}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
