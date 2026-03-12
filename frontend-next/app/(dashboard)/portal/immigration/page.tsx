"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Bell, Clock, Globe } from "lucide-react";

export default function ImmigrationDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">
          Bine ați venit, {user?.name?.split(" ")[0] || "Client"}!
        </h1>
        <p className="text-gray-600">
          Portalul dvs. pentru serviciile de imigrare și asistență documentară.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Status Dosar</CardDescription>
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
              <span className="text-2xl font-bold text-navy-900">0</span>
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
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-coral" />
            </div>
            <div>
              <CardTitle>Servicii de Imigrare</CardTitle>
              <CardDescription>Asistență pentru vize, permise și cetățenie</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Oferim asistență completă pentru:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Obținerea vizelor de lungă ședere</li>
            <li>• Permise de ședere și reînnoire</li>
            <li>• Reîntregirea familiei</li>
            <li>• Procesul de cetățenie</li>
          </ul>
          <p className="text-gray-500 mt-4 text-sm">
            Contactați-ne la office@gjc.ro pentru asistență personalizată.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
