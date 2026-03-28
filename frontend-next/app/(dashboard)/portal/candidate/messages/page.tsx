"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  MailOpen,
  Info,
  CheckCircle2,
  AlertTriangle,
  FileX,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_URL = "/api";

type NotificationType = "info" | "success" | "warning" | "error";

interface Notification {
  notification_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: string;
  is_read: boolean;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  per_page: number;
}

export default function CandidateMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Notification[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, per_page: 20 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages(1);
  }, []);

  const loadMessages = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/v2/candidate/messages?page=${page}&per_page=20`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (response.ok) {
        const payload = await response.json();
        
        if (payload.success && payload.data) {
          setMessages(payload.data.data || []);
          setPagination({
            total: payload.data.total,
            page: payload.data.page,
            per_page: payload.data.per_page
          });
        } else {
          toast.error(payload.message || "Failed to load messages");
        }
      } else {
        toast.error("Vă rugăm verificați conexiunea la internet.");
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      toast.error("Eroare la conexiunea cu serverul GJC.");
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead) return;
    
    // Optimistic update
    setMessages(msgs => msgs.map(m => m.notification_id === id ? { ...m, is_read: true } : m));
    
    try {
      // In a real scenario, this would call a PUT endpoint to mark as read
      // We assume /api/v1/notifications/{id}/read exists or similar.
      await fetch(`${API_URL}/v1/notifications/${id}/read`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });
    } catch (e) {
      // Revert if API fails
      console.error(e);
      setMessages(msgs => msgs.map(m => m.notification_id === id ? { ...m, is_read: false } : m));
    }
  };

  const getIconForType = (type: NotificationType) => {
    switch (type) {
      case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error": return <FileX className="h-5 w-5 text-red-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBgForType = (type: NotificationType, isRead: boolean) => {
    if (isRead) return "bg-gray-50 border-gray-100 opacity-75";
    switch (type) {
      case "success": return "bg-green-50/50 border-green-200 shadow-sm";
      case "error": return "bg-red-50/50 border-red-200 shadow-sm";
      case "warning": return "bg-yellow-50/50 border-yellow-200 shadow-sm";
      default: return "bg-blue-50/50 border-blue-200 shadow-sm";
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('ro-RO', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const totalPages = Math.ceil(pagination.total / pagination.per_page);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/portal/candidate">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Căsuță Mesaje</h1>
            <p className="text-gray-500 mt-1 flex items-center gap-2">
              Toate notificările și informările vitale despre dosarul tău
            </p>
          </div>
        </div>
        
        <Badge variant="secondary" className="bg-navy-100 text-navy-900 border-0 px-3 py-1.5 text-sm font-semibold rounded-full">
          Total: {pagination.total} mesaje
        </Badge>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-coral mb-4" />
          <p className="text-gray-500 animate-pulse">Sincronizare mesaje...</p>
        </div>
      ) : messages.length === 0 ? (
        <Card className="border-dashed border-2 flex flex-col items-center justify-center min-h-[300px] text-center p-8 bg-gray-50/50">
          <div className="w-16 h-16 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-4">
            <MailOpen className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Inbox Gol</h2>
          <p className="text-gray-500">
            Nu ai primit niciun mesaj încă. Când dosarul tău primește un update, vei fi notificat aici.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <Card 
              key={msg.notification_id} 
              className={`p-5 transition-all cursor-pointer duration-300 border-l-4 ${
                msg.is_read ? "border-l-gray-300" : "border-l-coral"
              } ${getBgForType(msg.type, msg.is_read)}`}
              onClick={() => markAsRead(msg.notification_id, msg.is_read)}
            >
              <div className="flex gap-4 items-start">
                <div className="mt-1">
                  {msg.is_read ? (
                    <MailOpen className="h-6 w-6 text-gray-400" />
                  ) : (
                    <div className="relative">
                      <Mail className="h-6 w-6 text-coral" />
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-lg transition-colors ${msg.is_read ? "font-medium text-gray-700" : "font-bold text-navy-900"}`}>
                      {msg.title}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(msg.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-gray-600 mt-2">
                    <div className="pt-0.5">{getIconForType(msg.type)}</div>
                    <p className={`text-sm ${msg.is_read ? "text-gray-500" : "text-gray-800"}`}>
                      {msg.message}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMessages(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Mai noi
              </Button>
              <div className="text-sm text-gray-500">
                Pagina {pagination.page} din {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMessages(Math.min(totalPages, pagination.page + 1))}
                disabled={pagination.page === totalPages}
              >
                Mai vechi <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
