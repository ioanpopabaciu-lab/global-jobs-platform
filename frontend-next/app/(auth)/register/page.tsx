"use client";

import { Suspense } from "react";
import RegisterForm from "./RegisterForm";
import { Loader2 } from "lucide-react";

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 to-navy-800">
      <Loader2 className="h-12 w-12 animate-spin text-white" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
