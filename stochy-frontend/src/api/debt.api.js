import api from './axios';
export const getDebts = (status) => api.get('/debts', { params: status ? { status } : {} });
export const createDebt = (data) => api.post('/debts', data);
export const addDebtRepayment = (id, data) => api.post(`/debts/${id}/repayments`, data);
export const deleteDebt = (id) => api.delete(`/debts/${id}`);
