import api from './axios';
export const getDashboard = (month, year) => api.get('/dashboard', { params: { month, year } });
