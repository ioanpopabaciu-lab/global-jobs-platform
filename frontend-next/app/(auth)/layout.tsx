import type { Metadata } from "next";
import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Authentication | Global Jobs Consulting",
  description: "Sign in or create an account with Global Jobs Consulting",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
