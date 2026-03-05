import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, Filter, Eye, Loader2, FolderKanban, User, Building2,
  Briefcase, ArrowRight, Calendar, Plus, MessageSquare, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const stageConfig = {
  candidate_matched: { label: 'Potrivit', color: 'bg-blue-100 text-blue-700', step: 1 },
  contract_generated: { label: 'Contract', color: 'bg-purple-100 text-purple-700', step: 2 },
  contract_signed: { label: 'Semnat', color: 'bg-purple-100 text-purple-700', step: 3 },
  invoice_generated: { label: 'Facturat', color: 'bg-amber-100 text-amber-700', step: 4 },
  payment_received: { label: 'Plătit', color: 'bg-green-100 text-green-700', step: 5 },
  documents_uploaded: { label: 'Documente', color: 'bg-cyan-100 text-cyan-700', step: 6 },
  igi_work_permit_submitted: { label: 'IGI Depus', color: 'bg-yellow-100 text-yellow-700', step: 7 },
  igi_work_permit_approved: { label: 'IGI Aprobat', color: 'bg-emerald-100 text-emerald-700', step: 8 },
  evisa_submitted: { label: 'e-Visa', color: 'bg-indigo-100 text-indigo-700', step: 9 },
  embassy_interview: { label: 'Interviu', color: 'bg-indigo-100 text-indigo-700', step: 10 },
  visa_issued: { label: 'Viză', color: 'bg-teal-100 text-teal-700', step: 11 },
  candidate_travel: { label: 'Călătorie', color: 'bg-pink-100 text-pink-700', step: 12 },
  arrival_romania: { label: 'Sosire', color: 'bg-rose-100 text-rose-700', step: 13 },
  residence_permit_applied: { label: 'Permis Depus', color: 'bg-orange-100 text-orange-700', step: 14 },
  residence_permit_issued: { label: 'Permis Emis', color: 'bg-lime-100 text-lime-700', step: 15 },
  completed: { label: 'Finalizat', color: 'bg-gray-100 text-gray-700', step: 16 }
};

