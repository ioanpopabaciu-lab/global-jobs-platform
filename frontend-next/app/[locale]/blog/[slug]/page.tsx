"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, User, Calendar } from "lucide-react";
import { useParams } from "next/navigation";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = params?.locale as string || "ro";

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    // We fetch from the live API using the relative proxy or full backend URL
    const fetchPost = async () => {
      try {
        // Attempt to fetch from backend
        // Note: Production backend is mapped differently depending on Railway setup.
        // Usually, /api points to the backend on this stack. Let's try /api/v1/gjc/blog/posts...
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://global-jobs-platform-production.up.railway.app/api";
        const res = await fetch(`${API_URL}/v1/gjc/blog/posts/${slug}`);
        if (!res.ok) {
          // fallback to /api/blog/posts if the router is different
          const res2 = await fetch(`${API_URL}/blog/posts/${slug}`);
          if (!res2.ok) throw new Error("Not found");
          const data = await res2.json();
          setPost(data);
        } else {
          const data = await res.json();
          setPost(data);
        }
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-900"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-navy-900 mb-4">Articol negăsit</h1>
        <p className="text-gray-600 mb-8">Ne pare rău, dar articolul pe care îl cauți nu există sau a fost mutat.</p>
        <Link href={`/${locale}/blog`} className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-lg hover:bg-navy-800 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Înapoi la Blog
        </Link>
      </div>
    );
  }

  const dateStr = post.created_at ? new Date(post.created_at).toLocaleDateString(locale) : new Date().toLocaleDateString(locale);

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Link */}
        <Link 
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-navy-900 transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Înapoi la toate articolele
        </Link>

        {/* Article Header */}
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-navy-900 mb-6">{post.title}</h1>
          <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {dateStr}
            </span>
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {post.author || "Global Jobs"}
            </span>
          </div>
        </header>

        {/* Hero Image */}
        {post.image_url && (
          <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg mb-12">
            <Image 
              src={post.image_url} 
              alt={post.title} 
              fill 
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg prose-blue max-w-none bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </div>
    </div>
  );
}
