import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Barlow, Barlow_Condensed } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const barlow = Barlow({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-body" });
const barlowCond = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Portal Horarios",
  description: "Dashboard de horarios, modalidad y disponibilidad del equipo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${barlow.variable} ${barlowCond.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
