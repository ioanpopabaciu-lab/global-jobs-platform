// API client for FastAPI backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://immigration-saas-2.preview.emergentagent.com/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetchAPI<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: {
    name: string;
    email: string;
    password: string;
    account_type: string;
  }) =>
    fetchAPI<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: (token: string) =>
    fetchAPI<{ user: any }>('/auth/me', {
      token,
    }),

  logout: (token: string) =>
    fetchAPI<{ success: boolean }>('/auth/logout', {
      method: 'POST',
      token,
    }),
};

// Contact API
export const contactAPI = {
  submit: (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
  }) =>
    fetchAPI<{ success: boolean }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Leads API
export const leadsAPI = {
  requestWorkers: (data: {
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    workers_needed: number;
    industry: string;
    message?: string;
  }) =>
    fetchAPI<{ success: boolean }>('/leads/request-workers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Candidates API
export const candidatesAPI = {
  apply: (data: FormData, token?: string) =>
    fetch(`${API_URL}/candidates/apply`, {
      method: 'POST',
      body: data,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((res) => res.json()),
};

// Company lookup API
export const companyAPI = {
  lookup: (cui: string) =>
    fetchAPI<{ success: boolean; company?: any }>('/auth/lookup-company', {
      method: 'POST',
      body: JSON.stringify({ cui }),
    }),
};

export default fetchAPI;