const allStages = Object.keys(stageConfig);

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  const [stageModal, setStageModal] = useState({ open: false, project: null });
  const [newStage, setNewStage] = useState('');
  const [stageNotes, setStageNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  
  const [noteModal, setNoteModal] = useState({ open: false, project: null });
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/projects`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea proiectelor');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetail = async (projectId) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/projects/${projectId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setProjectDetail(data);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea detaliilor');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleViewDetail = (project) => {
    setSelectedProject(project);
    fetchProjectDetail(project.project_id);
  };

  const handleUpdateStage = async () => {
    if (!stageModal.project || !newStage) return;
    
    setUpdating(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/${stageModal.project.project_id}/stage`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            stage: newStage,
            notes: stageNotes
          })
        }
      );

      if (response.ok) {
        toast.success('Stadiu actualizat!');
        fetchProjects();
        setStageModal({ open: false, project: null });
        setNewStage('');
        setStageNotes('');
        if (selectedProject) {
          fetchProjectDetail(selectedProject.project_id);
        }
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Eroare la actualizare');
      }
    } catch (error) {
      toast.error('Eroare la actualizare');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteModal.project || !newNote) return;
    
    setAddingNote(true);
    try {
      const response = await fetch(
        `${API_URL}/api/admin/projects/${noteModal.project.project_id}/notes`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text: newNote })
        }
      );

      if (response.ok) {
        toast.success('Notă adăugată!');
        setNoteModal({ open: false, project: null });
        setNewNote('');
        if (selectedProject) {
          fetchProjectDetail(selectedProject.project_id);
        }
      }
    } catch (error) {
      toast.error('Eroare la adăugare');
    } finally {
      setAddingNote(false);
    }
  };

  const filteredProjects = projects.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      p.candidate?.first_name?.toLowerCase().includes(searchLower) ||
      p.candidate?.last_name?.toLowerCase().includes(searchLower) ||
      p.employer?.company_name?.toLowerCase().includes(searchLower) ||
      p.job?.title?.toLowerCase().includes(searchLower)
    );
    const matchesStage = stageFilter === 'all' || p.current_stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-navy-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-projects-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Proiecte</h1>
          <p className="text-gray-500">Urmărește proiectele de recrutare și imigrare</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {projects.length} proiecte
        </Badge>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pipeline Proiecte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto pb-2 gap-2">
            {Object.entries(stageConfig).slice(0, 8).map(([key, config]) => {
              const count = projects.filter(p => p.current_stage === key).length;
              return (
                <div 
                  key={key}
                  className={`flex-shrink-0 p-3 rounded-lg cursor-pointer transition-all ${config.color} ${stageFilter === key ? 'ring-2 ring-navy-500' : ''}`}
                  onClick={() => setStageFilter(stageFilter === key ? 'all' : key)}
                >
                  <p className="text-2xl font-bold text-center">{count}</p>
                  <p className="text-xs text-center whitespace-nowrap">{config.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Caută după candidat, angajator, job..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrează stadiu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate stadiile</SelectItem>
                {Object.entries(stageConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
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
                <TableHead>Candidat</TableHead>
                <TableHead>Angajator</TableHead>
                <TableHead>Poziție</TableHead>
                <TableHead>Stadiu</TableHead>
                <TableHead>Scor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    <FolderKanban className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Niciun proiect găsit</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => {
                  const stage = stageConfig[project.current_stage] || stageConfig.candidate_matched;
                  return (
                    <TableRow key={project.project_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>
                            {project.candidate?.first_name} {project.candidate?.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[150px]">
                            {project.employer?.company_name || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-gray-400" />
                          <span className="truncate max-w-[150px]">
                            {project.job?.title || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={stage.color}>{stage.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.matching_score || 0}%</Badge>
                      </TableCell>
                      <TableCell>{formatDate(project.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(project)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setStageModal({ open: true, project });
                              setNewStage(project.current_stage);
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNoteModal({ open: true, project })}
                          >
                            <MessageSquare className="h-4 w-4" />
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

      {/* Detail Modal */}
      <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalii Proiect</DialogTitle>
            <DialogDescription>
              Informații complete despre proiectul de recrutare
            </DialogDescription>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : projectDetail ? (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div>
                <h4 className="font-medium mb-3">Progres</h4>
                <div className="flex items-center overflow-x-auto pb-2">
                  {Object.entries(stageConfig).slice(0, 10).map(([key, config], index) => {
                    const currentStep = stageConfig[projectDetail.project?.current_stage]?.step || 1;
                    const isCompleted = config.step < currentStep;
                    const isCurrent = config.step === currentStep;
                    
                    return (
                      <div key={key} className="flex items-center">
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                          ${isCompleted ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-navy-600 text-white' : 
                            'bg-gray-200 text-gray-500'}
                        `}>
                          {config.step}
                        </div>
                        {index < 9 && (
                          <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Stadiu curent: <span className="font-medium">{stageConfig[projectDetail.project?.current_stage]?.label}</span>
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Candidat</p>
                  <p className="font-medium">
                    {projectDetail.candidate?.first_name} {projectDetail.candidate?.last_name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Angajator</p>
                  <p className="font-medium">{projectDetail.employer?.company_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Poziție</p>
                  <p className="font-medium">{projectDetail.job?.title}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Scor Matching</p>
                  <p className="font-medium">{projectDetail.project?.matching_score || 0}%</p>
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Note ({projectDetail.project?.notes?.length || 0})</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNoteModal({ open: true, project: projectDetail.project })}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adaugă
                  </Button>
                </div>
                {projectDetail.project?.notes?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {projectDetail.project.notes.map((note, idx) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded text-sm">
                        <p>{note.text}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(note.created_at)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Nicio notă</p>
                )}
              </div>

              {/* Stage History */}
              <div>
                <h4 className="font-medium mb-3">Istoric Stadii</h4>
                {projectDetail.project?.stage_history?.length > 0 ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {projectDetail.project.stage_history.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div className="flex-1">
                          <Badge className={stageConfig[entry.stage]?.color || 'bg-gray-100'}>
                            {stageConfig[entry.stage]?.label || entry.stage}
                          </Badge>
                          {entry.notes && <p className="text-xs text-gray-500 mt-1">{entry.notes}</p>}
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(entry.changed_at)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Niciun istoric</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  className="flex-1"
                  onClick={() => {
                    setSelectedProject(null);
                    setStageModal({ open: true, project: projectDetail.project });
                    setNewStage(projectDetail.project?.current_stage);
                  }}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Actualizează Stadiu
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Stage Update Modal */}
      <Dialog open={stageModal.open} onOpenChange={(open) => !open && setStageModal({ open: false, project: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizează Stadiul</DialogTitle>
            <DialogDescription>
              Selectați noul stadiu pentru acest proiect
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Stadiu nou:</p>
              <Select value={newStage} onValueChange={setNewStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Selectează stadiul" />
                </SelectTrigger>
                <SelectContent>
                  {allStages.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {stageConfig[stage]?.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Note (opțional):</p>
              <Textarea
                value={stageNotes}
                onChange={(e) => setStageNotes(e.target.value)}
                placeholder="Adăugați note despre această schimbare..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStageModal({ open: false, project: null })}>
              Anulează
            </Button>
            <Button onClick={handleUpdateStage} disabled={updating || !newStage}>
              {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Actualizează
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Modal */}
      <Dialog open={noteModal.open} onOpenChange={(open) => !open && setNoteModal({ open: false, project: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adaugă Notă</DialogTitle>
          </DialogHeader>
          
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Scrieți nota aici..."
            rows={4}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal({ open: false, project: null })}>
              Anulează
            </Button>
            <Button onClick={handleAddNote} disabled={addingNote || !newNote}>
              {addingNote && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Adaugă
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
