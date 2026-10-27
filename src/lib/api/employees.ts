import { apiFetch } from "@/lib/api/client";
import type { Employee, EmployeeCreate, EmployeeUpdate } from "@/types/employee";

export async function listEmployees(): Promise<Employee[]> {
  return apiFetch<Employee[]>("/employees");
}

export async function getEmployee(id: string): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}`);
}

export async function createEmployee(data: EmployeeCreate): Promise<Employee> {
  return apiFetch<Employee>("/employees", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEmployee(id: string, data: EmployeeUpdate): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function updateEmployeeStatus(id: string, statusId: string): Promise<Employee> {
  return apiFetch<Employee>(`/employees/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status_id: statusId }),
  });
}
