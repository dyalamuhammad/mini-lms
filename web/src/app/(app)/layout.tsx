import { Suspense, ReactNode } from "react";
import AppShell from "@/components/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-slate-500">
          Memuat...
        </div>
      }
    >
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
