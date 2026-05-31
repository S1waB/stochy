import api from './axios';
export const getLoans = () => api.get('/loans');
export const getLoan = (id) => api.get(`/loans/${id}`);
export const getAmortization = (id) => api.get(`/loans/${id}/amortization`);
export const createLoan = (data) => api.post('/loans', data);
export const markRepaymentPaid = (loanId, data) => api.post(`/loans/${loanId}/repayments`, data);
export const deleteLoan = (id) => api.delete(`/loans/${id}`);
