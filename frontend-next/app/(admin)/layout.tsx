import AdminShell from "@/components/admin/AdminShell";
import { Providers } from "@/components/providers/Providers";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>
          <AdminShell>{children}</AdminShell>
        </Providers>
      </body>
    </html>
  );
}
