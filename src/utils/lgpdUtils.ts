/**
 * Utility functions for LGPD (Lei Geral de Proteção de Dados - Lei nº 13.709/2018)
 * Data Masking, Anonymization, and Privacy Controls
 */

export interface LgpdConsentSettings {
  essential: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  baasSharing: boolean;
  updatedAt: string;
}

export const DEFAULT_LGPD_CONSENT: LgpdConsentSettings = {
  essential: true,
  analytics: true,
  marketing: true,
  baasSharing: true,
  updatedAt: new Date().toISOString()
};

/**
 * Mask CPF: 123.456.789-00 -> 123.***.***-00
 */
export function maskCpf(cpf: string): string {
  if (!cpf) return '';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length < 11) return '***.***.***-**';
  return `${clean.substring(0, 3)}.***.***-${clean.substring(9, 11)}`;
}

/**
 * Mask CNPJ
 */
export function maskCnpj(cnpj: string): string {
  if (!cnpj) return '';
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length < 14) return '**.***.***/****-**';
  return `${clean.substring(0, 2)}.***.***/${clean.substring(8, 12)}-${clean.substring(12, 14)}`;
}

/**
 * Mask Email: usuario@dominio.com.br -> u***o@d***o.com.br
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return 'a***@d***.com';
  const [user, domain] = email.split('@');
  const maskedUser = user.length > 2 
    ? `${user[0]}***${user[user.length - 1]}` 
    : `${user[0]}***`;
  const domainParts = domain.split('.');
  const maskedDomain = domainParts[0].length > 2
    ? `${domainParts[0][0]}***${domainParts[0][domainParts[0].length - 1]}`
    : `${domainParts[0][0]}***`;
  
  return `${maskedUser}@${maskedDomain}.${domainParts.slice(1).join('.')}`;
}

/**
 * Mask Phone: (11) 98765-4321 -> (11) 9****-4321
 */
export function maskPhone(phone: string): string {
  if (!phone) return '(**) *****-****';
  const clean = phone.replace(/\D/g, '');
  if (clean.length < 10) return '(**) *****-****';
  const ddd = clean.substring(0, 2);
  const lastFour = clean.substring(clean.length - 4);
  return `(${ddd}) 9****-${lastFour}`;
}

/**
 * Mask Name: João Silva de Oliveira -> João S. d. O.
 */
export function maskName(name: string): string {
  if (!name) return 'Titular Protegido';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const maskedRest = parts.slice(1).map(p => p.length > 2 ? `${p[0]}.` : p).join(' ');
  return `${first} ${maskedRest}`;
}

/**
 * Anonymize string permanently for LGPD "Right to Erasure"
 */
export function lgpdAnonymize(text: string): string {
  return `[ANONIMIZADO_LGPD_${Math.random().toString(36).substring(2, 7).toUpperCase()}]`;
}

/**
 * Get stored consent or default
 */
export function getLgpdConsent(): LgpdConsentSettings {
  try {
    const stored = localStorage.getItem('nercash_lgpd_consent');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error reading LGPD consent from localStorage', err);
  }
  return DEFAULT_LGPD_CONSENT;
}

/**
 * Save LGPD consent settings
 */
export function saveLgpdConsent(settings: LgpdConsentSettings): void {
  try {
    localStorage.setItem('nercash_lgpd_consent', JSON.stringify({
      ...settings,
      updatedAt: new Date().toISOString()
    }));
  } catch (err) {
    console.error('Error saving LGPD consent to localStorage', err);
  }
}
