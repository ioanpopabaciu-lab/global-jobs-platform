import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { Locale, defaultLocale, locales } from "@/types";
import { getDictionary } from "@/i18n/config";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import MariaChat from "@/components/layout/MariaChat";

const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-montserrat",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const dict = await getDictionary(locale);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gjc.ro";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: dict.metadata.title,
      template: `%s | Global Jobs Consulting`,
    },
    description: dict.metadata.description,
    keywords: dict.metadata.keywords,
    authors: [{ name: "Global Jobs Consulting" }],
    creator: "Global Jobs Consulting",
    publisher: "Global Jobs Consulting",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: locale === "ro" ? "/" : `/${locale}`,
      languages: {
        "ro-RO": "/",
        "en-US": "/en",
        "de-AT": "/de",
        "sr-RS": "/sr",
        "ne-NP": "/ne",
        "bn-BD": "/bn",
        "hi-IN": "/hi",
        "si-LK": "/si",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ro" ? "ro_RO" : `${locale}_${locale.toUpperCase()}`,
      url: baseUrl,
      siteName: "Global Jobs Consulting",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Global Jobs Consulting",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.metadata.title,
      description: dict.metadata.description,
      images: ["/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate locale
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  
  // Load dictionary for the locale
  const dict = await getDictionary(validLocale);

  return (
    <html lang={validLocale} suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Navbar locale={validLocale} dict={dict} />
        <main className="min-h-screen pt-[120px]">{children}</main>
        <Footer locale={validLocale} dict={dict} />
        <WhatsAppButton />
        <MariaChat locale={validLocale} />
      </body>
    </html>
  );
}

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}
