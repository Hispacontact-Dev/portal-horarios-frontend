import type { OpsSection } from "@/lib/utils/ops/sections";

interface OpsPageHeaderProps {
  section: OpsSection;
}

export function OpsPageHeader({ section }: OpsPageHeaderProps) {
  return (
    <header className="anim-up">
      <nav aria-label="Ruta de navegación">
        <ol className="flex items-center gap-2 text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
          <li>Operación</li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-[var(--accent-700)]">
            {section.label}
          </li>
        </ol>
      </nav>
      <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">
        {section.label}
      </h1>
    </header>
  );
}
