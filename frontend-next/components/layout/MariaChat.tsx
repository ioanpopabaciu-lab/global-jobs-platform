"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2 } from "lucide-react";

const CHAT_AI_IMAGE = "/images/optimized/chat_ai.webp";
const BACKEND = process.env.NEXT_PUBLIC_API_URL || "https://global-jobs-platform-production.up.railway.app/api";

const translations: Record<string, {
  title: string; subtitle: string; placeholder: string;
  greeting: string; error: string; typing: string; chatPrompt: string;
}> = {
  ro: {
    title: "Maria — Consultant GJC",
    subtitle: "🟢 Online acum",
    placeholder: "Scrieți un mesaj...",
    greeting: "👋 Bună! Sunt Maria, consultantul GJC.\n\nVă pot ajuta dacă sunteți:\n👷 Angajator — recrutare internațională\n🌍 Muncitor — locuri de muncă în România\n📋 Persoană fizică — vize, IGI, documente\n🎓 Student — studii & stagii în România\n🤝 Agenție — parteneriate GJC\n\nCu ce vă pot ajuta? 😊",
    error: "A apărut o eroare. Încercați din nou.",
    typing: "Maria scrie...",
    chatPrompt: "💬 Vă pot ajuta?",
  },
  en: {
    title: "Maria — GJC Consultant",
    subtitle: "🟢 Online now",
    placeholder: "Type a message...",
    greeting: "👋 Hi! I'm Maria, GJC consultant.\n\nI can help if you are:\n👷 Employer — international recruitment\n🌍 Worker — jobs in Romania\n📋 Individual — visas, IGI, documents\n🎓 Student — studies & internships\n🤝 Agency — GJC partnerships\n\nHow can I help you? 😊",
    error: "An error occurred. Please try again.",
    typing: "Maria is typing...",
    chatPrompt: "💬 Can I help you?",
  },
  de: {
    title: "Maria — GJC Beraterin",
    subtitle: "🟢 Jetzt online",
    placeholder: "Nachricht schreiben...",
    greeting: "👋 Hallo! Ich bin Maria, GJC-Beraterin.\n\nIch helfe Ihnen wenn Sie sind:\n👷 Arbeitgeber — internationale Rekrutierung\n🌍 Arbeitnehmer — Jobs in Rumänien\n📋 Privatperson — Visa, IGI, Dokumente\n🎓 Student — Studium & Praktika\n🤝 Agentur — GJC-Partnerschaft\n\nWie kann ich helfen? 😊",
    error: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    typing: "Maria schreibt...",
    chatPrompt: "💬 Kann ich helfen?",
  },
  sr: {
    title: "Maria — GJC Konsultant",
    subtitle: "🟢 Dostupna",
    placeholder: "Napišite poruku...",
    greeting: "👋 Zdravo! Ja sam Maria, GJC konsultant.\n\nMogu pomoći ako ste:\n👷 Poslodavac — međunarodno zapošljavanje\n🌍 Radnik — poslovi u Rumuniji\n📋 Fizičko lice — vize, IGI, dokumenti\n🎓 Student — studije & stažiranje\n🤝 Agencija — partnerstvo s GJC\n\nKako mogu pomoći? 😊",
    error: "Došlo je do greške. Pokušajte ponovo.",
    typing: "Maria piše...",
    chatPrompt: "💬 Mogu li pomoći?",
  },
  ne: {
    title: "Maria — GJC सल्लाहकार",
    subtitle: "🟢 अनलाइन",
    placeholder: "सन्देश लेख्नुहोस्...",
    greeting: "👋 नमस्ते! म Maria, GJC सल्लाहकार हुँ।\n\nम सहयोग गर्न सक्छु यदि तपाईं:\n👷 नियोक्ता — अन्तर्राष्ट्रिय भर्ती\n🌍 कामदार — रोमानियामा रोजगार\n📋 व्यक्ति — भिसा, IGI, कागजात\n🎓 विद्यार्थी — अध्ययन र इन्टर्नशिप\n🤝 एजेन्सी — GJC साझेदारी\n\nकसरी सहयोग गरूँ? 😊",
    error: "त्रुटि भयो। पुनः प्रयास गर्नुहोस्।",
    typing: "Maria लेख्दैछ...",
    chatPrompt: "💬 के म मद्दत गर्न सक्छु?",
  },
  bn: {
    title: "Maria — GJC পরামর্শদাতা",
    subtitle: "🟢 অনলাইন",
    placeholder: "বার্তা লিখুন...",
    greeting: "👋 হ্যালো! আমি Maria, GJC পরামর্শদাতা।\n\nআমি সাহায্য করতে পারি যদি আপনি:\n👷 নিয়োগকর্তা — আন্তর্জাতিক নিয়োগ\n🌍 কর্মী — রোমানিয়ায় চাকরি\n📋 ব্যক্তি — ভিসা, IGI, কাগজপত্র\n🎓 শিক্ষার্থী — পড়াশোনা ও ইন্টার্নশিপ\n🤝 এজেন্সি — GJC অংশীদারিত্ব\n\nকিভাবে সাহায্য করব? 😊",
    error: "একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।",
    typing: "Maria লিখছে...",
    chatPrompt: "💬 আমি কি সাহায্য করতে পারি?",
  },
  hi: {
    title: "Maria — GJC सलाहकार",
    subtitle: "🟢 ऑनलाइन",
    placeholder: "संदेश लिखें...",
    greeting: "👋 नमस्ते! मैं Maria, GJC सलाहकार हूँ।\n\nमैं मदद कर सकती हूँ अगर आप:\n👷 नियोक्ता — अंतर्राष्ट्रीय भर्ती\n🌍 कर्मचारी — रोमानिया में नौकरी\n📋 व्यक्ति — वीज़ा, IGI, दस्तावेज़\n🎓 छात्र — अध्ययन और इंटर्नशिप\n🤝 एजेंसी — GJC साझेदारी\n\nकैसे मदद करूँ? 😊",
    error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    typing: "Maria लिख रही है...",
    chatPrompt: "💬 क्या मैं मदद कर सकती हूँ?",
  },
  si: {
    title: "Maria — GJC උපදේශක",
    subtitle: "🟢 සබැඳිව",
    placeholder: "පණිවිඩය ලියන්න...",
    greeting: "👋 හෙලෝ! මම Maria, GJC උපදේශක.\n\nඅපට සහාය කළ හැක ඔබ නම්:\n👷 සේවා යෝජකයා — ජාත්‍යන්තර බඳවා ගැනීම\n🌍 සේවකයා — රුමේනියාවේ රැකියා\n📋 පුද්ගලික — වීසා, IGI, ලේඛන\n🎓 සිසු — අධ්‍යාපන & පුහුණු\n🤝 නියෝජිතායතනය — GJC හවුල්කාරිත්වය\n\nකෙසේ සහාය කළ හැකිද? 😊",
    error: "දෝෂයක් ඇතිවිය. නැවත උත්සාහ කරන්න.",
    typing: "Maria ලිවිය...",
    chatPrompt: "💬 මට උදව් කළ හැකිද?",
  },
};

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MariaChatProps {
  locale?: string;
}

