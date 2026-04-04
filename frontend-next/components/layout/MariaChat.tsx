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
    greeting: "👋 Bună ziua! Eu sunt Maria, consultantul dvs. la Global Jobs Consulting.\n\nVă pot ajuta să găsiți rapid răspunsuri la:\n\n🏢 Cum să angajați muncitori internaționali\n📋 Documente și proceduri IGI\n💼 Sectoare disponibile (construcții, HoReCa, IT...)\n🌍 Servicii de imigrare și viză\n📞 Programarea unei consultații gratuite\n\nCe vă interesează? Scrieți-mi și răspund imediat! 😊",
    error: "Ne pare rău, a apărut o eroare. Vă rugăm încercați din nou.",
    typing: "Maria scrie...",
    chatPrompt: "💬 Am o întrebare pentru dvs.!",
  },
  en: {
    title: "Maria — GJC Consultant",
    subtitle: "🟢 Online now",
    placeholder: "Type a message...",
    greeting: "👋 Hello! I'm Maria, your consultant at Global Jobs Consulting.\n\nI can help you with:\n\n🏢 How to hire international workers\n📋 IGI documents and procedures\n💼 Available sectors (construction, HoReCa, IT...)\n🌍 Immigration and visa services\n📞 Free consultation booking\n\nWhat are you interested in? Write to me and I'll reply right away! 😊",
    error: "Sorry, an error occurred. Please try again.",
    typing: "Maria is typing...",
    chatPrompt: "💬 I have a question for you!",
  },
  de: {
    title: "Maria — GJC Beraterin",
    subtitle: "🟢 Jetzt online",
    placeholder: "Nachricht schreiben...",
    greeting: "👋 Guten Tag! Ich bin Maria, Ihre Beraterin bei Global Jobs Consulting.\n\nIch helfe Ihnen bei:\n\n🏢 Internationale Arbeitskräfte einstellen\n📋 IGI-Dokumente und Verfahren\n💼 Verfügbare Branchen (Bau, HoReCa, IT...)\n🌍 Einwanderungs- und Visaservices\n📞 Kostenlose Beratung buchen\n\nWas interessiert Sie? Schreiben Sie mir! 😊",
    error: "Entschuldigung, ein Fehler ist aufgetreten.",
    typing: "Maria schreibt...",
    chatPrompt: "💬 Ich habe eine Frage für Sie!",
  },
  sr: {
    title: "Maria — GJC Konsultant",
    subtitle: "🟢 Dostupna sada",
    placeholder: "Napišite poruku...",
    greeting: "👋 Zdravo! Ja sam Maria, vaš konsultant u Global Jobs Consulting.\n\nMogu vam pomoći sa:\n\n🏢 Zapošljavanje međunarodnih radnika\n📋 IGI dokumenti i procedure\n💼 Dostupni sektori (građevina, HoReCa, IT...)\n🌍 Usluge imigracije i vize\n📞 Besplatne konsultacije\n\nŠta vas zanima? Napišite mi! 😊",
    error: "Žao nam je, došlo je do greške.",
    typing: "Maria piše...",
    chatPrompt: "💬 Imam pitanje za vas!",
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
  const t = translations[locale] || translations.ro;

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
