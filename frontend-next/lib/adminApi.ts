/**
 * Helper pentru apeluri API admin — GJC Platform v3.0
 * Toate cererile merg la /api/admin/... cu token din localStorage
 */

const BASE = "/api/admin";

function token(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("gjc_token") || "";
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token()}`,
  };
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Eroare ${res.status}`);
  }
  return res.json();
}

async function put<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Eroare ${res.status}`);
  }
  return res.json();
}

async function post<T>(path: string, body?: object): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Eroare ${res.status}`);
  }
  return res.json();
}

// ── Dashboard ──────────────────────────────────────────────────────────────
export const adminApi = {
  dashboard: () => get<any>("/dashboard"),

  // Candidați
  candidates: (params?: Record<string, string>) =>
    get<any>(`/candidates?${new URLSearchParams(params).toString()}`),
  candidate: (id: string) => get<any>(`/candidates/${id}`),
  validateCandidate: (id: string, status: string, notes?: string) =>
    put<any>(`/candidates/${id}/validate?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),

  // Angajatori
  employers: (params?: Record<string, string>) =>
    get<any>(`/employers?${new URLSearchParams(params).toString()}`),
  employer: (id: string) => get<any>(`/employers/${id}`),
  validateEmployer: (id: string, status: string, notes?: string) =>
    put<any>(`/employers/${id}/validate?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),
  updateIGI: (id: string, params: Record<string, boolean>) => {
    const qs = Object.entries(params)
      .map(([k, v]) => `${k}=${v}`)
      .join("&");
    return put<any>(`/employers/${id}/igi?${qs}`);
  },

  // Agenții
  agencies: (params?: Record<string, string>) =>
    get<any>(`/agencies?${new URLSearchParams(params).toString()}`),
  agency: (id: string) => get<any>(`/agencies/${id}`),
  validateAgency: (id: string, status: string, notes?: string) =>
    put<any>(`/agencies/${id}/validate?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),

  // Joburi
  jobs: (params?: Record<string, string>) =>
    get<any>(`/jobs?${new URLSearchParams(params).toString()}`),
  job: (id: string) => get<any>(`/jobs/${id}`),
  updateJobStatus: (id: string, status: string) =>
    put<any>(`/jobs/${id}/status?status=${status}`),

  // Plasamente
  placements: (params?: Record<string, string>) =>
    get<any>(`/placements?${new URLSearchParams(params).toString()}`),
  placement: (id: string) => get<any>(`/placements/${id}`),
  createPlacement: (candidateId: string, jobId: string, score: number, notes?: string) =>
    post<any>(`/placements?candidate_id=${candidateId}&job_request_id=${jobId}&match_score=${score}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),
  updateStage: (id: string, stage: string, stageDate?: string, notes?: string) =>
    put<any>(`/placements/${id}/stage?new_stage=${stage}${stageDate ? `&stage_date=${stageDate}` : ""}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),
  matchingCandidates: (jobId: string) => get<any>(`/matching/${jobId}`),

  // Documente
  documents: (params?: Record<string, string>) =>
    get<any>(`/documents?${new URLSearchParams(params).toString()}`),
  verifyDocument: (id: string, status: string, notes?: string) =>
    put<any>(`/documents/${id}/verify?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),

  // Migrație
  migrationCases: (params?: Record<string, string>) =>
    get<any>(`/migration?${new URLSearchParams(params).toString()}`),
  migrationCase: (id: string) => get<any>(`/migration/${id}`),
  updateMigrationStatus: (id: string, status: string, notes?: string) =>
    put<any>(`/migration/${id}/status?status=${status}${notes ? `&notes=${encodeURIComponent(notes)}` : ""}`),

  // Utilizatori
  users: (params?: Record<string, string>) =>
    get<any>(`/users?${new URLSearchParams(params).toString()}`),
  toggleUserStatus: (id: string, isActive: boolean) =>
    put<any>(`/users/${id}/status?is_active=${isActive}`),
  changeUserRole: (id: string, role: string) =>
    put<any>(`/users/${id}/role?role=${role}`),
};
