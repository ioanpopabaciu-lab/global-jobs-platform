import ProtectedLayout from "@/components/layout/ProtectedLayout";
import { Providers } from "@/components/providers/Providers";
import "@/app/globals.css";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>
          <ProtectedLayout>{children}</ProtectedLayout>
        </Providers>
      </body>
    </html>
  );
}
