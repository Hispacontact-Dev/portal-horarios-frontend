"use client";

import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeCreateView } from "@/components/employees/EmployeeCreateView";

export default function NuevoEmpleadoPage() {
  return (
    <RoleGate>
      <EmployeeCreateView />
    </RoleGate>
  );
}
