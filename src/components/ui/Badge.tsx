import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeProps = HTMLAttributes<HTMLSpanElement>;

export function Badge({ className, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-block rounded-full px-2 py-0.5 text-xs font-medium", className)}
      {...props}
    />
  );
}
