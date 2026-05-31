import api from './axios';
export const getAdminUsers = (params) => api.get('/admin/users', { params });
export const getAdminUser = (id) => api.get(`/admin/users/${id}`);
export const toggleUserActive = (id) => api.patch(`/admin/users/${id}/toggle-active`);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const createAdmin = (data) => api.post('/admin/admins', data);
export const getAdminDashboard = () => api.get('/admin/dashboard');
