"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/types";

interface ContactFormProps {
  locale: Locale;
  translations: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };
}

export default function ContactForm({ locale, translations }: ContactFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://nextjs-gjc-preview.preview.emergentagent.com/api";
      const response = await fetch(`${apiUrl}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.name} *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition"
          data-testid="contact-name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.email} *
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition"
          data-testid="contact-email"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.phone}
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition"
          data-testid="contact-phone"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.subject} *
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition"
          data-testid="contact-subject"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.message} *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-coral focus:ring-1 focus:ring-coral outline-none transition resize-none"
          data-testid="contact-message"
        ></textarea>
      </div>

      {status === "success" && (
        <div className="p-4 bg-green-50 text-green-700 rounded-xl" data-testid="contact-success">
          {translations.success}
        </div>
      )}

      {status === "error" && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl" data-testid="contact-error">
          {translations.error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-coral hover:bg-red-600 text-white py-3 rounded-full font-semibold"
        data-testid="contact-submit"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </>
        ) : (
          translations.submit
        )}
      </Button>
    </form>
  );
}
