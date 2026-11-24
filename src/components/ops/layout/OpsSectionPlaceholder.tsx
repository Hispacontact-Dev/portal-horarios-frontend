import { EmptyState } from "@/components/ui/EmptyState";
import { OpsPageHeader } from "@/components/ops/layout/OpsPageHeader";
import { opsSectionByKey, type OpsSectionKey } from "@/lib/utils/ops/sections";

interface OpsSectionPlaceholderProps {
  sectionKey: OpsSectionKey;
}

// Estado real de una sub-pestaña sin contenido: el backend todavía no expone los endpoints
// del módulo, así que se muestra vacío en vez de datos simulados.
export function OpsSectionPlaceholder({ sectionKey }: OpsSectionPlaceholderProps) {
  const section = opsSectionByKey(sectionKey);

  return (
    <div className="flex flex-col gap-[22px]">
      <OpsPageHeader section={section} />
      <section className="panel anim-up px-[22px] py-5" style={{ animationDelay: ".1s" }}>
        <EmptyState
          message={`${section.label} todavía no tiene datos: esta sub-pestaña se construye en una tarea próxima.`}
        />
      </section>
    </div>
  );
}
