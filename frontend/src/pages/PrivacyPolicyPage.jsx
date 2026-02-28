import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Mail, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Politică de Confidențialitate | Global Jobs Consulting</title>
        <meta name="description" content="Politica de confidențialitate Global Jobs Consulting SRL. Aflați cum colectăm, utilizăm și protejăm datele dumneavoastră personale." />
      </Helmet>

      <div className="min-h-screen pt-32 pb-20 bg-gray-50" data-testid="privacy-policy-page">
        {/* Hero */}
        <div className="bg-navy-900 text-white py-12 mb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <Link to="/" className="inline-flex items-center text-coral hover:text-white transition mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Înapoi la pagina principală
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-coral" />
                <h1 className="font-heading text-3xl md:text-4xl font-bold text-white">
                  Politică de Confidențialitate
                </h1>
              </div>
              <p className="text-navy-200">
                Protecția datelor dumneavoastră personale este importantă pentru noi.
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8 md:p-12">
            
            {/* Company Info */}
            <div className="mb-10 p-6 bg-navy-50 rounded-xl">
              <h2 className="font-heading text-xl font-bold text-navy-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-coral" />
                Informații Operator Date
              </h2>
              <div className="space-y-2 text-gray-700">
                <p><strong>Operator:</strong> Global Jobs Consulting SRL</p>
                <p><strong>CUI:</strong> 48270947</p>
                <p><strong>Nr. Reg. Com.:</strong> J05/1458/2023</p>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-coral" />
                  <strong>Email:</strong> <a href="mailto:office@gjc.ro" className="text-coral hover:underline">office@gjc.ro</a>
                </p>
                <p><strong>Website:</strong> <a href="https://www.gjc.ro" className="text-coral hover:underline">www.gjc.ro</a></p>
              </div>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                1. Ce date colectăm
              </h2>
              <p className="text-gray-700 mb-4">
                În cadrul activității noastre, colectăm următoarele categorii de date personale:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Nume și prenume</li>
                <li>Adresă de email</li>
                <li>Număr de telefon</li>
                <li>CV și informații profesionale (experiență, calificări, competențe)</li>
                <li>Mesaje din formularul de contact</li>
                <li>Cetățenie și preferințe de angajare (pentru candidați)</li>
                <li>Informații despre companie (pentru angajatori)</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                2. Scopul prelucrării
              </h2>
              <p className="text-gray-700 mb-4">
                Datele personale sunt prelucrate în următoarele scopuri:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Evaluarea candidaturilor pentru pozițiile disponibile</li>
                <li>Contactarea candidaților în vederea procesului de recrutare</li>
                <li>Comunicare profesională cu angajatorii și candidații</li>
                <li>Furnizarea serviciilor de recrutare și plasare forță de muncă</li>
                <li>Răspunsuri la solicitările primite prin formularul de contact</li>
                <li>Îmbunătățirea serviciilor noastre</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                3. Temeiul legal al prelucrării
              </h2>
              <p className="text-gray-700 mb-4">
                Prelucrăm datele dumneavoastră personale în baza următoarelor temeiuri legale:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Consimțământ:</strong> Acordul explicit al persoanei vizate pentru prelucrarea datelor</li>
                <li><strong>Demersuri precontractuale:</strong> Prelucrarea necesară în vederea încheierii unui contract de muncă sau colaborare</li>
                <li><strong>Interes legitim:</strong> Interesul nostru legitim de a oferi servicii de recrutare de calitate</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                4. Stocarea datelor
              </h2>
              <p className="text-gray-700 mb-4">
                Datele personale sunt stocate în condiții de siguranță, utilizând măsuri tehnice și organizatorice adecvate.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Datele pot fi procesate prin furnizori de servicii cloud și infrastructură IT externi</li>
                <li>Păstrăm datele doar pe perioada necesară îndeplinirii scopurilor pentru care au fost colectate</li>
                <li>Datele candidaților sunt păstrate pentru o perioadă de maxim 2 ani de la ultima interacțiune</li>
                <li>Implementăm măsuri de securitate pentru protejarea datelor împotriva accesului neautorizat</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                5. Drepturile utilizatorilor
              </h2>
              <p className="text-gray-700 mb-4">
                În conformitate cu Regulamentul General privind Protecția Datelor (GDPR), aveți următoarele drepturi:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Dreptul de acces:</strong> Puteți solicita o copie a datelor personale pe care le deținem despre dumneavoastră</li>
                <li><strong>Dreptul la rectificare:</strong> Puteți solicita corectarea datelor inexacte</li>
                <li><strong>Dreptul la ștergere:</strong> Puteți solicita ștergerea datelor dumneavoastră personale</li>
                <li><strong>Dreptul la opoziție:</strong> Vă puteți opune prelucrării datelor în anumite circumstanțe</li>
                <li><strong>Dreptul la portabilitate:</strong> Puteți solicita transferul datelor către alt operator</li>
                <li><strong>Dreptul de a depune plângere:</strong> Puteți depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP)</li>
              </ul>
              <div className="mt-6 p-4 bg-coral/10 rounded-lg border border-coral/20">
                <p className="text-gray-700">
                  Pentru exercitarea acestor drepturi, vă rugăm să ne contactați la adresa de email:{" "}
                  <a href="mailto:office@gjc.ro" className="text-coral font-semibold hover:underline">
                    office@gjc.ro
                  </a>
                </p>
              </div>
            </section>

            {/* Section 6 - Cookies */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                6. Cookie-uri
              </h2>
              <p className="text-gray-700 mb-4">
                Website-ul nostru utilizează cookie-uri esențiale pentru funcționarea corectă a site-ului. 
                Cookie-urile esențiale sunt necesare pentru navigarea pe site și utilizarea funcționalităților de bază.
              </p>
              <p className="text-gray-700">
                Nu utilizăm cookie-uri de marketing sau tracking fără consimțământul dumneavoastră explicit.
              </p>
            </section>

            {/* Section 7 - Updates */}
            <section className="mb-10">
              <h2 className="font-heading text-2xl font-bold text-navy-900 mb-4">
                7. Modificări ale politicii
              </h2>
              <p className="text-gray-700">
                Ne rezervăm dreptul de a actualiza această politică de confidențialitate. 
                Orice modificări vor fi publicate pe această pagină cu data ultimei actualizări.
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                Ultima actualizare: Februarie 2026
              </p>
            </section>

            {/* Back Button */}
            <div className="mt-12 pt-8 border-t border-gray-200 flex justify-center">
              <Button asChild className="bg-coral hover:bg-red-600 text-white rounded-full px-8">
                <Link to="/">Înapoi la pagina principală</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
