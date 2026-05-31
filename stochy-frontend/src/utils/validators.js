export const required = (msg = 'Ce champ est obligatoire') => ({ required: msg });
export const email = { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } };
export const minLength = (n) => ({ minLength: { value: n, message: `Minimum ${n} caractères` } });
export const maxLength = (n) => ({ maxLength: { value: n, message: `Maximum ${n} caractères` } });
export const minValue = (n) => ({ min: { value: n, message: `Minimum ${n}` } });
