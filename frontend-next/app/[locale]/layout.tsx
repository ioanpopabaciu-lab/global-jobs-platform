import { Locale } from '@/types';
import { getDictionary } from '@/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Load dictionary for the locale
  const dict = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}

// Generate static params for all locales
export function generateStaticParams() {
  return [
    { locale: 'ro' },
    { locale: 'en' },
    { locale: 'de' },
    { locale: 'sr' },
    { locale: 'ne' },
    { locale: 'bn' },
    { locale: 'hi' },
    { locale: 'si' },
  ];
}
