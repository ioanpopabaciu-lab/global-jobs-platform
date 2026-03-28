import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Locale, locales, defaultLocale } from "@/types";
import { getDictionary } from "@/i18n/config";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const titles: Record<Locale, string> = {
    ro: "Blog | Noutăți despre Recrutare Internațională",
    en: "Blog | International Recruitment News",
    de: "Blog | Neuigkeiten zur internationalen Rekrutierung",
    sr: "Blog | Vesti o međunarodnoj regrutaciji",
    ne: "ब्लग | अन्तर्राष्ट्रिय भर्ती समाचार",
    bn: "ব্লগ | আন্তর্জাতিক নিয়োগ সংবাদ",
    hi: "ब्लॉग | अंतर्राष्ट्रीय भर्ती समाचार",
    si: "බ්ලොග් | ජාත්‍යන්තර බඳවා ගැනීමේ ප්‍රවෘත්ති"
  };

  return {
    title: titles[locale] || titles.ro,
    description: "Latest news and articles about international recruitment, work permits, and immigration.",
  };
}

// Sample blog posts
const blogPosts = [
  {
    slug: "generatia-de-aur-supravietuire-import",
    title: {
      "ro": "De la „Generația de Aur” la Supraviețuirea prin Import",
      "en": "From the 'Golden Generation' to Import Survival",
      "de": "Von der „Goldenen Generation“ zum Import Survival",
      "sr": "Од 'златне генерације' до увозног преживљавања",
      "ne": "'गोल्डेन जेनेरेशन' देखि आयात अस्तित्व सम्म",
      "bn": "'গোল্ডেন জেনারেশন' থেকে আমদানি টিকে থাকা পর্যন্ত",
      "hi": "'स्वर्णिम पीढ़ी' से आयात अस्तित्व तक",
      "si": "'රන් පරම්පරාවේ' සිට ආනයන පැවැත්ම දක්වා"
    },
    excerpt: {
      "ro": "Gopal a privit spre terminalul de plecări al Aeroportului Otopeni, strângând în mână un bilet spre Nepal... Ce se întâmplă când forța de muncă asiatică descoperă realitatea pieței din România, și de ce integrarea nu mai e un lux, ci o necesitate de supraviețuire economică.",
      "en": "Gopal looked towards the departure terminal of Otopeni Airport, clutching a ticket to Nepal... What happens when the Asian workforce discovers the reality of the Romanian market, and why integration is no longer a luxury, but a necessity for economic survival.",
      "de": "Gopal blickte zum Abflugterminal des Flughafens Otopeni und hielt ein Ticket nach Nepal in der Hand ... Was passiert, wenn die asiatischen Arbeitskräfte die Realität des rumänischen Marktes entdecken und warum Integration kein Luxus mehr, sondern eine Notwendigkeit für das wirtschaftliche Überleben ist?",
      "sr": "Гопал је погледао ка одлазном терминалу аеродрома Отопени, држећи карту за Непал... Шта се дешава када азијска радна снага открије реалност румунског тржишта и зашто интеграција више није луксуз, већ неопходност за економски опстанак.",
      "ne": "गोपालले ओटोपेनी एयरपोर्टको प्रस्थान टर्मिनलतिर हेरे, नेपाल जाने टिकट लिएर... एसियाली कार्यबलले रोमानियाली बजारको वास्तविकता बुझेपछि के हुन्छ, र किन एकीकरण अब विलासिता होइन, आर्थिक बाँच्नको लागि आवश्यकता हो।",
      "bn": "নেপালের টিকিট হাতে নিয়ে গোপাল ওটোপেনি বিমানবন্দরের ডিপার্চার টার্মিনালের দিকে তাকাল... এশিয়ান কর্মীবাহিনী যখন রোমানিয়ান বাজারের বাস্তবতা আবিষ্কার করে তখন কী ঘটে এবং কেন ইন্টিগ্রেশন আর বিলাসিতা নয়, বরং অর্থনৈতিক বেঁচে থাকার প্রয়োজন।",
      "hi": "गोपाल ने ओटोपेनी हवाई अड्डे के प्रस्थान टर्मिनल की ओर देखा, हाथ में नेपाल का टिकट थामे हुए... क्या होता है जब एशियाई कार्यबल को रोमानियाई बाजार की वास्तविकता का पता चलता है, और क्यों एकीकरण अब एक विलासिता नहीं है, बल्कि आर्थिक अस्तित्व के लिए एक आवश्यकता है।",
      "si": "ගෝපාල් නේපාලයට ටිකට් පතක් අල්ලාගෙන ඔටොපේනි ගුවන් තොටුපළේ පිටත්වීමේ පර්යන්තය දෙස බැලුවේය... ආසියානු ශ්‍රම බලකාය රුමේනියානු වෙළඳපොලේ යථාර්ථය සොයා ගත් විට කුමක් සිදුවේද, සහ ඒකාබද්ධ කිරීම තවදුරටත් සුඛෝපභෝගී දෙයක් නොව ආර්ථික පැවැත්ම සඳහා අවශ්‍යතාවයක් වන්නේ ඇයි?"
    },
    date: new Date().toISOString().split('T')[0],
    author: "Global Jobs Consulting",
    image: "/images/blog_gopal.jpg"
  },
  {
    slug: "cum-sa-angajezi-forta-munca-asia-romania-ghid",
    title: {
      "ro": "Cum sa angajezi forta de munca din Asia in Romania: Ghidul Pas cu Pas",
      "en": "How to hire labor from Asia in Romania: Step by Step Guide",
      "de": "So stellen Sie Arbeitskräfte aus Asien in Rumänien ein: Schritt-für-Schritt-Anleitung",
      "sr": "Како унајмити радну снагу из Азије у Румунији: Водич корак по корак",
      "ne": "रोमानियामा एसियाबाट श्रमिक कसरी भाडामा लिने: चरणबद्ध गाइड",
      "bn": "রোমানিয়াতে এশিয়া থেকে কীভাবে শ্রমিক নিয়োগ করবেন: ধাপে ধাপে নির্দেশিকা",
      "hi": "रोमानिया में एशिया से श्रमिकों को कैसे नियुक्त करें: चरण दर चरण मार्गदर्शिका",
      "si": "රුමේනියාවේ ආසියාවෙන් ශ්‍රමිකයන් බඳවා ගන්නේ කෙසේද: පියවරෙන් පියවර මාර්ගෝපදේශය"
    },
    excerpt: {
      "ro": "Intr-o economie in plina expansiune, deficitul de personal a devenit principala bariera in calea cresterii firmelor romanesti. Recrutarea din Asia nu este doar o alternativa, ci o strategie de stabilitate pe termen lung.",
      "en": "In an expanding economy, the shortage of personnel has become the main barrier to the growth of Romanian companies. Recruiting from Asia is not just an alternative, but a long-term stability strategy.",
      "de": "In einer expandierenden Wirtschaft ist der Personalmangel zum Haupthindernis für das Wachstum rumänischer Unternehmen geworden. Die Rekrutierung aus Asien ist nicht nur eine Alternative, sondern eine langfristige Stabilitätsstrategie.",
      "sr": "У економији која се шири, недостатак особља је постао главна препрека расту румунских компанија. Регрутовање из Азије није само алтернатива, већ дугорочна стратегија стабилности.",
      "ne": "विस्तार हुँदै गइरहेको अर्थतन्त्रमा, कर्मचारीको अभाव रोमानियाली कम्पनीहरूको बृद्धिको मुख्य बाधक बनेको छ। एसियाबाट भर्ती गर्नु वैकल्पिक मात्र होइन, दीर्घकालीन स्थिरता रणनीति हो।",
      "bn": "ক্রমবর্ধমান অর্থনীতিতে, কর্মীদের ঘাটতি রোমানিয়ান কোম্পানিগুলির বৃদ্ধির প্রধান বাধা হয়ে দাঁড়িয়েছে। এশিয়া থেকে নিয়োগ শুধুমাত্র একটি বিকল্প নয়, একটি দীর্ঘমেয়াদী স্থিতিশীলতার কৌশল।",
      "hi": "बढ़ती अर्थव्यवस्था में, कर्मियों की कमी रोमानियाई कंपनियों के विकास में मुख्य बाधा बन गई है। एशिया से भर्ती करना सिर्फ एक विकल्प नहीं है, बल्कि एक दीर्घकालिक स्थिरता रणनीति है।",
      "si": "පුළුල් වන ආර්ථිකයක් තුළ, පිරිස් හිඟය රුමේනියානු සමාගම්වල වර්ධනයට ප්‍රධාන බාධකය වී ඇත. ආසියාවෙන් බඳවා ගැනීම විකල්පයක් පමණක් නොව, දිගුකාලීන ස්ථාවරත්ව උපාය මාර්ගයකි."
    },
    date: "2024-03-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png"
  },
  {
    slug: "etapele-colaborari-succes-selectie-integrare",
    title: {
      "ro": "Etapele unei colaborari de succes: De la Selectie la Integrare",
      "en": "Stages of a successful collaboration: From Selection to Integration",
      "de": "Phasen einer erfolgreichen Zusammenarbeit: Von der Auswahl bis zur Integration",
      "sr": "Фазе успешне сарадње: од селекције до интеграције",
      "ne": "सफल सहयोगका चरणहरू: चयनदेखि एकीकरणसम्म",
      "bn": "একটি সফল সহযোগিতার পর্যায়: নির্বাচন থেকে ইন্টিগ্রেশন পর্যন্ত",
      "hi": "सफल सहयोग के चरण: चयन से एकीकरण तक",
      "si": "සාර්ථක සහයෝගීතාවයේ අදියර: තේරීමේ සිට ඒකාබද්ධ කිරීම දක්වා"
    },
    excerpt: {
      "ro": "Eliminarea stresului administrativ pentru angajator prin solutia noastra completa de tip la cheie.",
      "en": "Eliminating administrative stress for the employer through our complete turnkey solution.",
      "de": "Eliminieren Sie den Verwaltungsaufwand für den Arbeitgeber durch unsere schlüsselfertige Komplettlösung.",
      "sr": "Уклањање административног стреса за послодавца кроз наше комплетно решење по систему кључ у руке.",
      "ne": "हाम्रो पूर्ण टर्नकी समाधान मार्फत रोजगारदाताको लागि प्रशासनिक तनाव हटाउँदै।",
      "bn": "আমাদের সম্পূর্ণ টার্নকি সমাধানের মাধ্যমে নিয়োগকর্তার জন্য প্রশাসনিক চাপ দূর করা।",
      "hi": "हमारे संपूर्ण टर्नकी समाधान के माध्यम से नियोक्ता के लिए प्रशासनिक तनाव को दूर करना।",
      "si": "අපගේ සම්පූර්ණ පිරිවැටුම් විසඳුම හරහා සේවායෝජකයා සඳහා පරිපාලන ආතතිය ඉවත් කිරීම."
    },
    date: "2024-02-15",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png"
  },
  {
    slug: "avantaje-forta-munca-nepal-horeca",
    title: {
      "ro": "Avantajele fortei de munca din Nepal pentru sectorul HoReCa",
      "en": "Advantages of the Nepalese workforce for the HoReCa sector",
      "de": "Vorteile der nepalesischen Arbeitskräfte für den HoReCa-Sektor",
      "sr": "Предности непалске радне снаге за ХоРеЦа сектор",
      "ne": "HoReCa क्षेत्रका लागि नेपाली कार्यबलका फाइदाहरू",
      "bn": "HoReCa সেক্টরের জন্য নেপালি কর্মীবাহিনীর সুবিধা",
      "hi": "HoReCa क्षेत्र के लिए नेपाली कार्यबल के लाभ",
      "si": "HoReCa අංශය සඳහා නේපාල ශ්‍රම බලකායේ වාසි"
    },
    excerpt: {
      "ro": "Lucratorii din Nepal sunt recunoscuti global pentru amabilitatea lor nativa si etica muncii. Intr-o industrie unde zambetul si rabdarea sunt esentiale, acesti candidati exceleaza.",
      "en": "Nepali workers are globally recognized for their native kindness and work ethic. In an industry where a smile and patience are essential, these candidates excel.",
      "de": "Nepalesische Arbeiter sind weltweit für ihre Freundlichkeit und Arbeitsmoral bekannt. In einer Branche, in der ein Lächeln und Geduld unerlässlich sind, zeichnen sich diese Kandidaten aus.",
      "sr": "Непалски радници су глобално признати по својој љубазности и радној етици. У индустрији у којој су осмех и стрпљење неопходни, ови кандидати се истичу.",
      "ne": "नेपाली कामदारहरू आफ्नो स्वदेशी दया र कार्य नैतिकताका लागि विश्वव्यापी रूपमा चिनिन्छन्। एक उद्योगमा जहाँ मुस्कान र धैर्य आवश्यक छ, यी उम्मेद्वारहरू उत्कृष्ट हुन्छन्।",
      "bn": "নেপালি কর্মীরা তাদের স্থানীয় উদারতা এবং কাজের নীতির জন্য বিশ্বব্যাপী স্বীকৃত। একটি শিল্প যেখানে একটি হাসি এবং ধৈর্য অপরিহার্য, এই প্রার্থীরা শ্রেষ্ঠত্ব.",
      "hi": "नेपाली श्रमिक अपनी मूल दयालुता और कार्य नैतिकता के लिए विश्व स्तर पर पहचाने जाते हैं। ऐसे उद्योग में जहां मुस्कुराहट और धैर्य आवश्यक है, ये उम्मीदवार उत्कृष्ट प्रदर्शन करते हैं।",
      "si": "නේපාල කම්කරුවන් ඔවුන්ගේ ස්වදේශික කරුණාව සහ වැඩ ආචාර ධර්ම සඳහා ගෝලීය වශයෙන් පිළිගැනේ. සිනහව සහ ඉවසීම අත්‍යවශ්‍ය කර්මාන්තයක, මෙම අපේක්ෂකයින් විශිෂ්ටයි."
    },
    date: "2024-02-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png"
  }
];

