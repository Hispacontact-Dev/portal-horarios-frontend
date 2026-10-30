"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfigTabs, type ConfigTab } from "@/components/configuracion/ConfigTabs";
import { AreasTab } from "@/components/configuracion/AreasTab";
import { EstadosTab } from "@/components/configuracion/EstadosTab";
import { UsuariosTab } from "@/components/configuracion/UsuariosTab";
import { CargosTab } from "@/components/configuracion/CargosTab";
import { PlantillasTab } from "@/components/configuracion/PlantillasTab";
import { FestivosTab } from "@/components/configuracion/FestivosTab";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTE_PATHS } from "@/lib/utils/constants";

const VALID_TABS: ConfigTab[] = ["areas", "estados", "usuarios", "cargos", "plantillas", "festivos"];

function ConfiguracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: ConfigTab = VALID_TABS.includes(rawTab as ConfigTab) ? (rawTab as ConfigTab) : "areas";

  function handleChange(tab: ConfigTab) {
    router.push(`${ROUTE_PATHS.configuracion}?tab=${tab}`);
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <header className="anim-up">
        <p className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">04 · Catálogos, turnos y accesos</p>
        <h1 className="font-heading mt-0.5 text-[42px] font-semibold uppercase leading-none">Configuración</h1>
      </header>

      <ConfigTabs active={activeTab} onChange={handleChange} />

      {activeTab === "areas" && <AreasTab />}
      {activeTab === "estados" && <EstadosTab />}
      {activeTab === "usuarios" && <UsuariosTab />}
      {activeTab === "cargos" && <CargosTab />}
      {activeTab === "plantillas" && <PlantillasTab />}
      {activeTab === "festivos" && <FestivosTab />}
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
