import type { ButtonHTMLAttributes } from "react";
import { Corners } from "@/components/dashboard/Corners";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border border-[var(--accent)] bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)]",
  secondary: "border border-[var(--accent)] text-[var(--accent-700)] hover:bg-[var(--accent-100)]",
  danger: "border border-[var(--accent-800)] text-[var(--accent-800)] hover:bg-[var(--accent-100)]",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "font-heading relative inline-flex h-[38px] items-center justify-center gap-1.5 whitespace-nowrap px-4 text-sm font-semibold disabled:pointer-events-none disabled:opacity-45",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    >
      {variant === "primary" && <Corners />}
      {children}
    </button>
  );
}
