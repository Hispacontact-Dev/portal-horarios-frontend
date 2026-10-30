"use client";

import { cn } from "@/lib/utils/cn";

interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: () => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, label, onChange, disabled = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn("switch-ui", className)}
    />
  );
}
