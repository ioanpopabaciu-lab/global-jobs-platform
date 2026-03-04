import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, FileText, BookOpen, Calendar, ArrowRight, CheckCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useOutletContext();

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-heading font-bold mb-2">
          Welcome, {user?.name?.split(' ')[0]}! 🎓
        </h1>
        <p className="text-purple-100">
          Start your journey to study in Romania. Complete your application to begin.
        </p>
      </div>

      {/* Application Status */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-purple-600" />
            Application Status
          </CardTitle>
          <CardDescription>
            Your student application is ready to be started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <span className="text-xl">📝</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Not Started</p>
                <p className="text-sm text-gray-500">Begin your application to study in Romania</p>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Start Application
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium text-gray-900">Required Documents</h3>
              <p className="text-sm text-gray-500 mt-1">View list of documents needed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium text-gray-900">Timeline</h3>
              <p className="text-sm text-gray-500 mt-1">View application timeline</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <GraduationCap className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-medium text-gray-900">Universities</h3>
              <p className="text-sm text-gray-500 mt-1">Browse partner universities</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Process</CardTitle>
          <CardDescription>Steps to study in Romania</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { step: 1, title: 'Create Profile', description: 'Fill in your personal information' },
              { step: 2, title: 'Upload Documents', description: 'Passport, diplomas, transcripts' },
              { step: 3, title: 'Choose University', description: 'Select your preferred program' },
              { step: 4, title: 'Submit Application', description: 'We handle the rest' },
              { step: 5, title: 'Get Acceptance', description: 'Receive university acceptance letter' },
              { step: 6, title: 'Visa Process', description: 'Apply for student visa' },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
