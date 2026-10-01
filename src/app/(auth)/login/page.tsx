import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { LiveClock } from "@/components/auth/LiveClock";

export default function LoginPage() {
  return (
    <main className="grid-bg relative flex min-h-screen flex-col items-center justify-center gap-7 px-5 py-24 text-[var(--text)]">
      <header className="anim-in absolute inset-x-8 top-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" />
            <path d="M16 2v4" />
            <path d="M8 2v4" />
            <path d="M3 10h5" />
            <path d="M17.5 17.5 16 16.3V14" />
            <circle cx="16" cy="16" r="6" />
          </svg>
          <span className="font-heading text-base font-semibold uppercase tracking-[.08em]">
            Portal de Horarios
          </span>
        </div>
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
