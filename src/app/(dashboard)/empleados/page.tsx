import { EmployeeTable } from "@/components/employees/EmployeeTable";

// TODO: cargar empleados vía useEmployees() y pasarlos a EmployeeTable.
export default function EmpleadosPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold">Empleados</h1>
      <EmployeeTable employees={[]} />
    </div>
  );
}
