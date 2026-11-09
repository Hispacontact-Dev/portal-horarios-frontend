import { Suspense } from "react";
import { AuditoriaView } from "@/components/history/AuditoriaView";
import { Spinner } from "@/components/ui/Spinner";

export default function AuditoriaPage() {
  // `AuditoriaView` lee los filtros de la URL con `useSearchParams`, que exige Suspense.
  return (
    <Suspense fallback={<Spinner />}>
      <AuditoriaView />
    </Suspense>
  );
}
