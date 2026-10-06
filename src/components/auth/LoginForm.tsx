"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { NEXT_QUERY_PARAM } from "@/lib/session/constants";

const GENERIC_ERROR_MESSAGE = "Correo o contraseña incorrectos.";
const LOCKED_ERROR_MESSAGE = "Tu cuenta está bloqueada temporalmente. Intenta más tarde.";
const CONNECTION_ERROR_MESSAGE = "No se pudo conectar con el servidor. Intenta de nuevo en un momento.";

// Deja correr la animación de éxito antes de redirigir (coincide con la barra `fill`).
const SUCCESS_REDIRECT_DELAY_MS = 1600;

const Corners = () => (
  <>
    <i className="corner -left-[6px] -top-[6px]" />
    <i className="corner -right-[6px] -top-[6px]" />
    <i className="corner -bottom-[6px] -left-[6px]" />
    <i className="corner -bottom-[6px] -right-[6px]" />
  </>
);

const inputCls =
  "w-full min-h-[42px] border border-[var(--divider)] bg-[#e9e9ea] px-2.5 text-sm text-[var(--text)] caret-[var(--accent)] outline-none transition-colors hover:border-[rgba(29,31,32,.45)] focus-visible:border-[var(--accent)]";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    try {
      await login({ email, password });
      setDone(true);
      const next = searchParams.get(NEXT_QUERY_PARAM);
      setTimeout(() => {
        router.replace(next || "/dashboard");
      }, SUCCESS_REDIRECT_DELAY_MS);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 423) {
          setErrorMessage(LOCKED_ERROR_MESSAGE);
          return;
        }
        if (error.status === 401) {
          setErrorMessage(GENERIC_ERROR_MESSAGE);
          return;
        }
        setErrorMessage(CONNECTION_ERROR_MESSAGE);
        return;
      }
      setErrorMessage(CONNECTION_ERROR_MESSAGE);
    }
  }

  return (
    <div
      className="anim-up relative w-full max-w-[420px] border border-[var(--divider)] bg-[var(--bg)] px-8 py-[30px]"
      style={{ animationDelay: ".2s" }}
    >
      <Corners />

      {!done ? (
        <>
          <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-heading text-[30px] font-semibold leading-tight">Iniciar sesión</h1>
            <span className="bg-[var(--accent-100)] px-2.5 py-[3px] text-[11px] text-[var(--accent-800)]">
              Junta Directiva · Líderes
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="anim-up" style={{ animationDelay: ".4s" }}>
              <label htmlFor="email" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputCls}
                placeholder="nombre@empresa.com"
              />
            </div>

            <div className="anim-up" style={{ animationDelay: ".5s" }}>
              <label htmlFor="password" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputCls} pr-[72px]`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((show) => !show)}
                  className="font-heading absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2 text-xs font-semibold uppercase tracking-[.08em] text-[var(--accent)] hover:bg-[rgba(89,128,166,.1)] active:bg-[rgba(89,128,166,.18)]"
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            {errorMessage && (
              <p className="anim-up text-[13px] text-[var(--accent-800)]">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="font-heading anim-up relative mt-1 flex h-[46px] w-full items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] text-[17px] font-semibold tracking-[.03em] text-[var(--bg)] transition-colors hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:cursor-wait"
              style={{ animationDelay: ".6s" }}
            >
              <Corners />
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin"
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Verificando…
                </>
              ) : (
                "Entrar al portal"
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="anim-up flex flex-col items-center gap-3 py-2.5 text-center">
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: 40, animation: "draw .6s .1s both" }}
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <h2 className="font-heading text-[30px] font-semibold">Sesión iniciada</h2>
          <p className="text-sm text-[rgba(29,31,32,.55)]">Cargando tu turno de hoy…</p>
          <div className="h-[3px] w-full bg-[var(--accent-100)]">
            <div
              className="h-full origin-left bg-[var(--accent)]"
              style={{ animation: "fill 1.6s cubic-bezier(.4,0,.2,1) both" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
