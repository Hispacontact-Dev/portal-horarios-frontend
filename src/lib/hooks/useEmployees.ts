"use client";

import { useState } from "react";
import type { Employee } from "@/types/employee";

// TODO: implementar carga real vía lib/api/employees.ts.
export function useEmployees() {
  const [employees] = useState<Employee[]>([]);
  const [isLoading] = useState(false);

  return { employees, isLoading };
}
