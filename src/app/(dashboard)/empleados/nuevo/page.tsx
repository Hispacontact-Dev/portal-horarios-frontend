"use client";

import { useRouter } from "next/navigation";
import { RoleGate } from "@/components/auth/RoleGate";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default function NuevoEmpleadoPage() {
  const router = useRouter();

  function handleCreated() {
    router.push("/empleados");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Nuevo empleado</h1>
      <RoleGate>
        <EmployeeForm mode="create" onSuccess={handleCreated} />
      </RoleGate>
    </div>
  );
}
