import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

const translations = {
  ro: {
    title: "Elisabeth - Asistent Recrutare",
    subtitle: "Sunt aici să vă ajut!",
    placeholder: "Scrieți un mesaj...",
    greeting: "Bună ziua! Sunt Elisabeth, asistentul dumneavoastră pentru recrutare. Cum vă pot ajuta astăzi? Pot răspunde la întrebări despre:\n\n• Cum să aplicați pentru un loc de muncă\n• Documente necesare\n• Sectoarele în care recrutăm\n• Colaborarea cu angajatorii\n• Informații de contact",
    error: "Ne pare rău, a apărut o eroare. Vă rugăm încercați din nou.",
    typing: "Elisabeth scrie...",
    chatPrompt: "Hai să vorbim?"
  },
  en: {
    title: "Elisabeth - Recruitment Assistant",
    subtitle: "I'm here to help!",
    placeholder: "Type a message...",
    greeting: "Hello! I'm Elisabeth, your recruitment assistant. How can I help you today? I can answer questions about:\n\n• How to apply for a job\n• Required documents\n• Work sectors we recruit for\n• Employer collaboration\n• Contact information",
    error: "Sorry, an error occurred. Please try again.",
    typing: "Elisabeth is typing...",
    chatPrompt: "Let's talk?"
  },
  de: {
    title: "Elisabeth - Rekrutierungsassistent",
    subtitle: "Ich bin hier um zu helfen!",
    placeholder: "Nachricht schreiben...",
    greeting: "Guten Tag! Ich bin Elisabeth, Ihre Rekrutierungsassistentin. Wie kann ich Ihnen heute helfen? Ich kann Fragen beantworten zu:\n\n• Wie Sie sich bewerben können\n• Erforderliche Dokumente\n• Arbeitssektoren\n• Zusammenarbeit mit Arbeitgebern\n• Kontaktinformationen",
    error: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    typing: "Elisabeth schreibt...",
    chatPrompt: "Lass uns reden?"
  },
  sr: {
    title: "Elisabeth - Asistent za Regrutaciju",
    subtitle: "Ovde sam da pomognem!",
    placeholder: "Napišite poruku...",
    greeting: "Zdravo! Ja sam Elisabeth, vaš asistent za regrutaciju. Kako vam mogu pomoći danas? Mogu odgovoriti na pitanja o:\n\n• Kako se prijaviti za posao\n• Potrebna dokumenta\n• Sektori u kojima regrutujemo\n• Saradnja sa poslodavcima\n• Kontakt informacije",
    error: "Žao nam je, došlo je do greške. Molimo pokušajte ponovo.",
    typing: "Elisabeth piše...",
    chatPrompt: "Hajde da pričamo?"
  }
};

export default function ElisabethChat() {
  const { language } = useLanguage();
  const t = translations[language] || translations.ro;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `elisabeth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add greeting message when chat opens
      setMessages([{
        role: "assistant",
        content: t.greeting,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, t.greeting]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const API = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API}/api/chat/paula`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId,
          language: language
        })
      });

      if (!response.ok) throw new Error("Chat error");

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t.error,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isOpen 
            ? "bg-gray-600 hover:bg-gray-700" 
            : "bg-coral hover:bg-red-600 animate-pulse hover:animate-none"
        }`}
        data-testid="paula-chat-button"
        aria-label="Chat with Paula"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          data-testid="paula-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="text-xs text-navy-200">{t.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[350px] overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-coral text-white rounded-br-sm"
                      : "bg-white text-gray-800 shadow-sm rounded-bl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-coral" />
                    <span className="text-sm text-gray-500">Paula scrie...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                disabled={isLoading}
                className="flex-1 rounded-full"
                data-testid="paula-chat-input"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-full w-10 h-10 p-0 bg-coral hover:bg-red-600"
                data-testid="paula-chat-send"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
