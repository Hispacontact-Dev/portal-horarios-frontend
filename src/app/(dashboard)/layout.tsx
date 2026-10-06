import type { ReactNode } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[232px_minmax(0,1fr)] bg-[var(--bg)] text-[var(--text)]">
      <Sidebar />
      <main className="flex min-w-0 flex-col gap-[22px] px-9 py-7">{children}</main>
    </div>
  );
}
