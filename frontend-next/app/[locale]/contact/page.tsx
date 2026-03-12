import Image from "next/image";
import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Locale, locales, defaultLocale } from "@/types";
import { getDictionary } from "@/i18n/config";
import ContactForm from "@/components/forms/ContactForm";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Contact | Global Jobs Consulting",
    en: "Contact | Global Jobs Consulting",
    de: "Kontakt | Global Jobs Consulting",
    sr: "Kontakt | Global Jobs Consulting",
    ne: "सम्पर्क | Global Jobs Consulting",
    bn: "যোগাযোগ | Global Jobs Consulting",
    hi: "संपर्क | Global Jobs Consulting",
    si: "සම්බන්ධ වන්න | Global Jobs Consulting"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Contact Global Jobs Consulting - Your partner for international workforce recruitment.",
  };
}

const pageContent = {
  ro: {
    hero: {
      title: "Contactați-ne",
      subtitle: "Suntem aici pentru a vă ajuta. Completați formularul sau contactați-ne direct."
    },
    info: {
      address: { label: "Adresă", value: "Str. Parcul Traian nr. 1, ap. 10, Oradea, România" },
      phone: { label: "Telefon", value: "+40 732 403 464" },
      email: { label: "Email", value: "office@gjc.ro" },
      hours: { label: "Program", value: "Luni - Vineri: 09:00 - 18:00" }
    },
    form: {
      title: "Trimite-ne un mesaj",
      name: "Nume complet",
      email: "Email",
      phone: "Telefon (opțional)",
      subject: "Subiect",
      message: "Mesaj",
      submit: "Trimite mesaj",
      success: "Mesajul a fost trimis cu succes!",
      error: "A apărut o eroare. Vă rugăm încercați din nou."
    }
  },
  en: {
    hero: {
      title: "Contact Us",
      subtitle: "We're here to help. Fill out the form or contact us directly."
    },
    info: {
      address: { label: "Address", value: "Str. Parcul Traian nr. 1, ap. 10, Oradea, Romania" },
      phone: { label: "Phone", value: "+40 732 403 464" },
      email: { label: "Email", value: "office@gjc.ro" },
      hours: { label: "Hours", value: "Monday - Friday: 09:00 - 18:00" }
    },
    form: {
      title: "Send us a message",
      name: "Full name",
      email: "Email",
      phone: "Phone (optional)",
      subject: "Subject",
      message: "Message",
      submit: "Send message",
      success: "Message sent successfully!",
      error: "An error occurred. Please try again."
    }
  }
};

export default async function ContactPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const t = pageContent[validLocale as keyof typeof pageContent] || pageContent.ro;
  const dict = await getDictionary(validLocale);

  return (
    <div data-testid="contact-page">
      {/* Hero */}
      <section className="relative py-20 bg-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?q=80&w=2074" alt="" fill className="object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">{t.hero.title}</h1>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">{t.hero.subtitle}</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-bold text-navy-900 mb-8">{dict.contact.label}</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-coral/10 rounded-xl">
                    <MapPin className="h-6 w-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{t.info.address.label}</h3>
                    <p className="text-gray-600">{t.info.address.value}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-coral/10 rounded-xl">
                    <Phone className="h-6 w-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{t.info.phone.label}</h3>
                    <a href="tel:+40732403464" className="text-gray-600 hover:text-coral">{t.info.phone.value}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-coral/10 rounded-xl">
                    <Mail className="h-6 w-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{t.info.email.label}</h3>
                    <a href="mailto:office@gjc.ro" className="text-gray-600 hover:text-coral">{t.info.email.value}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-coral/10 rounded-xl">
                    <Clock className="h-6 w-6 text-coral" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900">{t.info.hours.label}</h3>
                    <p className="text-gray-600">{t.info.hours.value}</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="mt-8">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2718.9123!2d21.9234!3d47.0456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDAyJzQ0LjIiTiAyMcKwNTUnMjQuMiJF!5e0!3m2!1sen!2sro!4v1234567890"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-2xl"
                ></iframe>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">{t.form.title}</h2>
              <ContactForm locale={validLocale} translations={t.form} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
