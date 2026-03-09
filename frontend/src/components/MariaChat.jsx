import { useState, useRef, useEffect } from "react";
import { X, Send, Loader2, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";

// Chat AI image (woman on phone)
const CHAT_AI_IMAGE = "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/2651v7rf_poza%20chat%20AI.png";

const translations = {
  ro: {
    title: "Maria - Asistent Recrutare",
    subtitle: "Sunt aici să vă ajut!",
    placeholder: "Scrieți un mesaj...",
    greeting: "Bună ziua! Sunt Maria, asistentul dumneavoastră pentru recrutare. Cum vă pot ajuta astăzi? Pot răspunde la întrebări despre:\n\n• Cum să aplicați pentru un loc de muncă\n• Documente necesare\n• Sectoarele în care recrutăm\n• Colaborarea cu angajatorii\n• Informații de contact",
    error: "Ne pare rău, a apărut o eroare. Vă rugăm încercați din nou.",
    typing: "Maria scrie...",
    chatPrompt: "Hai să vorbim?"
  },
  en: {
    title: "Maria - Recruitment Assistant",
    subtitle: "I'm here to help!",
    placeholder: "Type a message...",
    greeting: "Hello! I'm Maria, your recruitment assistant. How can I help you today? I can answer questions about:\n\n• How to apply for a job\n• Required documents\n• Work sectors we recruit for\n• Employer collaboration\n• Contact information",
    error: "Sorry, an error occurred. Please try again.",
    typing: "Maria is typing...",
    chatPrompt: "Let's talk?"
  },
  de: {
    title: "Maria - Rekrutierungsassistent",
    subtitle: "Ich bin hier um zu helfen!",
    placeholder: "Nachricht schreiben...",
    greeting: "Guten Tag! Ich bin Maria, Ihre Rekrutierungsassistentin. Wie kann ich Ihnen heute helfen? Ich kann Fragen beantworten zu:\n\n• Wie Sie sich bewerben können\n• Erforderliche Dokumente\n• Arbeitssektoren\n• Zusammenarbeit mit Arbeitgebern\n• Kontaktinformationen",
    error: "Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    typing: "Maria schreibt...",
    chatPrompt: "Lass uns reden?"
  },
  sr: {
    title: "Maria - Asistent za Regrutaciju",
    subtitle: "Ovde sam da pomognem!",
    placeholder: "Napišite poruku...",
    greeting: "Zdravo! Ja sam Maria, vaš asistent za regrutaciju. Kako vam mogu pomoći danas? Mogu odgovoriti na pitanja o:\n\n• Kako se prijaviti za posao\n• Potrebna dokumenta\n• Sektori u kojima regrutujemo\n• Saradnja sa poslodavcima\n• Kontakt informacije",
    error: "Žao nam je, došlo je do greške. Molimo pokušajte ponovo.",
    typing: "Maria piše...",
    chatPrompt: "Hajde da pričamo?"
  },
  ne: {
    title: "Maria - भर्ती सहायक",
    subtitle: "म यहाँ मद्दत गर्न आएको छु!",
    placeholder: "सन्देश लेख्नुहोस्...",
    greeting: "नमस्ते! म Maria हुँ, तपाईंको भर्ती सहायक। आज म तपाईंलाई कसरी मद्दत गर्न सक्छु? म यी प्रश्नहरूको जवाफ दिन सक्छु:\n\n• कसरी कामको लागि आवेदन गर्ने\n• आवश्यक कागजातहरू\n• हामीले भर्ती गर्ने क्षेत्रहरू\n• रोजगारदातासँग सहकार्य\n• सम्पर्क जानकारी",
    error: "माफ गर्नुहोस्, त्रुटि भयो। कृपया फेरि प्रयास गर्नुहोस्।",
    typing: "Maria ले टाइप गर्दै छिन्...",
    chatPrompt: "कुरा गरौं?"
  },
  bn: {
    title: "Maria - নিয়োগ সহকারী",
    subtitle: "আমি এখানে সাহায্য করতে এসেছি!",
    placeholder: "বার্তা লিখুন...",
    greeting: "নমস্কার! আমি Maria, আপনার নিয়োগ সহকারী। আজ আমি কীভাবে আপনাকে সাহায্য করতে পারি? আমি এই প্রশ্নের উত্তর দিতে পারি:\n\n• কীভাবে চাকরির জন্য আবেদন করবেন\n• প্রয়োজনীয় নথি\n• আমরা যে সেক্টরে নিয়োগ করি\n• নিয়োগকর্তাদের সাথে সহযোগিতা\n• যোগাযোগের তথ্য",
    error: "দুঃখিত, একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    typing: "Maria টাইপ করছেন...",
    chatPrompt: "কথা বলি?"
  },
  hi: {
    title: "Maria - भर्ती सहायक",
    subtitle: "मैं यहाँ मदद के लिए हूँ!",
    placeholder: "संदेश लिखें...",
    greeting: "नमस्ते! मैं Maria हूँ, आपकी भर्ती सहायक। आज मैं आपकी कैसे मदद कर सकती हूँ? मैं इन सवालों के जवाब दे सकती हूँ:\n\n• नौकरी के लिए आवेदन कैसे करें\n• आवश्यक दस्तावेज़\n• जिन क्षेत्रों में हम भर्ती करते हैं\n• नियोक्ताओं के साथ सहयोग\n• संपर्क जानकारी",
    error: "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
    typing: "Maria टाइप कर रही हैं...",
    chatPrompt: "बात करें?"
  },
  si: {
    title: "Maria - බඳවා ගැනීමේ සහකාර",
    subtitle: "මම උදව් කරන්න මෙහි සිටිමි!",
    placeholder: "පණිවිඩයක් ලියන්න...",
    greeting: "ආයුබෝවන්! මම Maria, ඔබේ බඳවා ගැනීමේ සහකාර. අද මට ඔබට කෙසේ උදව් කළ හැකිද? මට මේ ප්‍රශ්න වලට පිළිතුරු දිය හැක:\n\n• රැකියාවක් සඳහා අයදුම් කරන්නේ කෙසේද\n• අවශ්‍ය ලේඛන\n• අප බඳවා ගන්නා අංශ\n• සේවායෝජකයින් සමඟ සහයෝගිතාව\n• සම්බන්ධතා තොරතුරු",
    error: "සමාවන්න, දෝෂයක් සිදු විය. කරුණාකර නැවත උත්සාහ කරන්න.",
    typing: "Maria ටයිප් කරමින්...",
    chatPrompt: "කතා කරමුද?"
  }
};

export default function MariaChat() {
  const { language } = useLanguage();
  const t = translations[language] || translations.ro;
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `maria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
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
      const response = await fetch(`${API}/api/chat/maria`, {
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
      {/* Chat Button with Label - positioned above WhatsApp button on the right */}
      <div className="fixed bottom-24 right-6 z-50 flex items-center gap-3 flex-row-reverse">
        {/* "Hai să vorbim?" label - only show when chat is closed */}
        {!isOpen && (
          <div 
            className="bg-white px-4 py-2 rounded-full shadow-lg animate-bounce cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span className="text-navy-900 font-medium text-sm whitespace-nowrap">
              {t.chatPrompt}
            </span>
          </div>
        )}
        
        {/* Chat Button - Image of woman instead of icon */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center overflow-hidden ${
            isOpen 
              ? "bg-gray-600 hover:bg-gray-700" 
              : "bg-white hover:shadow-xl"
          }`}
          data-testid="maria-chat-button"
          aria-label="Chat with Maria"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <img 
              src={CHAT_AI_IMAGE} 
              alt="Maria - Chat Assistant" 
              className="w-full h-full object-cover"
            />
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-44 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          data-testid="maria-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src={CHAT_AI_IMAGE} 
                  alt="Maria" 
                  className="w-full h-full object-cover"
                />
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
                    <span className="text-sm text-gray-500">{t.typing}</span>
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
                data-testid="maria-chat-input"
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="rounded-full w-10 h-10 p-0 bg-coral hover:bg-red-600"
                data-testid="maria-chat-send"
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
