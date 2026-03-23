"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowLeft,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  Loader2,
  ChevronRight,
} from "lucide-react";

// API URL - respect environment or fallback to production
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://global-jobs-platform-production.up.railway.app/api";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  match_score: number;
  posted_at: string;
}

interface Pagination {
  total: number;
  page: number;
  per_page: number;
}

export default function CandidateJobsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs(1);
  }, []);

  const loadJobs = async (page: number) => {
    setIsLoading(true);
    try {
      // Calling API v2 endpoint as required by architecture
      const response = await fetch(`${API_URL}/v2/candidate/jobs?page=${page}&per_page=10`, {
        headers: {
          // If we had the raw JWT inside the frontend context, we would send it here.
          // Fallback relies on the session cookie that AuthContext sets, but the endpoint supports full JWT.
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const payload = await response.json();
        
        // Assert Standardized Response Strategy: { success: true, data: { data: [...], total, page, per_page } }
        if (payload.success && payload.data) {
          setJobs(payload.data.data || []);
          setPagination({
            total: payload.data.total,
            page: payload.data.page,
            per_page: payload.data.per_page
          });
        } else {
          toast.error(payload.message || "Failed to load jobs");
        }
      } else {
        toast.error("Network error when loading recommended jobs");
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      toast.error("Eroare la încărcarea joburilor recomandate");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString("ro-RO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal/candidate">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Joburi Recomandate</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2">
            <Search className="h-4 w-4" /> Algoritmul nostru AI potrivește profilul tău cu posturile deschise
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-coral">
          <Loader2 className="h-12 w-12 animate-spin mb-4" />
          <p className="text-gray-600 font-medium animate-pulse">Analizăm bazele de date...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="border-dashed border-2 bg-gray-50 flex flex-col items-center justify-center min-h-[300px] text-center p-8">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-navy-900 mb-2">Niciun Post Momentan</h2>
          <p className="text-gray-500 max-w-sm mb-6">
            Așteptăm posturi noi în domeniul ales sau profilul tău este încă incomplet pentru potrivire automată.
          </p>
          <Link href="/portal/candidate/profile">
            <Button className="bg-coral hover:bg-coral/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
              Îmbunătățește Profilul
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="group overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 border-gray-100 hover:border-coral/30">
              <CardHeader className="pb-4 bg-gradient-to-br from-white to-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-coral/10 text-coral hover:bg-coral/20 border-0">
                    Potrivire {job.match_score}%
                  </Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(job.posted_at)}
                  </span>
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-coral transition-colors">{job.title}</CardTitle>
                <CardDescription className="flex items-center gap-2 text-md mt-1">
                  <Building className="w-4 h-4" />
                  {job.company}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex-grow pt-4">
                <div className="space-y-4">
                  {/* Matching Visual */}
                  <div>
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-gray-500">Acuratețe Profil</span>
                      <span className={job.match_score > 90 ? "text-green-600" : "text-blue-600"}>{job.match_score}%</span>
                    </div>
                    <Progress value={job.match_score} className={`h-2 ${job.match_score > 90 ? "[&>div]:bg-green-500" : "[&>div]:bg-blue-500"}`} />
                  </div>
                  
                  {/* Job meta details */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                      <span className="leading-tight">{job.location}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-600">
                      <Briefcase className="w-4 h-4 mt-0.5 text-gray-400" />
                      <span className="leading-tight">{job.type}</span>
                    </div>
                  </div>
                  
                  {/* Highlight box */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-green-800 font-semibold uppercase tracking-wider">Salariu Oferit</p>
                      <p className="text-sm font-bold text-green-900">{job.salary}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0 pb-6 px-6 bg-white shrink-0">
                <Button className="w-full bg-navy-900 hover:bg-navy-800 text-white shadow hover:shadow-md transition-all rounded-xl group-hover:translate-y-[-2px] duration-300">
                  Aplică Acum
                  <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
