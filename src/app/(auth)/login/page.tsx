import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LiveClock } from "@/components/auth/LiveClock";
import { Brand } from "@/components/layout/Brand";

export default function LoginPage() {
  return (
    <main className="grid-bg relative flex min-h-screen flex-col items-center justify-center gap-7 px-5 py-24 text-[var(--text)]">
      <header className="anim-in absolute inset-x-8 top-7 flex flex-wrap items-start justify-between gap-4">
        <Brand width={200} />
        <LiveClock variant="date" />
      </header>

      <LiveClock variant="clock" />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p
        className="anim-in absolute inset-x-5 bottom-6 text-center text-xs text-[var(--neutral-700)]"
        style={{ animationDelay: ".8s" }}
      >
        ¿Problemas para entrar? Contacta a Recursos Humanos
      </p>
    </main>
  );
}
