"use client";

import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";
import ProtectedLayout from "@/components/layout/ProtectedLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>
          <ProtectedLayout allowedRoles={["admin"]}>{children}</ProtectedLayout>
        </Providers>
      </body>
    </html>
  );
}
