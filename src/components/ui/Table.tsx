import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type TableProps = HTMLAttributes<HTMLTableElement>;

// TODO: tabla genérica; las tablas por dominio (EmployeeTable, AreaTable, etc.) la envuelven.
export function Table({ className, ...props }: TableProps) {
  return <table className={cn("w-full text-left text-sm", className)} {...props} />;
}
