"use client";

export type ConfigTab = "areas" | "estados" | "usuarios";

interface ConfigTabsProps {
  active: ConfigTab;
  onChange: (tab: ConfigTab) => void;
}

const TABS: { key: ConfigTab; label: string }[] = [
  { key: "areas", label: "Áreas" },
  { key: "estados", label: "Estados" },
  { key: "usuarios", label: "Usuarios" },
];

export function ConfigTabs({ active, onChange }: ConfigTabsProps) {
  return (
    <div role="tablist" className="flex gap-1 border-b border-[var(--divider)]">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-4 py-2 text-sm font-medium ${
            active === tab.key
              ? "border-b-2 border-[var(--accent)] text-[var(--accent-800)]"
              : "text-[var(--neutral-700)] hover:text-[var(--accent-700)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
