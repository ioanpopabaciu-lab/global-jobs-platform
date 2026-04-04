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
    greeting: "👋 Bună ziua! Sunt Maria de la GJC.\n\nCum vă pot ajuta?\n• Angajare muncitori internaționali\n• Documente IGI & viză\n• Servicii imigrare\n• Consultație gratuită\n\nScrieți-mi! 😊",
    error: "A apărut o eroare. Încercați din nou.",
    typing: "Maria scrie...",
    chatPrompt: "💬 Vă pot ajuta?",
  },
  en: {
    title: "Maria — GJC Consultant",
    subtitle: "🟢 Online now",
    placeholder: "Type a message...",
    greeting: "👋 Hello! I'm Maria from GJC.\n\nHow can I help you?\n• Hire international workers\n• IGI documents & visa\n• Immigration services\n• Free consultation\n\nWrite to me! 😊",
    error: "An error occurred. Please try again.",
    typing: "Maria is typing...",
    chatPrompt: "💬 Can I help you?",
  },
  de: {
    title: "Maria — GJC Beraterin",
    subtitle: "🟢 Jetzt online",
    placeholder: "Nachricht schreiben...",
    greeting: "👋 Hallo! Ich bin Maria von GJC.\n\nWie kann ich helfen?\n• Internationale Arbeitskräfte\n• IGI-Dokumente & Visum\n• Einwanderungsservice\n• Kostenlose Beratung\n\nSchreiben Sie mir! 😊",
    error: "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    typing: "Maria schreibt...",
    chatPrompt: "💬 Kann ich helfen?",
  },
  sr: {
    title: "Maria — GJC Konsultant",
    subtitle: "🟢 Dostupna",
    placeholder: "Napišite poruku...",
    greeting: "👋 Zdravo! Ja sam Maria iz GJC.\n\nKako mogu pomoći?\n• Zapošljavanje radnika\n• IGI dokumenti i vize\n• Usluge imigracije\n• Besplatne konsultacije\n\nNapišite mi! 😊",
    error: "Došlo je do greške. Pokušajte ponovo.",
    typing: "Maria piše...",
    chatPrompt: "💬 Mogu li pomoći?",
  },
  ne: {
    title: "Maria — GJC सल्लाहकार",
    subtitle: "🟢 अनलाइन",
    placeholder: "सन्देश लेख्नुहोस्...",
    greeting: "👋 नमस्ते! म GJC बाट Maria हुँ।\n\nम कसरी मद्दत गर्न सक्छु?\n• अन्तर्राष्ट्रिय कामदार भर्ती\n• IGI कागजात र भिसा\n• आप्रवासन सेवाहरू\n• निःशुल्क परामर्श\n\nसन्देश पठाउनुहोस्! 😊",
    error: "त्रुटि भयो। पुनः प्रयास गर्नुहोस्।",
    typing: "Maria लेख्दैछ...",
    chatPrompt: "💬 के म मद्दत गर्न सक्छु?",
  },
  bn: {
    title: "Maria — GJC পরামর্শদাতা",
    subtitle: "🟢 অনলাইন",
    placeholder: "বার্তা লিখুন...",
    greeting: "👋 হ্যালো! আমি GJC-র Maria।\n\nআমি কিভাবে সাহায্য করতে পারি?\n• আন্তর্জাতিক কর্মী নিয়োগ\n• IGI কাগজপত্র ও ভিসা\n• অভিবাসন সেবা\n• বিনামূল্যে পরামর্শ\n\nআমাকে লিখুন! 😊",
    error: "একটি ত্রুটি হয়েছে। আবার চেষ্টা করুন।",
    typing: "Maria লিখছে...",
    chatPrompt: "💬 আমি কি সাহায্য করতে পারি?",
  },
  hi: {
    title: "Maria — GJC सलाहकार",
    subtitle: "🟢 ऑनलाइन",
    placeholder: "संदेश लिखें...",
    greeting: "👋 नमस्ते! मैं GJC से Maria हूँ।\n\nमैं कैसे मदद कर सकती हूँ?\n• अंतर्राष्ट्रीय कर्मचारी भर्ती\n• IGI दस्तावेज़ और वीज़ा\n• आव्रजन सेवाएं\n• मुफ्त परामर्श\n\nमुझे लिखें! 😊",
    error: "एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    typing: "Maria लिख रही है...",
    chatPrompt: "💬 क्या मैं मदद कर सकती हूँ?",
  },
  si: {
    title: "Maria — GJC උපදේශක",
    subtitle: "🟢 සබැඳිව",
    placeholder: "පණිවිඩය ලියන්න...",
    greeting: "👋 හෙලෝ! මම GJC හි Maria.\n\nමට කෙසේ උදව් කළ හැකිද?\n• ජාත්‍යන්තර කම්කරුවන් බඳවා ගැනීම\n• IGI ලේඛන සහ වීසා\n• සංක්‍රමණ සේවා\n• නොමිලේ උපදේශනය\n\nමට ලියන්න! 😊",
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
  // Folosește traducerea pentru locala curentă; fallback la en (nu ro) pt. limbi asiatice neacoperite
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
      {/* Floating button — above WhatsApp button */}
      <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 flex-row-reverse">
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

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-44 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden">
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
          <div className="h-[350px] overflow-y-auto p-4 space-y-3 bg-gray-50">
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
