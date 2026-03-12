"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, FileText, Bell, Clock } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bine ai venit, {user?.name?.split(" ")[0] || "Student"}!
        </h1>
        <p className="text-gray-600">
          Portalul tău pentru aplicația de studii în România.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status Aplicație</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-amber-600">În așteptare</span>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Documente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">0/5</span>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Notificări</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-navy-900">1</span>
              <Bell className="h-5 w-5 text-coral" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>Aplicație pentru Studii</CardTitle>
              <CardDescription>Completează aplicația pentru a studia în România</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Această funcționalitate este în curs de dezvoltare. Vă vom notifica când va fi disponibilă.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
