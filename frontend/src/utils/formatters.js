export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

export const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export const formatDateTime = (date) => `${formatDate(date)}, ${formatTime(date)}`;

export const maskUpi = (upi) => {
  if (!upi) return '';
  const [name, domain] = upi.split('@');
  return name.substring(0, 3) + '***@' + domain;
};
