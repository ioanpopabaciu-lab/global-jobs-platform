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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
  }
};

export default function ContactPage() {
  const { language } = useLanguage();
  const t = content[language] || content.ro;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API}/contact/submit`, {
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
      <Helmet>
        <title>Contact | Global Jobs Consulting</title>
        <meta name="description" content={(t && t.meta && t.meta.description) || ''} />
      </Helmet>

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
                              <Link to="/politica-confidentialitate" target="_blank" className="text-coral hover:underline font-medium">{t.form.privacyLink}</Link> *
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