export default async function BlogPage({ params: { locale } }: { params: { locale: Locale } }) {
  const validLocale = locales.includes(locale) ? locale : defaultLocale;
  const dict = await getDictionary(validLocale);

  const getPath = (path: string) => validLocale === "ro" ? path : `/${validLocale}${path}`;

  const pageTitle = {
    ro: "Blog & Noutăți",
    en: "Blog & News",
    de: "Blog & Neuigkeiten",
    sr: "Blog i vesti",
    ne: "ब्लग र समाचार",
    bn: "ব্লগ এবং সংবাদ",
    hi: "ब्लॉग और समाचार",
    si: "බ්ලොග් සහ ප්‍රවෘත්ති"
  };

  return (
    <div data-testid="blog-page">
      {/* Hero */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{pageTitle[validLocale] || pageTitle.ro}</h1>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title[validLocale as keyof typeof post.title] || post.title.ro}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(post.date).toLocaleDateString(validLocale)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {post.author}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-navy-900 mb-2 line-clamp-2">
                    {post.title[validLocale as keyof typeof post.title] || post.title.ro}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {post.excerpt[validLocale as keyof typeof post.excerpt] || post.excerpt.ro}
                  </p>
                  <Link
                    href={getPath(`/blog/${post.slug}`)}
                    className="inline-flex items-center gap-2 text-coral font-semibold hover:underline"
                  >
                    {dict.common.learnMore}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
