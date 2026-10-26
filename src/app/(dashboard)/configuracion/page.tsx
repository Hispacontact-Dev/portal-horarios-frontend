"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfigTabs, type ConfigTab } from "@/components/configuracion/ConfigTabs";
import { AreasTab } from "@/components/configuracion/AreasTab";
import { EstadosTab } from "@/components/configuracion/EstadosTab";
import { UsuariosTab } from "@/components/configuracion/UsuariosTab";
import { Spinner } from "@/components/ui/Spinner";
import { ROUTE_PATHS } from "@/lib/utils/constants";

const VALID_TABS: ConfigTab[] = ["areas", "estados", "usuarios"];

function ConfiguracionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get("tab");
  const activeTab: ConfigTab = VALID_TABS.includes(rawTab as ConfigTab) ? (rawTab as ConfigTab) : "areas";

  function handleChange(tab: ConfigTab) {
    router.push(`${ROUTE_PATHS.configuracion}?tab=${tab}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ConfigTabs active={activeTab} onChange={handleChange} />
      {activeTab === "areas" && <AreasTab />}
      {activeTab === "estados" && <EstadosTab />}
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