export default function MariaChat({ locale = "ro" }: MariaChatProps) {
  const t = translations[locale] || translations.en;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `maria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: t.greeting }]);
    }
  }, [isOpen, t.greeting, messages.length]);

  // Auto-deschide chat după 5 secunde dacă nu a mai fost deschis (prima vizită)
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("maria_shown");
    if (alreadyShown) return;
    const timer = setTimeout(() => {
      setIsOpen(true);
      sessionStorage.setItem("maria_shown", "1");
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND}/chat/maria`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, session_id: sessionId, language: locale }),
      });
      if (!res.ok) throw new Error("Chat error");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: t.error }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button — z-[150] pentru a fi deasupra navbar-ului (z-[100]) și dropdown-urilor (z-[120]) */}
      <div className="fixed bottom-24 right-6 z-[150] flex items-center gap-3 flex-row-reverse">
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="bg-white px-4 py-2 rounded-full shadow-lg animate-bounce cursor-pointer"
          >
            <span className="text-navy-900 font-medium text-sm whitespace-nowrap">{t.chatPrompt}</span>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center overflow-hidden ${
            isOpen ? "bg-gray-600 hover:bg-gray-700" : "bg-white hover:shadow-xl"
          }`}
          aria-label="Chat with Maria"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <img src={CHAT_AI_IMAGE} alt="Maria" className="w-full h-full object-cover" />
          )}
        </button>
      </div>

      {/* Chat window — z-[150] deasupra oricărui element de navigare */}
      {isOpen && (
        <div className="fixed bottom-44 right-6 z-[150] w-[360px] max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-navy-900 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img src={CHAT_AI_IMAGE} alt="Maria" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{t.title}</h3>
                <p className="text-xs text-gray-300">{t.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[380px] overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-coral text-white rounded-br-sm"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-coral" />
                  <span className="text-sm text-gray-500">{t.typing}</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isLoading}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-coral"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-coral hover:bg-red-600 disabled:opacity-40 text-white flex items-center justify-center flex-shrink-0 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
