import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Stamp, Globe, ArrowRight, Plus } from 'lucide-react';

export default function ImmigrationDashboard() {
  const { user } = useOutletContext();

  const services = [
    {
      id: 'visa',
      icon: Stamp,
      title: 'Visa Applications',
      description: 'Tourist, business, or work visas',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'residence',
      icon: FileText,
      title: 'Residence Permits',
      description: 'Long-term residence in Romania',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'family',
      icon: Users,
      title: 'Family Reunification',
      description: 'Bring your family to Romania',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'citizenship',
      icon: Globe,
      title: 'Citizenship',
      description: 'Romanian citizenship applications',
      color: 'bg-coral/20 text-coral'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-coral to-red-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Welcome, {user?.name?.split(' ')[0]}! 🌍
        </h1>
        <p className="text-red-100">
          We're here to help with all your immigration needs in Romania.
        </p>
      </div>

      {/* No Active Cases */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600" />
            Start a New Case
          </CardTitle>
          <CardDescription>
            You don't have any active immigration cases. Start one below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="bg-coral hover:bg-red-600">
            <Plus className="mr-2 h-4 w-4" />
            Request Immigration Assistance
          </Button>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Our Immigration Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${service.color}`}>
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
          <CardDescription>Simple steps to get immigration assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: 1, title: 'Request', description: 'Tell us what you need' },
              { step: 2, title: 'Consultation', description: 'Free initial consultation' },
              { step: 3, title: 'Documents', description: 'We guide you through paperwork' },
              { step: 4, title: 'Success', description: 'We handle the process' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-10 h-10 bg-coral/20 rounded-full flex items-center justify-center mx-auto mb-2 text-coral font-bold">
                  {item.step}
                </div>
                <p className="font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Need Assistance?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Contact us for a free consultation about your immigration needs.
              </p>
            </div>
            <div className="flex gap-2">
              <a href="tel:+40732403464">
                <Button variant="outline">Call Us</Button>
              </a>
              <a href="mailto:office@gjc.ro">
                <Button className="bg-coral hover:bg-red-600">Email Us</Button>
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
