// Helper simple para combinar clases de Tailwind sin depender de clsx/tailwind-merge.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
