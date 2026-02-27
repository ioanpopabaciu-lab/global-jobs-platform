import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, FileCheck, CheckCircle2, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const industries = [
  { value: "horeca", label: "HoReCa (Hoteluri, Restaurante, Catering)" },
  { value: "constructii", label: "Construcții" },
  { value: "agricultura", label: "Agricultură" },
  { value: "depozite", label: "Depozite & Logistică" },
  { value: "productie", label: "Producție" },
  { value: "servicii", label: "Servicii" },
  { value: "altele", label: "Altele" },
];

const qualifications = [
  { value: "necalificat", label: "Personal Necalificat" },
  { value: "semicalificat", label: "Personal Semicalificat" },
  { value: "calificat", label: "Personal Calificat" },
  { value: "inalt_calificat", label: "Personal Înalt Calificat" },
];

export default function EmployersPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API}/employers/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Eroare la trimitere");

      toast.success("Formularul a fost trimis cu succes!");
      setSubmitted(true);
      reset();
    } catch (error) {
      toast.error("A apărut o eroare. Vă rugăm încercați din nou.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg p-12 shadow-sm">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <h1 className="font-heading text-3xl font-bold text-navy-900 uppercase mb-4">
                Mulțumim pentru Solicitare!
              </h1>
              <p className="text-gray-600 mb-8">
                Am primit cererea dumneavoastră și un consultant va lua legătura cu dvs. 
                în cel mai scurt timp posibil pentru a discuta nevoile de recrutare.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-navy-900 hover:bg-navy-800"
                data-testid="submit-another-btn"
              >
                Trimite o altă solicitare
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Pentru Angajatori | Global Jobs Consulting</title>
        <meta name="description" content="Solicitați forță de muncă din Asia și Africa pentru compania dumneavoastră din România, Austria sau Serbia." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="employers-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-16 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <span className="text-navy-300 font-medium text-sm uppercase tracking-wider">
                Pentru Angajatori
              </span>
              <h1 className="font-heading text-4xl md:text-5xl font-black uppercase mt-2 mb-4">
                SOLICITAȚI FORȚĂ DE MUNCĂ
              </h1>
              <p className="text-navy-200 text-lg">
                Completați formularul de mai jos și un consultant dedicat vă va contacta 
                pentru a discuta cerințele specifice ale proiectului dumneavoastră.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl text-navy-900 uppercase">
                    Formular de Solicitare
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Company Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Informații Companie
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="company_name">Nume Companie *</Label>
                          <Input
                            id="company_name"
                            {...register("company_name", { required: "Câmp obligatoriu" })}
                            data-testid="input-company-name"
                          />
                          {errors.company_name && (
                            <p className="text-red-500 text-sm mt-1">{errors.company_name.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="contact_person">Persoană de Contact *</Label>
                          <Input
                            id="contact_person"
                            {...register("contact_person", { required: "Câmp obligatoriu" })}
                            data-testid="input-contact-person"
                          />
                          {errors.contact_person && (
                            <p className="text-red-500 text-sm mt-1">{errors.contact_person.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

                      <div>
                        <Label htmlFor="country">Locația Proiectului *</Label>
                        <Select onValueChange={(value) => setValue("country", value)}>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Selectați țara" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RO">România</SelectItem>
                            <SelectItem value="AT">Austria</SelectItem>
                            <SelectItem value="RS">Serbia</SelectItem>
                          </SelectContent>
                        </Select>
                        <input type="hidden" {...register("country", { required: true })} />
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Cerințe Personal
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="industry">Domeniu de Activitate *</Label>
                          <Select onValueChange={(value) => setValue("industry", value)}>
                            <SelectTrigger data-testid="select-industry">
                              <SelectValue placeholder="Selectați domeniul" />
                            </SelectTrigger>
                            <SelectContent>
                              {industries.map((ind) => (
                                <SelectItem key={ind.value} value={ind.value}>
                                  {ind.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("industry", { required: true })} />
                        </div>
                        <div>
                          <Label htmlFor="workers_needed">Număr de Muncitori *</Label>
                          <Input
                            id="workers_needed"
                            type="number"
                            min="1"
                            {...register("workers_needed", { 
                              required: "Câmp obligatoriu",
                              valueAsNumber: true,
                              min: { value: 1, message: "Minim 1 muncitor" }
                            })}
                            data-testid="input-workers-needed"
                          />
                          {errors.workers_needed && (
                            <p className="text-red-500 text-sm mt-1">{errors.workers_needed.message}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="qualification_type">Tip Calificare *</Label>
                          <Select onValueChange={(value) => setValue("qualification_type", value)}>
                            <SelectTrigger data-testid="select-qualification">
                              <SelectValue placeholder="Selectați calificarea" />
                            </SelectTrigger>
                            <SelectContent>
                              {qualifications.map((qual) => (
                                <SelectItem key={qual.value} value={qual.value}>
                                  {qual.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <input type="hidden" {...register("qualification_type", { required: true })} />
                        </div>
                        <div>
                          <Label htmlFor="salary_offered">Salariu Oferit (EUR/lună) *</Label>
                          <Input
                            id="salary_offered"
                            placeholder="ex: 800-1200 EUR"
                            {...register("salary_offered", { required: "Câmp obligatoriu" })}
                            data-testid="input-salary"
                          />
                          {errors.salary_offered && (
                            <p className="text-red-500 text-sm mt-1">{errors.salary_offered.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Logistics */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-navy-800 flex items-center gap-2">
                        <FileCheck className="h-5 w-5" />
                        Logistică Asigurată
                      </h3>

                      <div className="flex flex-wrap gap-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="accommodation_provided"
                            onCheckedChange={(checked) => setValue("accommodation_provided", checked)}
                            data-testid="checkbox-accommodation"
                          />
                          <Label htmlFor="accommodation_provided" className="cursor-pointer">
                            Cazare asigurată
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="meals_provided"
                            onCheckedChange={(checked) => setValue("meals_provided", checked)}
                            data-testid="checkbox-meals"
                          />
                          <Label htmlFor="meals_provided" className="cursor-pointer">
                            Masă asigurată
                          </Label>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="message">Mesaj Adițional</Label>
                        <Textarea
                          id="message"
                          rows={4}
                          placeholder="Descrieți în detaliu cerințele sau alte informații relevante..."
                          {...register("message")}
                          data-testid="textarea-message"
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-navy-900 hover:bg-navy-800 text-white h-12 font-semibold"
                      data-testid="submit-employer-form"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Se trimite...
                        </>
                      ) : (
                        "Trimite Solicitarea"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="shadow-sm bg-navy-900 text-white">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold uppercase mb-4">
                    De ce să ne alegeți?
                  </h3>
                  <ul className="space-y-3 text-sm text-navy-200">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Proces complet de recrutare și documentație</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Selecție riguroasă din 18 țări sursă</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Suport în obținerea vizelor și permiselor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span>Integrare și monitorizare post-angajare</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardContent className="pt-6">
                  <h3 className="font-heading text-xl font-bold text-navy-900 uppercase mb-4">
                    Contact Direct
                  </h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <p>
                      <strong>Telefon:</strong><br />
                      <a href="tel:+40732403464" className="text-navy-600 hover:underline">
                        +40 732 403 464
                      </a>
                    </p>
                    <p>
                      <strong>Email:</strong><br />
                      <a href="mailto:office@gjc.ro" className="text-navy-600 hover:underline">
                        office@gjc.ro
                      </a>
                    </p>
                    <p>
                      <strong>Program:</strong><br />
                      Luni - Vineri: 09:00 - 18:00
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
