import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ContactPage() {
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

      if (!response.ok) throw new Error("Eroare la trimitere");

      toast.success("Mesajul a fost trimis cu succes!");
      setSubmitted(true);
      reset();
    } catch (error) {
      toast.error("A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | Global Jobs Consulting</title>
        <meta name="description" content="Contactați Global Jobs Consulting pentru servicii de recrutare internațională. Sediu în Oradea, România. Telefon: +40 732 403 464." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="contact-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm  tracking-wider">
                Contact
              </span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold  mt-2 mb-4">
                CONTACTAȚI-NE
              </h1>
              <p className="text-navy-200 text-lg">
                Suntem aici să vă ajutăm cu toate întrebările despre recrutare 
                internațională. Trimiteți-ne un mesaj sau sunați-ne direct.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900  mb-6">
                    Informații Contact
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded">
                        <MapPin className="h-5 w-5 text-navy-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">Adresă</h4>
                        <p className="text-gray-600 text-sm">
                          Str. Parcul Traian nr. 1, ap. 10<br />
                          Oradea, România
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded">
                        <Phone className="h-5 w-5 text-navy-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">Telefon</h4>
                        <a href="tel:+40732403464" className="text-navy-600 hover:underline">
                          +40 732 403 464
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded">
                        <Mail className="h-5 w-5 text-navy-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">Email</h4>
                        <a href="mailto:office@gjc.ro" className="text-navy-600 hover:underline">
                          office@gjc.ro
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-navy-50 rounded">
                        <Clock className="h-5 w-5 text-navy-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-800">Program</h4>
                        <p className="text-gray-600 text-sm">
                          Luni - Vineri: 09:00 - 18:00<br />
                          Sâmbătă - Duminică: Închis
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card className="shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2715.9741087645296!2d21.9185!3d47.0465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDAyJzQ3LjQiTiAyMcKwNTUnMDYuNiJF!5e0!3m2!1sen!2sro!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Global Jobs Consulting Location"
                  ></iframe>
                </div>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <Card className="shadow-sm">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold text-navy-900  mb-4">
                      Mesaj Trimis cu Succes!
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Mulțumim pentru mesaj! Vă vom răspunde în cel mai scurt timp posibil.
                    </p>
                    <Button
                      onClick={() => setSubmitted(false)}
                      className="bg-coral hover:bg-red-600"
                      data-testid="send-another-btn"
                    >
                      Trimite alt mesaj
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-sm">
                  <CardContent className="p-8">
                    <h2 className="font-heading text-2xl font-bold text-navy-900  mb-6">
                      Trimite-ne un Mesaj
                    </h2>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nume Complet *</Label>
                          <Input
                            id="name"
                            {...register("name", { required: "Câmp obligatoriu" })}
                            data-testid="input-name"
                          />
                          {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            {...register("email", { 
                              required: "Câmp obligatoriu",
                              pattern: { value: /^\S+@\S+$/i, message: "Email invalid" }
                            })}
                            data-testid="input-email"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Telefon *</Label>
                          <Input
                            id="phone"
                            {...register("phone", { required: "Câmp obligatoriu" })}
                            data-testid="input-phone"
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="subject">Subiect *</Label>
                          <Input
                            id="subject"
                            {...register("subject", { required: "Câmp obligatoriu" })}
                            data-testid="input-subject"
                          />
                          {errors.subject && (
                            <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Mesaj *</Label>
                        <Textarea
                          id="message"
                          rows={6}
                          placeholder="Descrieți pe scurt motivul contactării..."
                          {...register("message", { 
                            required: "Câmp obligatoriu",
                            minLength: { value: 10, message: "Minim 10 caractere" }
                          })}
                          data-testid="textarea-message"
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-coral hover:bg-red-600 text-white h-12 font-semibold"
                        data-testid="submit-contact-form"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Se trimite...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-5 w-5" />
                            Trimite Mesajul
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
