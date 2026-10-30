import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn("input-ui", className)} {...props}>
      {children}
    </select>
  );
}
