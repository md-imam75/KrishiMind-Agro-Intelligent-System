import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('km_access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const refresh = localStorage.getItem('km_refresh_token');
        const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/refresh`, { refresh_token: refresh });
        localStorage.setItem('km_access_token', data.access_token);
        localStorage.setItem('km_refresh_token', data.refresh_token);
        error.config.headers.Authorization = `Bearer ${data.access_token}`;
        return api(error.config);
      } catch {
        localStorage.removeItem('km_access_token');
        localStorage.removeItem('km_refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/bn/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API calls
export const authApi = {
  requestOtp: (phone: string) => api.post('/api/v1/auth/otp/request', { phone }),
  verifyOtp: (phone: string, otp: string) => api.post('/api/v1/auth/otp/verify', { phone, otp }),
  officerLogin: (email: string, password: string) => api.post('/api/v1/auth/officer/login', { email, password }),
  logout: (refresh_token: string) => api.post('/api/v1/auth/logout', { refresh_token }),
  refresh: (refresh_token: string) => api.post('/api/v1/auth/refresh', { refresh_token }),
};

// Farmer API calls
export const farmerApi = {
  getProfile: () => api.get('/api/v1/farmer/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/api/v1/farmer/profile', data),
  getCompleteness: () => api.get('/api/v1/farmer/profile/completeness'),
  getPlots: () => api.get('/api/v1/farmer/plots'),
  createPlot: (data: Record<string, unknown>) => api.post('/api/v1/farmer/plots', data),
  updatePlot: (id: string, data: Record<string, unknown>) => api.put(`/api/v1/farmer/plots/${id}`, data),
  getActiveCrop: (plotId: string) => api.get(`/api/v1/farmer/plots/${plotId}/crop`),
  setActiveCrop: (plotId: string, data: Record<string, unknown>) => api.post(`/api/v1/farmer/plots/${plotId}/crop`, data),
  harvestCrop: (plotId: string) => api.post(`/api/v1/farmer/plots/${plotId}/harvest`),
  getCropHistory: (plotId: string) => api.get(`/api/v1/farmer/plots/${plotId}/history`),
  getAllCropHistory: () => api.get('/api/v1/farmer/history'),
  addCropHistory: (plotId: string, data: Record<string, unknown>) => api.post(`/api/v1/farmer/plots/${plotId}/history`, data),
};

// AI Intelligence API calls
export const aiApi = {
  recommendCrops: (data: {
    district: string;
    soil_type: string;
    season: string;
    water_availability: string;
    elevation: string;
    land_decimal?: number;
  }) => api.post('/api/v1/ai/crop-recommendation', data),

  scanDisease: (formData: FormData) =>
    api.post('/api/v1/ai/disease/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getDiseaseHistory: () => api.get('/api/v1/ai/disease/history'),

  predictYield: (data: {
    crop_name: string;
    variety?: string;
    land_decimal: number;
    soil_type: string;
    water_availability: string;
    district: string;
  }) => api.post('/api/v1/ai/yield-prediction', data),

  getWeather: (district: string) => api.get(`/api/v1/ai/weather/${district}`),

  getAdvisory: (district: string) => api.get(`/api/v1/ai/weather/${district}/advisory`),
};

// Phase 3 Intelligence API calls
export const intelligenceApi = {
  getMarketPrices: (district?: string) => api.get('/api/v1/intelligence/market/prices' + (district ? `?district=${district}` : '')),
  chatAssistant: (message: string, history: any[]) => api.post('/api/v1/intelligence/assistant/chat', { message, history }),
  getNotifications: () => api.get('/api/v1/intelligence/notifications'),
  markNotificationRead: (id: string) => api.post(`/api/v1/intelligence/notifications/${id}/read`),
  getRiskHeatmap: (district: string) => api.get(`/api/v1/intelligence/risk/heatmap?district=${district}`),
};

// Phase 4 Officer API calls
export const officerApi = {
  getStats: () => api.get('/api/v1/officer/stats'),
  getFarmers: () => api.get('/api/v1/officer/farmers'),
  getHeatmap: () => api.get('/api/v1/officer/heatmap'),
  broadcastAlert: (data: { district: string, upazila?: string, title: string, message: string, severity: string, type: string }) => api.post('/api/v1/officer/alerts', data)
};
