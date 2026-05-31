import api from './axios';
export const getBudgets = (params) => api.get('/budgets', { params });
export const getBudgetStatus = (month, year) => api.get('/budgets/status', { params: { month, year } });
export const createBudget = (data) => api.post('/budgets', data);
export const duplicateBudgets = (data) => api.post('/budgets/duplicate', data);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
