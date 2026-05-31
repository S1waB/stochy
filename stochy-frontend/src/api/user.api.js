import api from './axios';
export const getProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const updateCurrency = (currency) => api.patch('/users/me/currency', { currency });
export const uploadProfilePic = (formData) => api.post('/users/me/profile-pic', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
