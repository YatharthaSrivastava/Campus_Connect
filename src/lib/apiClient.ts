import axios from 'axios';

const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api/v1'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach Bearer token to all outgoing requests
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('cc_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Global response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.warn('Unauthorized API call:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

// ── Auth Endpoints (strictly adhering to API Reference) ─────────────────────
export const authAPI = {
  // POST /auth/verify - Validates Firebase token & enforces .edu domain constraints
  verify: (data: { idToken: string; domain: string; email?: string }) =>
    apiClient.post('/auth/verify', data),

  // GET /auth/session - Fetches current authenticated user profile context
  getSession: () => apiClient.get('/auth/session'),
  getMe: () => apiClient.get('/auth/session'),

  login: (data: { email: string; idToken?: string }) =>
    apiClient.post('/auth/login', data),

  register: (data: { email: string; fullName: string; department?: string; collegeName?: string }) =>
    apiClient.post('/auth/register', data),

  validateDomain: (email: string) =>
    apiClient.post('/auth/validate-domain', { email }),
};

// ── Marketplace Endpoints ───────────────────────────────────────────────────
export const marketplaceAPI = {
  // GET /marketplace?category=textbook&status=active
  getListings: (params?: { category?: string; status?: string; page?: number }) =>
    apiClient.get('/marketplace', { params }),

  // POST /marketplace
  createListing: (data: {
    title: string;
    price: number;
    type?: string;
    description?: string;
    category?: 'textbook' | 'lab_coat' | 'tool' | 'electronics';
    condition?: string;
    conditionNotes?: string;
    collegeName?: string;
    images?: string[];
  }) => apiClient.post('/marketplace', data),

  getListingDetails: (id: string) => apiClient.get(`/marketplace/${id}`),
};

// ── Peer Skill Exchange & Study Finder Endpoints ───────────────────────────
export const skillsAPI = {
  // GET /skills/match?subjectCode=DBMS&skillLevel=intermediate
  matchPeers: (params?: { subjectCode?: string; skillLevel?: string; department?: string }) =>
    apiClient.get('/skills/match', { params }),
};

export const studyGroupAPI = {
  // GET /study-groups
  getStudyGroups: () => apiClient.get('/study-groups'),

  // POST /study-groups
  createStudyGroup: (data: { subject: string; location: string; subjectCode?: string }) =>
    apiClient.post('/study-groups', data),
};

// ── Cryptographic Handshake Endpoints ──────────────────────────────────────
export const exchangeAPI = {
  // POST /exchange/initiate
  initiate: (data: { listingId: string; buyerId?: string }) =>
    apiClient.post('/exchange/initiate', data),

  // POST /exchange/verify
  verify: (data: { transactionId: string; otp?: string; qrPayload?: string }) =>
    apiClient.post('/exchange/verify', data),
};

// ── User Profile ────────────────────────────────────────────────────────────
export const userAPI = {
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.patch('/users/profile', data),

  getLeaderboard: () => apiClient.get('/users/leaderboard'),

  getMyTransactions: () => apiClient.get('/users/transactions/my'),

  getKarmaHistory: () => apiClient.get('/users/karma/history'),

  getUserById: (userId: string) => apiClient.get(`/users/${userId}`),
};

// ── Peer Ratings & Reviews ───────────────────────────────────────────────────
export const ratingsAPI = {
  submit: (data: {
    transactionId?: string;
    revieweeId: string;
    stars: number;
    feedback?: string;
  }) => apiClient.post('/ratings', data),

  getUserRatings: (userId: string) => apiClient.get(`/ratings/user/${userId}`),
};

export default apiClient;
