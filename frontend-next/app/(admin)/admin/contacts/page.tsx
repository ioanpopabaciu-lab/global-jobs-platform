"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Loader2, ChevronDown, ChevronUp, Phone, Clock } from "lucide-react";

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== "undefined" ? localStorage.getItem("gjc_token") : null;
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/contact/messages", { credentials: "include", headers: getAuthHeaders() })
      .then(r => r.json())
      .then(d => setMessages(d.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = (id: string) => {
    const newExpanded = expanded === id ? null : id;
    setExpanded(newExpanded);
    // Mark as read when opened
    if (newExpanded) {
      const msg = messages.find(m => m.id === id);
      if (msg && !msg.is_read) {
        fetch(`/api/admin/contact/messages/${id}/read`, {
          method: "PUT",
          credentials: "include",
          headers: getAuthHeaders(),
        }).then(() => {
          setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        }).catch(console.error);
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-coral" />
    </div>
  );

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-coral" />
        <h1 className="text-2xl font-bold text-navy-900">Mesaje Contact</h1>
        <span className="text-sm text-gray-500">({messages.length} total)</span>
        {unreadCount > 0 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-coral text-white font-medium">
            {unreadCount} necitite
          </span>
        )}
      </div>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Niciun mesaj de contact încă.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <Card key={m.id} className={`hover:shadow-md transition-shadow ${!m.is_read ? "border-l-4 border-l-coral" : ""}`}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-navy-900">{m.name}</p>
                      {!m.is_read && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-coral text-white font-medium">Nou</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-1">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{m.email}</span>
                      {m.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{m.phone}</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(m.created_at).toLocaleString("ro-RO")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">Subiect: {m.subject}</p>
                  </div>
                  <button onClick={() => handleExpand(m.id)}
                    className="text-gray-400 hover:text-gray-600 ml-4">
                    {expanded === m.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>
                </div>

                {expanded === m.id && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`}
                      className="inline-flex items-center gap-1 mt-3 text-sm text-coral hover:underline">
                      <Mail className="h-4 w-4" />
                      Răspunde pe {m.email}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
