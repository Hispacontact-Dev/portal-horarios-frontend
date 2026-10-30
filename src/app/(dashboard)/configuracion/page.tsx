"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CONFIG_TABS, ConfigTabs, type ConfigTab } from "@/components/configuracion/ConfigTabs";
import { CatalogoTab } from "@/components/configuracion/CatalogoTab";
import { EstadosTab } from "@/components/configuracion/EstadosTab";
import { PlantillasTab } from "@/components/configuracion/PlantillasTab";
import { FestivosTab } from "@/components/configuracion/FestivosTab";
import { UsuariosTab } from "@/components/configuracion/UsuariosTab";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTE_PATHS } from "@/lib/utils/constants";

function ConfiguracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: ConfigTab = CONFIG_TABS.includes(rawTab as ConfigTab)
    ? (rawTab as ConfigTab)
    : "areas";

  function handleChange(tab: ConfigTab) {
    // `replace` y sin scroll: cambiar de pestaña no es navegar a otra página, así que
    // no debe llenar el historial ni mover el scroll.
    router.replace(`${ROUTE_PATHS.configuracion}?tab=${tab}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <header className="anim-up">
        <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">04 · Catálogos, turnos y accesos</p>
        <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Configuración</h1>
      </header>

      <ConfigTabs active={activeTab} onChange={handleChange} />

      {activeTab === "areas" && <CatalogoTab key="area" tipo="area" />}
      {activeTab === "cargos" && <CatalogoTab key="cargo" tipo="cargo" />}
      {activeTab === "estados" && <EstadosTab />}
      {activeTab === "plantillas" && <PlantillasTab />}
      {activeTab === "festivos" && <FestivosTab />}
      {activeTab === "usuarios" && <UsuariosTab />}
    </div>
  );
}

export default function ConfiguracionPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ConfiguracionContent />
    </Suspense>
  );
}
