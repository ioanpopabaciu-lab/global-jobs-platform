import "@/app/globals.css";
import { Providers } from "@/components/providers/Providers";

export default function AuthCallbackLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
