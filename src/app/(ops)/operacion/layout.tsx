import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { OpsSidebar } from "@/components/ops/layout/OpsSidebar";
import { isOpsModuleEnabled } from "@/lib/utils/ops/feature-flag";

// Grupo de rutas propio: el módulo de operación trae su layout y su menú, así que no
// comparte el shell del portal de Junta Directiva.
export default function OperacionLayout({ children }: { children: ReactNode }) {
  if (!isOpsModuleEnabled()) notFound();

  return (
    <div className="grid min-h-screen grid-cols-[232px_minmax(0,1fr)] bg-[var(--bg)] text-[var(--text)]">
      <OpsSidebar />
      <main className="flex min-w-0 flex-col gap-[22px] px-9 py-7">{children}</main>
    </div>
  );
}
