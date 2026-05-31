import api from './axios';
export const getSavingConfigs = () => api.get('/savings/configs');
export const createSavingConfig = (data) => api.post('/savings/configs', data);
export const updateSavingConfig = (id, data) => api.put(`/savings/configs/${id}`, data);
export const toggleSavingConfig = (id) => api.patch(`/savings/configs/${id}/toggle`);
export const deleteSavingConfig = (id) => api.delete(`/savings/configs/${id}`);
export const getSavingsBalance = () => api.get('/savings/balance');
