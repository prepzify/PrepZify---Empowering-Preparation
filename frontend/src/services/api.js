import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('prepzify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('prepzify_token');
      localStorage.removeItem('prepzify_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ============ RESUME API ============
export const resumeAPI = {
  upload: (formData) => api.post('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAnalysis: () => api.get('/resume/analysis'),
};

// ============ TEST API ============
export const testAPI = {
  generate: (data) => api.post('/test/generate', data),
  submit: (data) => api.post('/test/submit', data),
  getResults: () => api.get('/test/results'),
  getResult: (id) => api.get(`/test/result/${id}`),
};

// ============ STUDY PLAN API ============
export const studyPlanAPI = {
  generate: () => api.post('/study-plan/generate'),
  get: () => api.get('/study-plan'),
};

// ============ INTERVIEW API ============
export const interviewAPI = {
  getQuestions: (data) => api.post('/interview/questions', data),
  evaluate: (data) => api.post('/interview/evaluate', data),
};

// ============ CHAT API ============
export const chatAPI = {
  send: (data) => api.post('/chat', data),
};

// ============ DASHBOARD API ============
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export default api;
