import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, Filter, Loader2, FileText, Eye, Download, User,
  Building2, Image, Video, File, Calendar, HardDrive
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const typeConfig = {
  passport: { label: 'Pașaport', icon: FileText },
  cv: { label: 'CV', icon: FileText },
  diploma: { label: 'Diplomă', icon: FileText },
  criminal_record: { label: 'Cazier', icon: FileText },
  passport_photo: { label: 'Foto Pașaport', icon: Image },
  profile_photo: { label: 'Foto Profil', icon: Image },
  video_presentation: { label: 'Video', icon: Video },
  medical_certificate: { label: 'Certificat Medical', icon: FileText },
  cui_certificate: { label: 'Certificat CUI', icon: FileText },
  administrator_id: { label: 'CI Administrator', icon: FileText },
  company_criminal_record: { label: 'Cazier Juridic', icon: FileText },
  company_registration: { label: 'Reg. Comerț', icon: FileText },
  other: { label: 'Altele', icon: File }
};

const ownerTypeConfig = {
  candidate: { label: 'Candidat', color: 'bg-blue-100 text-blue-700', icon: User },
  employer: { label: 'Angajator', color: 'bg-purple-100 text-purple-700', icon: Building2 },
  project: { label: 'Proiect', color: 'bg-green-100 text-green-700', icon: FileText }
};

export default function AdminDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      // Fetch documents from candidates and employers
      const [candidatesRes, employersRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/candidates`, { credentials: 'include' }),
        fetch(`${API_URL}/api/admin/employers`, { credentials: 'include' })
      ]);
      
      let allDocs = [];
      
      if (candidatesRes.ok) {
        const candidatesData = await candidatesRes.json();
        // Fetch documents for each candidate
        for (const candidate of candidatesData.candidates || []) {
          const detailRes = await fetch(`${API_URL}/api/admin/candidates/${candidate.profile_id}`, {
            credentials: 'include'
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail.documents) {
              allDocs.push(...detail.documents.map(doc => ({
                ...doc,
                owner_name: `${candidate.first_name} ${candidate.last_name}`,
                owner_type: 'candidate'
              })));
            }
          }
        }
      }
      
      if (employersRes.ok) {
        const employersData = await employersRes.json();
        // Fetch documents for each employer
        for (const employer of employersData.employers || []) {
          const detailRes = await fetch(`${API_URL}/api/admin/employers/${employer.profile_id}`, {
            credentials: 'include'
          });
          if (detailRes.ok) {
            const detail = await detailRes.json();
            if (detail.documents) {
              allDocs.push(...detail.documents.map(doc => ({
                ...doc,
                owner_name: employer.company_name,
                owner_type: 'employer'
              })));
            }
          }
        }
      }
      
      setDocuments(allDocs);
    } catch (error) {
      toast.error('Eroare la încărcarea documentelor');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    window.open(`${API_URL}/api/portal/documents/${doc.doc_id}/download`, '_blank');
  };

  const filteredDocuments = documents.filter(doc => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      doc.original_filename?.toLowerCase().includes(searchLower) ||
      doc.owner_name?.toLowerCase().includes(searchLower) ||
      doc.document_type?.toLowerCase().includes(searchLower)
    );
    const matchesType = typeFilter === 'all' || doc.document_type === typeFilter;
    const matchesOwner = ownerFilter === 'all' || doc.owner_type === ownerFilter;
    return matchesSearch && matchesType && matchesOwner;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Count by type
  const typeCounts = documents.reduce((acc, doc) => {
    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
    return acc;
  }, {});

  // Count by owner type
  const ownerCounts = documents.reduce((acc, doc) => {
    acc[doc.owner_type] = (acc[doc.owner_type] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-documents-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Documente</h1>
          <p className="text-gray-500">Vizualizează toate documentele încărcate</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <HardDrive className="h-3 w-3 mr-1" />
            {documents.length} documente
          </Badge>
        </div>
      </div>

      {/* Stats by Owner */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(ownerTypeConfig).map(([key, config]) => {
          const count = ownerCounts[key] || 0;
          const Icon = config.icon;
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-shadow hover:shadow-md ${ownerFilter === key ? 'ring-2 ring-navy-500' : ''}`}
              onClick={() => setOwnerFilter(ownerFilter === key ? 'all' : key)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-gray-500">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută după nume fișier, proprietar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tip document" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate tipurile</SelectItem>
                {Object.entries(typeConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label} ({typeCounts[key] || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Proprietar</TableHead>
                <TableHead>Mărime</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Niciun document găsit</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map((doc) => {
                  const type = typeConfig[doc.document_type] || typeConfig.other;
                  const owner = ownerTypeConfig[doc.owner_type] || ownerTypeConfig.candidate;
                  const TypeIcon = type.icon;
                  const OwnerIcon = owner.icon;
                  
                  return (
                    <TableRow key={doc.doc_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <TypeIcon className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]" title={doc.original_filename}>
                              {doc.original_filename}
                            </p>
                            <p className="text-xs text-gray-500">{doc.file_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{type.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={owner.color}>
                            <OwnerIcon className="h-3 w-3 mr-1" />
                            {owner.label}
                          </Badge>
                          <span className="text-sm truncate max-w-[100px]">{doc.owner_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(doc.file_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(doc.created_at)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Vezi
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
