import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://gjc.ro'),
  title: {
    default: "Global Jobs Consulting | Recrutare Internațională",
    template: "%s | Global Jobs Consulting",
  },
  description: "Agenție de recrutare internațională specializată în plasarea forței de muncă din Asia și Africa pe piețele europene.",
  keywords: ["recrutare internațională", "muncitori asia", "muncitori africa", "staffing România", "agenție recrutare"],
  authors: [{ name: "Global Jobs Consulting" }],
  creator: "Global Jobs Consulting",
  publisher: "Global Jobs Consulting",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://gjc.ro",
    siteName: "Global Jobs Consulting",
    title: "Global Jobs Consulting | Recrutare Internațională",
    description: "Agenție de recrutare internațională specializată în plasarea forței de muncă din Asia și Africa pe piețele europene.",
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
    title: "Global Jobs Consulting | Recrutare Internațională",
    description: "Agenție de recrutare internațională specializată în plasarea forței de muncă din Asia și Africa pe piețele europene.",
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
