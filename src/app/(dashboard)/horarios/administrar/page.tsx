"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { AdministrarHorariosView } from "@/components/schedules/AdministrarHorariosView";

export default function AdministrarHorariosPage() {
  return (
    <RoleGate>
      <AdministrarHorariosView />
    </RoleGate>
  );
}
