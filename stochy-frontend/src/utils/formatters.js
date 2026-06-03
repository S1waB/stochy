export const formatCurrency = (amount, currency = 'TND') => {
  if (amount == null) return '0.00 ' + currency;
  return new Intl.NumberFormat('fr-TN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) + ' ' + currency;
};

export const formatDate = (date) => {
  if (!date) return '-';
  const lang = localStorage.getItem('stochy_lang') || 'fr';
  return new Date(date).toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatPercent = (value) => {
  if (value == null) return '0%';
  return Math.round(value) + '%';
};

export const formatMonth = (ym) => {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const lang = localStorage.getItem('stochy_lang') || 'fr';
  const monthsFr = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const months = lang === 'en' ? monthsEn : monthsFr;
  return months[parseInt(m) - 1] + ' ' + y;
};
