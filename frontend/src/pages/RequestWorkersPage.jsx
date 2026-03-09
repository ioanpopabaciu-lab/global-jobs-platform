import { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { CheckCircle, Users, Building2, Clock, Shield } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const pageContent = {
  ro: {
    title: "Solicită Muncitori",
    subtitle: "Completați formularul și vă vom contacta în 24 de ore",
    metaTitle: "Solicită Muncitori Internaționali | Global Jobs Consulting",
    metaDescription: "Găsiți muncitori calificați din Asia și Africa pentru compania dumneavoastră. Completați formularul pentru o ofertă personalizată.",
    form: {
      companyName: "Numele Companiei",
      contactPerson: "Persoană de Contact",
      email: "Email",
      phone: "Telefon",
      workersNeeded: "Număr de Muncitori Necesari",
      industry: "Industrie",
      message: "Mesaj Adițional (opțional)",
      submit: "Trimite Cererea",
      submitting: "Se trimite..."
    },
    industries: {
      construction: "Construcții",
      hospitality: "HoReCa (Hoteluri, Restaurante)",
      agriculture: "Agricultură",
      manufacturing: "Producție",
      logistics: "Logistică / Depozite",
      other: "Altele"
    },
    benefits: [
      { icon: Users, title: "Muncitori Verificați", desc: "Toți candidații sunt pre-selectați și verificați" },
      { icon: Clock, title: "Proces Rapid", desc: "Livrare în 4-8 săptămâni" },
      { icon: Shield, title: "Conformitate Legală", desc: "Gestionăm toate documentele legale" },
      { icon: Building2, title: "Suport Complet", desc: "Asistență pe toată durata contractului" }
    ],
    success: "Cererea a fost trimisă cu succes! Vă vom contacta în curând.",
    error: "A apărut o eroare. Vă rugăm încercați din nou."
  },
  en: {
    title: "Request Workers",
    subtitle: "Fill out the form and we'll contact you within 24 hours",
    metaTitle: "Request International Workers | Global Jobs Consulting",
    metaDescription: "Find qualified workers from Asia and Africa for your company. Complete the form for a personalized offer.",
    form: {
      companyName: "Company Name",
      contactPerson: "Contact Person",
      email: "Email",
      phone: "Phone",
      workersNeeded: "Number of Workers Needed",
      industry: "Industry",
      message: "Additional Message (optional)",
      submit: "Submit Request",
      submitting: "Submitting..."
    },
    industries: {
      construction: "Construction",
      hospitality: "HoReCa (Hotels, Restaurants)",
      agriculture: "Agriculture",
      manufacturing: "Manufacturing",
      logistics: "Logistics / Warehouses",
      other: "Other"
    },
    benefits: [
      { icon: Users, title: "Verified Workers", desc: "All candidates are pre-screened and verified" },
      { icon: Clock, title: "Fast Process", desc: "Delivery in 4-8 weeks" },
      { icon: Shield, title: "Legal Compliance", desc: "We handle all legal documentation" },
      { icon: Building2, title: "Full Support", desc: "Assistance throughout the contract" }
    ],
    success: "Request submitted successfully! We'll contact you soon.",
    error: "An error occurred. Please try again."
  },
  de: {
    title: "Arbeiter Anfordern",
    subtitle: "Füllen Sie das Formular aus und wir kontaktieren Sie innerhalb von 24 Stunden",
    metaTitle: "Internationale Arbeiter Anfordern | Global Jobs Consulting",
    metaDescription: "Finden Sie qualifizierte Arbeiter aus Asien und Afrika für Ihr Unternehmen.",
    form: {
      companyName: "Firmenname",
      contactPerson: "Kontaktperson",
      email: "E-Mail",
      phone: "Telefon",
      workersNeeded: "Anzahl benötigter Arbeiter",
      industry: "Branche",
      message: "Zusätzliche Nachricht (optional)",
      submit: "Anfrage Senden",
      submitting: "Wird gesendet..."
    },
    industries: {
      construction: "Bauwesen",
      hospitality: "HoReCa (Hotels, Restaurants)",
      agriculture: "Landwirtschaft",
      manufacturing: "Produktion",
      logistics: "Logistik / Lager",
      other: "Andere"
    },
    benefits: [
      { icon: Users, title: "Geprüfte Arbeiter", desc: "Alle Kandidaten werden vorab geprüft" },
      { icon: Clock, title: "Schneller Prozess", desc: "Lieferung in 4-8 Wochen" },
      { icon: Shield, title: "Rechtliche Konformität", desc: "Wir kümmern uns um alle Dokumente" },
      { icon: Building2, title: "Volle Unterstützung", desc: "Betreuung während der gesamten Vertragslaufzeit" }
    ],
    success: "Anfrage erfolgreich gesendet! Wir werden Sie bald kontaktieren.",
    error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
  },
  sr: {
    title: "Zatražite Radnike",
    subtitle: "Popunite formular i kontaktiraćemo vas u roku od 24 sata",
    metaTitle: "Zatražite Međunarodne Radnike | Global Jobs Consulting",
    metaDescription: "Pronađite kvalifikovane radnike iz Azije i Afrike za vašu kompaniju.",
    form: {
      companyName: "Naziv Kompanije",
      contactPerson: "Kontakt Osoba",
      email: "Email",
      phone: "Telefon",
      workersNeeded: "Broj Potrebnih Radnika",
      industry: "Industrija",
      message: "Dodatna Poruka (opciono)",
      submit: "Pošalji Zahtev",
      submitting: "Slanje..."
    },
    industries: {
      construction: "Građevinarstvo",
      hospitality: "HoReCa (Hoteli, Restorani)",
      agriculture: "Poljoprivreda",
      manufacturing: "Proizvodnja",
      logistics: "Logistika / Skladišta",
      other: "Ostalo"
    },
    benefits: [
      { icon: Users, title: "Provereni Radnici", desc: "Svi kandidati su prethodno provereni" },
      { icon: Clock, title: "Brz Proces", desc: "Isporuka za 4-8 nedelja" },
      { icon: Shield, title: "Pravna Usklađenost", desc: "Brinemo o svim dokumentima" },
      { icon: Building2, title: "Puna Podrška", desc: "Pomoć tokom celog ugovora" }
    ],
    success: "Zahtev uspešno poslat! Kontaktiraćemo vas uskoro.",
    error: "Došlo je do greške. Pokušajte ponovo."
  }
};

export default function RequestWorkersPage() {
  const { language } = useLanguage();
  const t = pageContent[language || 'ro'] || pageContent.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    workersNeeded: '',
    industry: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/leads/request-workers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(t.success);
        setFormData({
          companyName: '',
          contactPerson: '',
          email: '',
          phone: '',
          workersNeeded: '',
          industry: '',
          message: ''
        });
      } else {
        toast.error(t.error);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(t.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">{t.title}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Form */}
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-navy-900">{t.title}</CardTitle>
                <CardDescription>{t.subtitle}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="companyName">{t.form.companyName} *</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactPerson">{t.form.contactPerson} *</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">{t.form.email} *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.form.phone} *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="workersNeeded">{t.form.workersNeeded} *</Label>
                      <Input
                        id="workersNeeded"
                        name="workersNeeded"
                        type="number"
                        min="1"
                        value={formData.workersNeeded}
                        onChange={handleChange}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">{t.form.industry} *</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => setFormData({ ...formData, industry: value })}
                        required
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="construction">{t.industries.construction}</SelectItem>
                          <SelectItem value="hospitality">{t.industries.hospitality}</SelectItem>
                          <SelectItem value="agriculture">{t.industries.agriculture}</SelectItem>
                          <SelectItem value="manufacturing">{t.industries.manufacturing}</SelectItem>
                          <SelectItem value="logistics">{t.industries.logistics}</SelectItem>
                          <SelectItem value="other">{t.industries.other}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message">{t.form.message}</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-coral hover:bg-red-600 text-white rounded-full py-6 text-lg font-semibold"
                  >
                    {isSubmitting ? t.form.submitting : t.form.submit}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-navy-900 mb-6">
                {language === 'ro' ? 'De ce să alegeți GJC?' : 
                 language === 'en' ? 'Why choose GJC?' :
                 language === 'de' ? 'Warum GJC wählen?' : 'Zašto izabrati GJC?'}
              </h2>
              
              {t.benefits.map((benefit, index) => (
                <Card key={index} className="border-l-4 border-l-coral">
                  <CardContent className="flex items-start gap-4 py-5">
                    <div className="p-3 bg-coral/10 rounded-lg">
                      <benefit.icon className="h-6 w-6 text-coral" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Trust indicators */}
              <div className="bg-navy-900 text-white rounded-xl p-6 mt-8">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-coral">11</div>
                    <div className="text-sm text-gray-300">
                      {language === 'ro' ? 'Parteneri' : 'Partners'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-coral">4+</div>
                    <div className="text-sm text-gray-300">
                      {language === 'ro' ? 'Ani Experiență' : 'Years Experience'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-coral">3</div>
                    <div className="text-sm text-gray-300">
                      {language === 'ro' ? 'Piețe' : 'Markets'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
