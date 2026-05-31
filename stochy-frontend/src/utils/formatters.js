export const formatCurrency = (amount, currency = 'TND') => {
  if (amount == null) return '0.00 ' + currency;
  return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ' + currency;
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatPercent = (value) => {
  if (value == null) return '0%';
  return Math.round(value) + '%';
};

export const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  return months[parseInt(m) - 1] + ' ' + y;
};
