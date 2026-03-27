import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";
import SEOHead from "@/components/SEOHead";

const API = `/api`;

const content = {
  ro: {
    meta: { title: "Contact | Global Jobs Consulting", description: "Contactați Global Jobs Consulting pentru servicii de recrutare internațională." },
    hero: { label: "Contact", title: "Hai să Discutăm", description: "Fie că ești angajator în căutarea de personal sau candidat în căutarea unei oportunități, suntem aici să te ajutăm." },
    info: {
      title: "Informații Contact",
      address: "Adresă",
      phone: "Telefon",
      email: "Email",
      schedule: "Program",
      scheduleValue: "Luni - Vineri: 09:00 - 18:00\nSâmbătă - Duminică: Închis",
      fiscal: "Date Fiscale"
    },
    form: {
      title: "Trimite-ne un Mesaj",
      name: "Nume Complet",
      namePlaceholder: "Ion Popescu",
      email: "Email",
      emailPlaceholder: "ion@exemplu.ro",
      phone: "Telefon",
      phonePlaceholder: "+40 7XX XXX XXX",
      subject: "Subiect",
      subjectPlaceholder: "Despre ce doriți să discutăm?",
      message: "Mesaj",
      messagePlaceholder: "Descrieți pe scurt motivul contactării...",
      privacy: "Sunt de acord cu",
      privacyLink: "Politica de Confidențialitate",
      send: "Trimite Mesajul",
      sending: "Se trimite...",
      required: "Câmp obligatoriu",
      invalidEmail: "Email invalid",
      minChars: "Minim 10 caractere",
      privacyRequired: "Trebuie să acceptați Politica de Confidențialitate"
    },
    success: { title: "Mesaj Trimis cu Succes!", text: "Mulțumim pentru mesaj! Vă vom contacta în cel mai scurt timp posibil.", newMessage: "Trimite alt mesaj" },
    toast: { success: "Mesajul a fost trimis cu succes!", error: "A apărut o eroare. Vă rugăm încercați din nou." }
  },
  en: {
    meta: { title: "Contact | Global Jobs Consulting", description: "Contact Global Jobs Consulting for international recruitment services." },
    hero: { label: "Contact", title: "Let's Talk", description: "Whether you're an employer looking for staff or a candidate looking for an opportunity, we're here to help." },
    info: {
      title: "Contact Information",
      address: "Address",
      phone: "Phone",
      email: "Email",
      schedule: "Schedule",
      scheduleValue: "Monday - Friday: 09:00 - 18:00\nSaturday - Sunday: Closed",
      fiscal: "Fiscal Data"
    },
    form: {
      title: "Send Us a Message",
      name: "Full Name",
      namePlaceholder: "John Smith",
      email: "Email",
      emailPlaceholder: "john@example.com",
      phone: "Phone",
      phonePlaceholder: "+40 7XX XXX XXX",
      subject: "Subject",
      subjectPlaceholder: "What would you like to discuss?",
      message: "Message",
      messagePlaceholder: "Briefly describe the reason for contacting us...",
      privacy: "I agree to the",
      privacyLink: "Privacy Policy",
      send: "Send Message",
      sending: "Sending...",
      required: "Required field",
      invalidEmail: "Invalid email",
      minChars: "Minimum 10 characters",
      privacyRequired: "You must accept the Privacy Policy"
    },
    success: { title: "Message Sent Successfully!", text: "Thank you for your message! We will contact you as soon as possible.", newMessage: "Send another message" },
    toast: { success: "Message sent successfully!", error: "An error occurred. Please try again." }
  },
  de: {
    meta: { title: "Kontakt | Global Jobs Consulting", description: "Kontaktieren Sie Global Jobs Consulting für internationale Rekrutierungsdienste." },
    hero: { label: "Kontakt", title: "Lassen Sie uns sprechen", description: "Ob Sie als Arbeitgeber Personal suchen oder als Kandidat eine Stelle suchen - wir sind hier, um Ihnen zu helfen." },
    info: {
      title: "Kontaktinformationen",
      address: "Adresse",
      phone: "Telefon",
      email: "E-Mail",
      schedule: "Öffnungszeiten",
      scheduleValue: "Montag - Freitag: 09:00 - 18:00\nSamstag - Sonntag: Geschlossen",
      fiscal: "Steuerdaten"
    },
    form: {
      title: "Senden Sie uns eine Nachricht",
      name: "Vollständiger Name",
      namePlaceholder: "Max Mustermann",
      email: "E-Mail",
      emailPlaceholder: "max@beispiel.de",
      phone: "Telefon",
      phonePlaceholder: "+40 7XX XXX XXX",
      subject: "Betreff",
      subjectPlaceholder: "Worüber möchten Sie sprechen?",
      message: "Nachricht",
      messagePlaceholder: "Beschreiben Sie kurz den Grund Ihrer Kontaktaufnahme...",
      privacy: "Ich stimme der",
      privacyLink: "Datenschutzrichtlinie zu",
      send: "Nachricht senden",
      sending: "Wird gesendet...",
      required: "Pflichtfeld",
      invalidEmail: "Ungültige E-Mail",
      minChars: "Mindestens 10 Zeichen",
      privacyRequired: "Sie müssen die Datenschutzrichtlinie akzeptieren"
    },
    success: { title: "Nachricht erfolgreich gesendet!", text: "Vielen Dank für Ihre Nachricht! Wir werden Sie so schnell wie möglich kontaktieren.", newMessage: "Weitere Nachricht senden" },
    toast: { success: "Nachricht erfolgreich gesendet!", error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut." }
  },
  sr: {
    meta: { title: "Kontakt | Global Jobs Consulting", description: "Kontaktirajte Global Jobs Consulting za međunarodne usluge zapošljavanja." },
    hero: { label: "Kontakt", title: "Hajde da razgovaramo", description: "Bilo da ste poslodavac u potrazi za osobljem ili kandidat u potrazi za prilikom, tu smo da vam pomognemo." },
    info: {
      title: "Kontakt informacije",
      address: "Adresa",
      phone: "Telefon",
      email: "Email",
      schedule: "Radno vreme",
      scheduleValue: "Ponedeljak - Petak: 09:00 - 18:00\nSubota - Nedelja: Zatvoreno",
      fiscal: "Fiskalni podaci"
    },
    form: {
      title: "Pošaljite nam poruku",
      name: "Puno ime",
      namePlaceholder: "Marko Marković",
      email: "Email",
      emailPlaceholder: "marko@primer.rs",
      phone: "Telefon",
      phonePlaceholder: "+40 7XX XXX XXX",
      subject: "Predmet",
      subjectPlaceholder: "O čemu biste želeli da razgovarate?",
      message: "Poruka",
      messagePlaceholder: "Ukratko opišite razlog kontaktiranja...",
      privacy: "Slažem se sa",
      privacyLink: "Politikom privatnosti",
      send: "Pošalji poruku",
      sending: "Slanje...",
      required: "Obavezno polje",
      invalidEmail: "Nevažeći email",
      minChars: "Minimum 10 karaktera",
      privacyRequired: "Morate prihvatiti Politiku privatnosti"
    },
    success: { title: "Poruka uspešno poslata!", text: "Hvala vam na poruci! Kontaktiraćemo vas u najkraćem mogućem roku.", newMessage: "Pošalji novu poruku" },
    toast: { success: "Poruka je uspešno poslata!", error: "Došlo je do greške. Molimo pokušajte ponovo." }
  },
  ne: {
    meta: { title: "सम्पर्क | Global Jobs Consulting", description: "अन्तर्राष्ट्रिय भर्ती सेवाहरूको लागि Global Jobs Consulting लाई सम्पर्क गर्नुहोस्।" },
    hero: { label: "सम्पर्क", title: "कुरा गरौं", description: "तपाईं कर्मचारी खोज्ने रोजगारदाता होस् वा अवसर खोज्ने उम्मेदवार, हामी मद्दत गर्न यहाँ छौं।" },
    info: {
      title: "सम्पर्क जानकारी",
      address: "ठेगाना",
      phone: "फोन",
      email: "इमेल",
      schedule: "समय तालिका",
      scheduleValue: "सोमबार - शुक्रबार: 09:00 - 18:00\nशनिबार - आइतबार: बन्द",
      fiscal: "कर डेटा"
    },
    form: {
      title: "हामीलाई सन्देश पठाउनुहोस्",
      name: "पूरा नाम",
      namePlaceholder: "राम श्रेष्ठ",
      email: "इमेल",
      emailPlaceholder: "ram@example.com",
      phone: "फोन",
      phonePlaceholder: "+977 98XX XXX XXX",
      subject: "विषय",
      subjectPlaceholder: "तपाईं के कुरा गर्न चाहनुहुन्छ?",
      message: "सन्देश",
      messagePlaceholder: "सम्पर्क गर्नुको कारण संक्षेपमा वर्णन गर्नुहोस्...",
      privacy: "म सहमत छु",
      privacyLink: "गोपनीयता नीति",
      send: "सन्देश पठाउनुहोस्",
      sending: "पठाउँदै...",
      required: "आवश्यक फिल्ड",
      invalidEmail: "अमान्य इमेल",
      minChars: "न्यूनतम १० अक्षर",
      privacyRequired: "तपाईंले गोपनीयता नीति स्वीकार गर्नुपर्छ"
    },
    success: { title: "सन्देश सफलतापूर्वक पठाइयो!", text: "तपाईंको सन्देशको लागि धन्यवाद! हामी सकेसम्म चाँडो सम्पर्क गर्नेछौं।", newMessage: "अर्को सन्देश पठाउनुहोस्" },
    toast: { success: "सन्देश सफलतापूर्वक पठाइयो!", error: "त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।" }
  },
  bn: {
    meta: { title: "যোগাযোগ | Global Jobs Consulting", description: "আন্তর্জাতিক নিয়োগ সেবার জন্য Global Jobs Consulting-এ যোগাযোগ করুন।" },
    hero: { label: "যোগাযোগ", title: "কথা বলি", description: "আপনি কর্মী খুঁজছেন এমন নিয়োগকর্তা হন বা সুযোগ খুঁজছেন এমন প্রার্থী, আমরা সাহায্য করতে এখানে আছি।" },
    info: {
      title: "যোগাযোগের তথ্য",
      address: "ঠিকানা",
      phone: "ফোন",
      email: "ইমেইল",
      schedule: "সময়সূচী",
      scheduleValue: "সোমবার - শুক্রবার: ০৯:০০ - ১৮:০০\nশনিবার - রবিবার: বন্ধ",
      fiscal: "আর্থিক তথ্য"
    },
    form: {
      title: "আমাদের একটি বার্তা পাঠান",
      name: "পূর্ণ নাম",
      namePlaceholder: "রহিম উদ্দিন",
      email: "ইমেইল",
      emailPlaceholder: "rahim@example.com",
      phone: "ফোন",
      phonePlaceholder: "+880 1XXX XXX XXX",
      subject: "বিষয়",
      subjectPlaceholder: "আপনি কী নিয়ে কথা বলতে চান?",
      message: "বার্তা",
      messagePlaceholder: "যোগাযোগের কারণ সংক্ষেপে বর্ণনা করুন...",
      privacy: "আমি সম্মত",
      privacyLink: "গোপনীয়তা নীতি",
      send: "বার্তা পাঠান",
      sending: "পাঠানো হচ্ছে...",
      required: "আবশ্যক ক্ষেত্র",
      invalidEmail: "অবৈধ ইমেইল",
      minChars: "সর্বনিম্ন ১০ অক্ষর",
      privacyRequired: "আপনাকে গোপনীয়তা নীতি গ্রহণ করতে হবে"
    },
    success: { title: "বার্তা সফলভাবে পাঠানো হয়েছে!", text: "আপনার বার্তার জন্য ধন্যবাদ! আমরা যত তাড়াতাড়ি সম্ভব যোগাযোগ করব।", newMessage: "আরেকটি বার্তা পাঠান" },
    toast: { success: "বার্তা সফলভাবে পাঠানো হয়েছে!", error: "একটি ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" }
  },
  hi: {
    meta: { title: "संपर्क | Global Jobs Consulting", description: "अंतर्राष्ट्रीय भर्ती सेवाओं के लिए Global Jobs Consulting से संपर्क करें।" },
    hero: { label: "संपर्क", title: "बात करें", description: "चाहे आप स्टाफ की तलाश में नियोक्ता हों या अवसर की तलाश में उम्मीदवार, हम मदद के लिए यहां हैं।" },
    info: {
      title: "संपर्क जानकारी",
      address: "पता",
      phone: "फोन",
      email: "ईमेल",
      schedule: "समय सारिणी",
      scheduleValue: "सोमवार - शुक्रवार: 09:00 - 18:00\nशनिवार - रविवार: बंद",
      fiscal: "राजकोषीय डेटा"
    },
    form: {
      title: "हमें एक संदेश भेजें",
      name: "पूरा नाम",
      namePlaceholder: "राम शर्मा",
      email: "ईमेल",
      emailPlaceholder: "ram@example.com",
      phone: "फोन",
      phonePlaceholder: "+91 98XX XXX XXX",
      subject: "विषय",
      subjectPlaceholder: "आप किस बारे में बात करना चाहते हैं?",
      message: "संदेश",
      messagePlaceholder: "संपर्क करने का कारण संक्षेप में बताएं...",
      privacy: "मैं सहमत हूं",
      privacyLink: "गोपनीयता नीति",
      send: "संदेश भेजें",
      sending: "भेजा जा रहा है...",
      required: "आवश्यक फ़ील्ड",
      invalidEmail: "अमान्य ईमेल",
      minChars: "न्यूनतम 10 अक्षर",
      privacyRequired: "आपको गोपनीयता नीति स्वीकार करनी होगी"
    },
    success: { title: "संदेश सफलतापूर्वक भेजा गया!", text: "आपके संदेश के लिए धन्यवाद! हम जल्द से जल्द संपर्क करेंगे।", newMessage: "एक और संदेश भेजें" },
    toast: { success: "संदेश सफलतापूर्वक भेजा गया!", error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।" }
  },
  si: {
    meta: { title: "සම්බන්ධතා | Global Jobs Consulting", description: "ජාත්‍යන්තර බඳවා ගැනීමේ සේවා සඳහා Global Jobs Consulting අමතන්න." },
    hero: { label: "සම්බන්ධතා", title: "කතා කරමු", description: "ඔබ කාර්ය මණ්ඩලය සොයන සේවා යෝජකයෙක් හෝ අවස්ථාවක් සොයන අපේක්ෂකයෙක් වුවද, අපි උදව් කිරීමට මෙහි සිටිමු." },
    info: {
      title: "සම්බන්ධතා තොරතුරු",
      address: "ලිපිනය",
      phone: "දුරකථනය",
      email: "ඊමේල්",
      schedule: "කාල සටහන",
      scheduleValue: "සඳුදා - සිකුරාදා: 09:00 - 18:00\nසෙනසුරාදා - ඉරිදා: වසා ඇත",
      fiscal: "බදු දත්ත"
    },
    form: {
      title: "අපට පණිවිඩයක් එවන්න",
      name: "සම්පූර්ණ නම",
      namePlaceholder: "කමල් පෙරේරා",
      email: "ඊමේල්",
      emailPlaceholder: "kamal@example.com",
      phone: "දුරකථනය",
      phonePlaceholder: "+94 7XX XXX XXX",
      subject: "මාතෘකාව",
      subjectPlaceholder: "ඔබ කුමක් ගැන කතා කිරීමට කැමතිද?",
      message: "පණිවිඩය",
      messagePlaceholder: "සම්බන්ධ වීමේ හේතුව කෙටියෙන් විස්තර කරන්න...",
      privacy: "මම එකඟ වෙමි",
      privacyLink: "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
      send: "පණිවිඩය යවන්න",
      sending: "යවමින්...",
      required: "අවශ්‍ය ක්ෂේත්‍රය",
      invalidEmail: "අවලංගු ඊමේල්",
      minChars: "අවම අක්ෂර 10",
      privacyRequired: "ඔබ පෞද්ගලිකත්ව ප්‍රතිපත්තිය පිළිගත යුතුය"
    },
    success: { title: "පණිවිඩය සාර්ථකව යවන ලදී!", text: "ඔබේ පණිවිඩයට ස්තුතියි! අපි හැකි ඉක්මනින් සම්බන්ධ වෙමු.", newMessage: "තවත් පණිවිඩයක් යවන්න" },
    toast: { success: "පණිවිඩය සාර්ථකව යවන ලදී!", error: "දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න." }
  }
};

export default function ContactPage() {
  const { language, getLocalizedPath } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Error");
      toast.success(t.toast.success);
      setSubmitted(true);
      reset();
    } catch (error) {
      toast.error(t.toast.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEOHead 
        title={t.meta.title}
        description={t.meta.description}
        language={language}
      />

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="contact-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-coral font-semibold text-sm tracking-wider">{t.hero.label}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mt-2 mb-4">{t.hero.title}</h1>
              <p className="text-navy-200 text-lg">{t.hero.description}</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900 mb-6">{t.info.title}</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded"><MapPin className="h-5 w-5 text-navy-600" /></div>
                      <div>
                        <h4 className="font-semibold text-navy-800">{t.info.address}</h4>
                        <p className="text-gray-600 text-sm">Str. Parcul Traian nr. 1, ap. 10<br />Oradea, România</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded"><Phone className="h-5 w-5 text-navy-600" /></div>
                      <div>
                        <h4 className="font-semibold text-navy-800">{t.info.phone}</h4>
                        <a href="tel:+40732403464" className="text-navy-600 hover:underline">+40 732 403 464</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded"><Mail className="h-5 w-5 text-navy-600" /></div>
                      <div>
                        <h4 className="font-semibold text-navy-800">{t.info.email}</h4>
                        <a href="mailto:office@gjc.ro" className="text-navy-600 hover:underline">office@gjc.ro</a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded"><Clock className="h-5 w-5 text-navy-600" /></div>
                      <div>
                        <h4 className="font-semibold text-navy-800">{t.info.schedule}</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">{t.info.scheduleValue}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fiscal Data */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-navy-800 mb-2">{t.info.fiscal}</h4>
                    <p className="text-gray-600 text-sm">CUI: 48270947<br />J05/1458/2023</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardContent className="p-8">
                  {submitted ? (
                    <div className="text-center py-12" data-testid="contact-success">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-navy-900 mb-2">{t.success.title}</h3>
                      <p className="text-gray-600 mb-6">{t.success.text}</p>
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">{t.success.newMessage}</Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-heading text-xl font-bold text-navy-900 mb-6">{t.form.title}</h3>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name">{t.form.name} *</Label>
                            <Input id="name" placeholder={t.form.namePlaceholder} {...register("name", { required: t.form.required })} data-testid="input-name" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                          </div>
                          <div>
                            <Label htmlFor="email">{t.form.email} *</Label>
                            <Input id="email" type="email" placeholder={t.form.emailPlaceholder} {...register("email", { required: t.form.required, pattern: { value: /^\S+@\S+$/i, message: t.form.invalidEmail } })} data-testid="input-email" />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="phone">{t.form.phone}</Label>
                            <Input id="phone" placeholder={t.form.phonePlaceholder} {...register("phone")} data-testid="input-phone" />
                          </div>
                          <div>
                            <Label htmlFor="subject">{t.form.subject} *</Label>
                            <Input id="subject" placeholder={t.form.subjectPlaceholder} {...register("subject", { required: t.form.required })} data-testid="input-subject" />
                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="message">{t.form.message} *</Label>
                          <Textarea id="message" rows={6} placeholder={t.form.messagePlaceholder} {...register("message", { required: t.form.required, minLength: { value: 10, message: t.form.minChars } })} data-testid="textarea-message" />
                          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                        </div>

                        {/* Privacy Policy Consent */}
                        <div className="flex items-start gap-3">
                          <input type="checkbox" id="privacy_consent" {...register("privacy_consent", { required: t.form.privacyRequired })} className="mt-1 h-4 w-4 rounded border-gray-300 text-coral focus:ring-coral" data-testid="checkbox-privacy" />
                          <div>
                            <Label htmlFor="privacy_consent" className="text-sm text-gray-600 cursor-pointer">
                              {t.form.privacy}{" "}
                              <Link to={getLocalizedPath("/politica-confidentialitate")} target="_blank" className="text-coral hover:underline font-medium">{t.form.privacyLink}</Link> *
                            </Label>
                            {errors.privacy_consent && <p className="text-red-500 text-sm mt-1">{errors.privacy_consent.message}</p>}
                          </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting} className="w-full bg-coral hover:bg-red-600 text-white rounded-full py-6" data-testid="submit-contact-form">
                          {isSubmitting ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" />{t.form.sending}</>
                          ) : (
                            <><Send className="mr-2 h-5 w-5" />{t.form.send}</>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
