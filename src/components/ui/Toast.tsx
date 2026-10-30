import { Corners } from "@/components/dashboard/Corners";

interface ToastProps {
  message: string;
}

// Confirmación efímera de una acción que ya se guardó. Se posiciona sobre el
// contenido, así que se renderiza al final del panel que la dispara.
export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      className="panel anim-toast fixed bottom-7 right-7 z-30 flex items-center gap-2 bg-[var(--bg)] px-[18px] py-3.5 text-sm shadow-[0_8px_28px_rgba(29,31,32,.18)]"
    >
      <Corners />
      <span aria-hidden="true" className="text-[var(--accent-700)]">
        ✓
      </span>
      {message}
    </div>
  );
}
