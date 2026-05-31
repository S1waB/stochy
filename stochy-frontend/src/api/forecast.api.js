import api from './axios';
export const getForecast = (months) => api.get('/forecast', { params: { months } });
