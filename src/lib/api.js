import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 10000,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('keyghost_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('keyghost_token');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/' && window.location.pathname !== '/demo') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data) => API.post('/api/auth/register', data),
  login: (data) => API.post('/api/auth/login', data),
  submitTrainingSample: (events) => API.post('/api/auth/training-sample', { keystroke_events: events }),
  getMe: () => API.get('/api/auth/me'),
};

export const dashboardAPI = {
  getStats: () => API.get('/api/dashboard/stats'),
  getThreatMap: () => API.get('/api/dashboard/threat-map'),
  retrain: () => API.delete('/api/dashboard/retrain'),
};

export default API;
