export const ALLOWED_EMAIL_DOMAINS = Object.freeze([
  'nst.rishihood.edu.in',
  'rishihood.edu.in',
]);

export function normalizeEmail(email) {
  if (typeof email !== 'string') {
    return '';
  }
  return email.trim().toLowerCase();
}

export function isAllowedEmailDomain(email) {
  if (typeof email !== 'string') {
    return false;
  }

  const normalized = normalizeEmail(email);
  const parts = normalized.split('@');

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return false;
  }

  return ALLOWED_EMAIL_DOMAINS.includes(parts[1]);
}
