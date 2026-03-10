import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { toast } from 'sonner';
import { Users, Building2, Clock, Shield } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const pageContent = {
  ro: {
    title: "Solicită Muncitori",
    subtitle: "Completați formularul și vă vom contacta în 24 de ore",
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
      { title: "Muncitori Verificați", desc: "Toți candidații sunt pre-selectați și verificați" },
      { title: "Proces Rapid", desc: "Livrare în 4-8 săptămâni" },
      { title: "Conformitate Legală", desc: "Gestionăm toate documentele legale" },
      { title: "Suport Complet", desc: "Asistență pe toată durata contractului" }
    ],
    success: "Cererea a fost trimisă cu succes! Vă vom contacta în curând.",
    error: "A apărut o eroare. Vă rugăm încercați din nou.",
    whyChoose: "De ce să alegeți GJC?",
    partners: "Parteneri",
    yearsExp: "Ani Experiență",
    markets: "Piețe"
  },
  en: {
    title: "Request Workers",
    subtitle: "Fill out the form and we'll contact you within 24 hours",
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
      { title: "Verified Workers", desc: "All candidates are pre-screened and verified" },
      { title: "Fast Process", desc: "Delivery in 4-8 weeks" },
      { title: "Legal Compliance", desc: "We handle all legal documentation" },
      { title: "Full Support", desc: "Assistance throughout the contract" }
    ],
    success: "Request submitted successfully! We'll contact you soon.",
    error: "An error occurred. Please try again.",
    whyChoose: "Why choose GJC?",
    partners: "Partners",
    yearsExp: "Years Experience",
    markets: "Markets"
  },
  de: {
    title: "Arbeitskräfte anfordern",
    subtitle: "Füllen Sie das Formular aus und wir kontaktieren Sie innerhalb von 24 Stunden",
    form: {
      companyName: "Firmenname",
      contactPerson: "Ansprechpartner",
      email: "E-Mail",
      phone: "Telefon",
      workersNeeded: "Anzahl benötigter Arbeiter",
      industry: "Branche",
      message: "Zusätzliche Nachricht (optional)",
      submit: "Anfrage senden",
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
      { title: "Verifizierte Arbeiter", desc: "Alle Kandidaten werden vorab geprüft" },
      { title: "Schneller Prozess", desc: "Lieferung in 4-8 Wochen" },
      { title: "Rechtliche Konformität", desc: "Wir kümmern uns um alle Dokumente" },
      { title: "Volle Unterstützung", desc: "Betreuung während der gesamten Vertragsdauer" }
    ],
    success: "Anfrage erfolgreich gesendet! Wir werden Sie bald kontaktieren.",
    error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    whyChoose: "Warum GJC wählen?",
    partners: "Partner",
    yearsExp: "Jahre Erfahrung",
    markets: "Märkte"
  },
  sr: {
    title: "Zatražite radnike",
    subtitle: "Popunite formular i kontaktiraćemo vas u roku od 24 sata",
    form: {
      companyName: "Naziv kompanije",
      contactPerson: "Kontakt osoba",
      email: "E-pošta",
      phone: "Telefon",
      workersNeeded: "Broj potrebnih radnika",
      industry: "Industrija",
      message: "Dodatna poruka (opciono)",
      submit: "Pošalji zahtev",
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
      { title: "Verifikovani radnici", desc: "Svi kandidati su prethodno provereni" },
      { title: "Brz proces", desc: "Isporuka za 4-8 nedelja" },
      { title: "Pravna usklađenost", desc: "Brinemo o svim dokumentima" },
      { title: "Puna podrška", desc: "Pomoć tokom celog ugovora" }
    ],
    success: "Zahtev uspešno poslat! Kontaktiraćemo vas uskoro.",
    error: "Došlo je do greške. Molimo pokušajte ponovo.",
    whyChoose: "Zašto izabrati GJC?",
    partners: "Partneri",
    yearsExp: "Godina iskustva",
    markets: "Tržišta"
  },
  ne: {
    title: "कामदारहरू अनुरोध गर्नुहोस्",
    subtitle: "फारम भर्नुहोस् र हामी २४ घण्टामा सम्पर्क गर्नेछौं",
    form: {
      companyName: "कम्पनीको नाम",
      contactPerson: "सम्पर्क व्यक्ति",
      email: "इमेल",
      phone: "फोन",
      workersNeeded: "आवश्यक कामदारहरूको संख्या",
      industry: "उद्योग",
      message: "थप सन्देश (वैकल्पिक)",
      submit: "अनुरोध पठाउनुहोस्",
      submitting: "पठाउँदै..."
    },
    industries: {
      construction: "निर्माण",
      hospitality: "होटल र रेस्टुरेन्ट",
      agriculture: "कृषि",
      manufacturing: "उत्पादन",
      logistics: "लजिस्टिक्स / गोदाम",
      other: "अन्य"
    },
    benefits: [
      { title: "प्रमाणित कामदारहरू", desc: "सबै उम्मेदवारहरू पूर्व-छानबिन गरिएका छन्" },
      { title: "छिटो प्रक्रिया", desc: "४-८ हप्तामा डेलिभरी" },
      { title: "कानूनी अनुपालन", desc: "हामी सबै कागजातहरू व्यवस्थापन गर्छौं" },
      { title: "पूर्ण सहयोग", desc: "सम्पूर्ण अनुबंध अवधिमा सहायता" }
    ],
    success: "अनुरोध सफलतापूर्वक पठाइयो! हामी चाँडै सम्पर्क गर्नेछौं।",
    error: "त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    whyChoose: "GJC किन छान्ने?",
    partners: "साझेदारहरू",
    yearsExp: "वर्षको अनुभव",
    markets: "बजारहरू"
  },
  bn: {
    title: "কর্মী অনুরোধ করুন",
    subtitle: "ফর্মটি পূরণ করুন এবং আমরা ২৪ ঘণ্টার মধ্যে যোগাযোগ করব",
    form: {
      companyName: "কোম্পানির নাম",
      contactPerson: "যোগাযোগ ব্যক্তি",
      email: "ইমেইল",
      phone: "ফোন",
      workersNeeded: "প্রয়োজনীয় কর্মীর সংখ্যা",
      industry: "শিল্প",
      message: "অতিরিক্ত বার্তা (ঐচ্ছিক)",
      submit: "অনুরোধ পাঠান",
      submitting: "পাঠানো হচ্ছে..."
    },
    industries: {
      construction: "নির্মাণ",
      hospitality: "হোটেল ও রেস্তোরাঁ",
      agriculture: "কৃষি",
      manufacturing: "উৎপাদন",
      logistics: "লজিস্টিক্স / গুদাম",
      other: "অন্যান্য"
    },
    benefits: [
      { title: "যাচাইকৃত কর্মী", desc: "সমস্ত প্রার্থী পূর্ব-স্ক্রিন করা হয়েছে" },
      { title: "দ্রুত প্রক্রিয়া", desc: "৪-৮ সপ্তাহে ডেলিভারি" },
      { title: "আইনি সম্মতি", desc: "আমরা সমস্ত নথি পরিচালনা করি" },
      { title: "সম্পূর্ণ সহায়তা", desc: "পুরো চুক্তি জুড়ে সহায়তা" }
    ],
    success: "অনুরোধ সফলভাবে পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।",
    error: "একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    whyChoose: "কেন GJC বেছে নেবেন?",
    partners: "অংশীদার",
    yearsExp: "বছরের অভিজ্ঞতা",
    markets: "বাজার"
  },
  hi: {
    title: "कर्मचारियों का अनुरोध करें",
    subtitle: "फॉर्म भरें और हम 24 घंटे में संपर्क करेंगे",
    form: {
      companyName: "कंपनी का नाम",
      contactPerson: "संपर्क व्यक्ति",
      email: "ईमेल",
      phone: "फोन",
      workersNeeded: "आवश्यक कर्मचारियों की संख्या",
      industry: "उद्योग",
      message: "अतिरिक्त संदेश (वैकल्पिक)",
      submit: "अनुरोध भेजें",
      submitting: "भेजा जा रहा है..."
    },
    industries: {
      construction: "निर्माण",
      hospitality: "होटल और रेस्टोरेंट",
      agriculture: "कृषि",
      manufacturing: "विनिर्माण",
      logistics: "लॉजिस्टिक्स / गोदाम",
      other: "अन्य"
    },
    benefits: [
      { title: "सत्यापित कर्मचारी", desc: "सभी उम्मीदवारों की पूर्व-जांच की जाती है" },
      { title: "तेज़ प्रक्रिया", desc: "4-8 सप्ताह में डिलीवरी" },
      { title: "कानूनी अनुपालन", desc: "हम सभी दस्तावेज़ संभालते हैं" },
      { title: "पूर्ण समर्थन", desc: "पूरे अनुबंध में सहायता" }
    ],
    success: "अनुरोध सफलतापूर्वक भेजा गया! हम जल्द संपर्क करेंगे।",
    error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    whyChoose: "GJC क्यों चुनें?",
    partners: "भागीदार",
    yearsExp: "वर्षों का अनुभव",
    markets: "बाज़ार"
  },
  si: {
    title: "සේවකයින් ඉල්ලන්න",
    subtitle: "ෆෝරමය පුරවන්න, අපි පැය 24ක් ඇතුළත සම්බන්ධ වෙමු",
    form: {
      companyName: "සමාගමේ නම",
      contactPerson: "සම්බන්ධතා පුද්ගලයා",
      email: "ඊමේල්",
      phone: "දුරකථනය",
      workersNeeded: "අවශ්‍ය සේවකයින් ගණන",
      industry: "කර්මාන්තය",
      message: "අමතර පණිවිඩය (විකල්ප)",
      submit: "ඉල්ලීම යවන්න",
      submitting: "යවමින්..."
    },
    industries: {
      construction: "ඉදිකිරීම්",
      hospitality: "හෝටල් සහ ආපන ශාලා",
      agriculture: "කෘෂිකර්මය",
      manufacturing: "නිෂ්පාදනය",
      logistics: "ප්‍රවාහනය / ගබඩා",
      other: "වෙනත්"
    },
    benefits: [
      { title: "සත්‍යාපිත සේවකයින්", desc: "සියලුම අපේක්ෂකයින් පෙර-පරීක්ෂා කර ඇත" },
      { title: "වේගවත් ක්‍රියාවලිය", desc: "සති 4-8 තුළ බෙදාහැරීම" },
      { title: "නීත්‍යානුකූල අනුකූලතාව", desc: "අපි සියලු ලේඛන හසුරුවමු" },
      { title: "සම්පූර්ණ සහාය", desc: "ගිවිසුම පුරාම සහාය" }
    ],
    success: "ඉල්ලීම සාර්ථකව යවන ලදී! අපි ඉක්මනින් සම්බන්ධ වෙමු.",
    error: "දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    whyChoose: "GJC තෝරන්නේ ඇයි?",
    partners: "හවුල්කරුවන්",
    yearsExp: "වසරවල පළපුරුද්ද",
    markets: "වෙළඳපොළ"
  }
};

const benefitIcons = [Users, Clock, Shield, Building2];

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-navy-900 mb-4">{t.title}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
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

          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-navy-900 mb-6">{t.whyChoose}</h2>
            
            {t.benefits.map((benefit, index) => {
              const Icon = benefitIcons[index];
              return (
                <Card key={index} className="border-l-4 border-l-coral">
                  <CardContent className="flex items-start gap-4 py-5">
                    <div className="p-3 bg-coral/10 rounded-lg">
                      <Icon className="h-6 w-6 text-coral" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-navy-900 mb-1">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            <div className="bg-navy-900 text-white rounded-xl p-6 mt-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-3xl font-bold text-coral">11</div>
                  <div className="text-sm text-gray-300">
                    {t.partners}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-coral">4+</div>
                  <div className="text-sm text-gray-300">
                    {t.yearsExp}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-coral">3</div>
                  <div className="text-sm text-gray-300">
                    {t.markets}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
