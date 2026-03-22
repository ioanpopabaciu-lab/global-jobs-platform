import type { Metadata } from 'next';
import { Locale, locales } from '@/types';
import { getDictionary } from '@/i18n/config';
import HowItWorksClient from './HowItWorksClient';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const dict = await getDictionary(locale);
  return {
    title: dict.howItWorks.title + ' | Global Jobs Consulting',
    description: dict.howItWorks.subtitle,
  };
}

export default async function Page({ params: { locale } }: { params: { locale: Locale } }) {
  const dict = await getDictionary(locale);
  return <HowItWorksClient dict={dict} />;
}