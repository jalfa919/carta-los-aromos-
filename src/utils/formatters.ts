/**
 * Formats a number to Chilean Pesos (CLP) standard notation (e.g. $13.990)
 */
export function formatCLP(amount: number): string {
  if (isNaN(amount)) return '$0';
  return '$' + Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Sanitizes Chilean phone number for wa.me links
 * Default: 56979553144
 */
export function sanitizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('569')) return digits;
  if (digits.startsWith('9') && digits.length === 9) return `56${digits}`;
  if (digits.length === 8) return `569${digits}`;
  return digits || '56979553144';
}
