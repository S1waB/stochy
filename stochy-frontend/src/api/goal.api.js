import api from './axios';
export const getGoals = (params) => api.get('/goals', { params });
export const getGoal = (id) => api.get(`/goals/${id}`);
export const createGoal = (data) => api.post('/goals', data);
export const updateGoal = (id, data) => api.put(`/goals/${id}`, data);
export const contributeToGoal = (id, data) => api.post(`/goals/${id}/contribute`, data);
export const changeFundingMode = (id, fundingMode) => api.patch(`/goals/${id}/funding-mode`, { fundingMode });
export const deleteGoal = (id) => api.delete(`/goals/${id}`);
