"use client";

import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";
import ProtectedLayout from "@/components/layout/ProtectedLayout";
import AdminShell from "@/components/admin/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>
          <ProtectedLayout allowedRoles={["admin"]}>
            <AdminShell>{children}</AdminShell>
          </ProtectedLayout>
        </Providers>
      </body>
    </html>
  );
}
