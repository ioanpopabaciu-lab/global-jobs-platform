import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Search, Filter, Loader2, Users, UserCheck, Building2, 
  GraduationCap, Plane, Shield, Mail, Calendar
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const roleConfig = {
  candidate: { label: 'Candidat', color: 'bg-blue-100 text-blue-700', icon: Users },
  employer: { label: 'Angajator', color: 'bg-purple-100 text-purple-700', icon: Building2 },
  student: { label: 'Student', color: 'bg-green-100 text-green-700', icon: GraduationCap },
  immigration_client: { label: 'Imigrare', color: 'bg-amber-100 text-amber-700', icon: Plane },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: Shield }
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // We'll use the dashboard endpoint which returns user counts
      // For a full users list, we'd need a dedicated endpoint
      const response = await fetch(`${API_URL}/api/admin/dashboard`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        // For now, we'll fetch candidates and employers to build a user list
        const [candidatesRes, employersRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/candidates`, { credentials: 'include' }),
          fetch(`${API_URL}/api/admin/employers`, { credentials: 'include' })
        ]);
        
        const candidates = candidatesRes.ok ? (await candidatesRes.json()).candidates : [];
        const employers = employersRes.ok ? (await employersRes.json()).employers : [];
        
        // Build user list from profiles
        const userList = [
          ...candidates.map(c => ({
            user_id: c.user_id,
            email: c.email,
            name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'N/A',
            role: 'candidate',
            created_at: c.created_at,
            status: c.status
          })),
          ...employers.map(e => ({
            user_id: e.user_id,
            email: e.email,
            name: e.company_name || e.administrator_name || 'N/A',
            role: 'employer',
            created_at: e.created_at,
            status: e.status
          }))
        ];
        
        // Add admin user
        userList.unshift({
          user_id: 'admin_system',
          email: 'admin@gjc.ro',
          name: 'GJC Admin',
          role: 'admin',
          created_at: new Date().toISOString(),
          status: 'active'
        });
        
        setUsers(userList);
      }
    } catch (error) {
      toast.error('Eroare la încărcarea utilizatorilor');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Count by role
  const roleCounts = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
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
    <div className="space-y-6" data-testid="admin-users-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Gestionare Utilizatori</h1>
          <p className="text-gray-500">Vizualizează toți utilizatorii platformei</p>
        </div>
        <Badge variant="outline" className="text-sm w-fit">
          {users.length} utilizatori
        </Badge>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(roleConfig).map(([key, config]) => {
          const count = roleCounts[key] || 0;
          const Icon = config.icon;
          return (
            <Card 
              key={key}
              className={`cursor-pointer transition-shadow hover:shadow-md ${roleFilter === key ? 'ring-2 ring-navy-500' : ''}`}
              onClick={() => setRoleFilter(roleFilter === key ? 'all' : key)}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs text-gray-500">{config.label}</p>
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
                placeholder="Caută după nume sau email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrează rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate rolurile</SelectItem>
                {Object.entries(roleConfig).map(([key, config]) => (
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
                <TableHead>Utilizator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Status Profil</TableHead>
                <TableHead>Înregistrat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Niciun utilizator găsit
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const role = roleConfig[user.role] || roleConfig.candidate;
                  const RoleIcon = role.icon;
                  return (
                    <TableRow key={user.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${role.color}`}>
                            <RoleIcon className="h-5 w-5" />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={role.color}>{role.label}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.status === 'validated' ? (
                          <Badge className="bg-green-100 text-green-700">Validat</Badge>
                        ) : user.status === 'pending_validation' ? (
                          <Badge className="bg-yellow-100 text-yellow-700">În Așteptare</Badge>
                        ) : user.status === 'active' ? (
                          <Badge className="bg-blue-100 text-blue-700">Activ</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">{user.status || 'Draft'}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(user.created_at)}
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
