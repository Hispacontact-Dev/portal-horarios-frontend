### Implementeacion Diseño completo login ###

*** implementa cada page y parte en el login para que quede bien diseñado.***


# 1.  app/layout.tsx: agrega las fuentes

import { Barlow, Barlow_Condensed } from "next/font/google";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });
const barlowCond = Barlow_Condensed({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-heading" });

// en <html>:
<html lang="es" className={`${barlow.variable} ${barlowCond.variable}`}>


# 2. app/globals.css: agrega al final

:root{
  --bg:#f2f2f3; --text:#1d1f20; --accent:#5980a6;
  --accent-100:#eef6ff; --accent-600:#597ea3; --accent-700:#416180; --accent-800:#2c455d;
  --neutral-700:#5d5d60; --divider:rgba(29,31,32,.16);
}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes blink{50%{opacity:.15}}
@keyframes draw{from{stroke-dashoffset:40}to{stroke-dashoffset:0}}
@keyframes fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes drift{from{background-position:0 0}to{background-position:48px 48px}}
.anim-up{animation:fadeUp .7s cubic-bezier(.2,.7,.2,1) both}
.anim-in{animation:fadeIn .6s both}
.grid-bg{
  background-color:var(--bg);
  background-image:linear-gradient(rgba(29,31,32,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(29,31,32,.06) 1px,transparent 1px);
  background-size:48px 48px; animation:drift 6s linear infinite;
}
.corner{position:absolute;width:11px;height:11px;color:rgba(29,31,32,.55)}
.corner::before,.corner::after{content:"";position:absolute;background:currentColor}
.corner::before{left:5px;top:0;width:1px;height:100%}
.corner::after{top:5px;left:0;width:100%;height:1px}
.font-heading{font-family:var(--font-heading)}
body{font-family:var(--font-body)}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}


# 3. app/(auth)/login/page.tsx (usa la ruta que ya tienes)

import { LoginForm } from "@/components/auth/LoginForm";
import { LiveClock } from "@/components/auth/LiveClock";

export default function LoginPage() {
  return (
    <main className="grid-bg relative flex min-h-screen flex-col items-center justify-center gap-7 px-5 py-24 text-[var(--text)]">
      <header className="anim-in absolute inset-x-8 top-7 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h5" /><path d="M17.5 17.5 16 16.3V14" /><circle cx="16" cy="16" r="6" />
          </svg>
          <span className="font-heading text-base font-semibold uppercase tracking-[.08em]">Portal de Horarios</span>
        </div>
        <LiveClock variant="date" />
      </header>

      <LiveClock variant="clock" />
      <LoginForm />

      <p className="anim-in absolute inset-x-5 bottom-6 text-center text-xs text-[var(--neutral-700)]" style={{ animationDelay: ".8s" }}>
        ¿Problemas para entrar? <a href="#" className="text-[var(--accent-700)] underline-offset-2 hover:text-[var(--accent-800)]">Contacta a Recursos Humanos</a>
      </p>
    </main>
  );
}

# 4a. components/auth/LiveClock.tsx

"use client";
import { useEffect, useState } from "react";

export function LiveClock({ variant }: { variant: "clock" | "date" }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  if (!now) return <div className={variant === "clock" ? "h-[130px]" : "h-4"} />;

  const p = (n: number) => String(n).padStart(2, "0");

  if (variant === "date")
    return (
      <span className="text-[11px] uppercase tracking-[.12em] text-[var(--neutral-700)]">
        {now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </span>
    );

  return (
    <div className="anim-up flex flex-col items-center gap-2">
      <div className="font-heading flex items-baseline text-[clamp(80px,14vw,120px)] font-semibold leading-[.9] tracking-[-.02em] tabular-nums">
        <span>{p(now.getHours())}</span>
        <span className="text-[var(--accent)]" style={{ animation: "blink 1s steps(1) infinite" }}>:</span>
        <span>{p(now.getMinutes())}</span>
      </div>
      <div className="relative h-[2px] w-[260px] max-w-full bg-[var(--divider)]">
        <div
          className="absolute inset-0 origin-left bg-[var(--accent)] transition-transform duration-1000 ease-linear"
          style={{ transform: `scaleX(${now.getSeconds() / 59})` }}
        />
      </div>
    </div>
  );
}

# 4b. components/auth/LoginForm.tsx

"use client";
import { useState, type FormEvent } from "react";

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
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const data = new FormData(e.currentTarget);
    try {
      // TODO: aquí va tu lógica de autenticación actual
      // await signIn({ user: data.get("user"), password: data.get("password") });
      await new Promise((r) => setTimeout(r, 1400));
      setDone(true);
      // router.push("/dashboard");
    } catch {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="anim-up relative w-full max-w-[420px] border border-[var(--divider)] bg-[var(--bg)] px-8 py-[30px]" style={{ animationDelay: ".2s" }}>
      <Corners />

      {!done ? (
        <>
          <div className="mb-[18px] flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-heading text-[30px] font-semibold leading-tight">Iniciar sesión</h1>
            <span className="bg-[var(--accent-100)] px-2.5 py-[3px] text-[11px] text-[var(--accent-800)]">Trabajadores · Supervisores</span>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
            <div className="anim-up" style={{ animationDelay: ".4s" }}>
              <label htmlFor="user" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">Código de empleado o correo</label>
              <input id="user" name="user" required className={inputCls} placeholder="EMP-0421 o nombre@empresa.com" />
            </div>

            <div className="anim-up" style={{ animationDelay: ".5s" }}>
              <label htmlFor="password" className="mb-[5px] block text-xs text-[rgba(29,31,32,.7)]">Contraseña</label>
              <div className="relative">
                <input id="password" name="password" required type={show ? "text" : "password"} className={`${inputCls} pr-[72px]`} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="font-heading absolute right-1 top-1/2 h-8 -translate-y-1/2 px-2 text-xs font-semibold uppercase tracking-[.08em] text-[var(--accent)] hover:bg-[rgba(89,128,166,.1)] active:bg-[rgba(89,128,166,.18)]"
                >
                  {show ? "Ocultar" : "Ver"}
                </button>
              </div>
            </div>

            <div className="anim-up flex flex-wrap items-center justify-between gap-2.5 text-[13px]" style={{ animationDelay: ".6s" }}>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" name="remember" className="h-[15px] w-[15px] accent-[var(--accent)]" /> Recordarme
              </label>
              <a href="#" className="text-[var(--accent-700)] hover:text-[var(--accent-800)]">¿Olvidaste tu contraseña?</a>
            </div>

            {error && <p className="anim-up text-[13px] text-[var(--accent-800)]">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="font-heading anim-up relative mt-1 flex h-[46px] w-full items-center justify-center gap-2 border border-[var(--accent)] bg-[var(--accent)] text-[17px] font-semibold tracking-[.03em] text-[var(--bg)] transition-colors hover:bg-[var(--accent-600)] active:bg-[var(--accent-700)] disabled:cursor-wait"
              style={{ animationDelay: ".7s" }}
            >
              <Corners />
              {loading ? (
                <>
                  <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
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
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: 40, animation: "draw .6s .1s both" }}>
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <h2 className="font-heading text-[30px] font-semibold">Sesión iniciada</h2>
          <p className="text-sm text-[rgba(29,31,32,.55)]">Cargando tu turno de hoy…</p>
          <div className="h-[3px] w-full bg-[var(--accent-100)]">
            <div className="h-full origin-left bg-[var(--accent)]" style={{ animation: "fill 1.6s cubic-bezier(.4,0,.2,1) both" }} />
          </div>
        </div>
      )}
    </div>
  );
}

