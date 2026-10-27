"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEmployees } from "@/lib/hooks/useEmployees";
import { EmployeeTable } from "@/components/employees/EmployeeTable";
import { RoleGate } from "@/components/auth/RoleGate";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

function EmpleadosList() {
  const { status, employees, error } = useEmployees();
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q") ?? "";
  const query = rawQuery.trim().toLowerCase();

  const filteredEmployees = query
    ? employees.filter((employee) => employee.full_name.toLowerCase().includes(query))
    : employees;

  return (
    <>
      {query && <p className="text-sm text-gray-500">Mostrando resultados para “{rawQuery}”</p>}
      {status === "loading" && <Spinner />}
      {status === "error" && <ErrorState message={error.message} />}
      {status === "success" && filteredEmployees.length === 0 && (
        <EmptyState
          message={query ? "No hay empleados que coincidan con la búsqueda." : "No hay empleados registrados."}
        />
      )}
      {status === "success" && filteredEmployees.length > 0 && <EmployeeTable employees={filteredEmployees} />}
    </>
  );
}

export default function EmpleadosPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Empleados</h1>
        <RoleGate>
          <Button type="button" onClick={() => router.push("/empleados/nuevo")}>
            Nuevo empleado
          </Button>
        </RoleGate>
      </div>
      <Suspense fallback={<Spinner />}>
        <EmpleadosList />
      </Suspense>
    </div>
  );
}
