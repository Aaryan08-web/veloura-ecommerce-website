export function isValidEmail(email?: string): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhone(phone?: string): boolean {
  if (!phone) return false;
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phone.trim().length >= 7 && phoneRegex.test(phone.trim());
}

export function isValidPostalCode(postalCode?: string): boolean {
  if (!postalCode) return false;
  return postalCode.trim().length >= 3;
}
