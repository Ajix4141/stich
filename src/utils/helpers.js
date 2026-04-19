import { SHIRT_FIELDS, PANT_FIELDS } from '../constants/fields';

export const SHIRT_LABELS = Object.fromEntries(SHIRT_FIELDS.map(f => [f.key, f.label]));
export const PANT_LABELS  = Object.fromEntries(PANT_FIELDS.map(f => [f.key, f.label]));

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function avClass(name = '') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return `av${h % 8}`;
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function fmtDate(d) {
  if (!d) return '—';
  try {
    const [y, m, dd] = d.split('-');
    const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    return `${+dd} ${months[+m - 1]} ${y}`;
  } catch {
    return d;
  }
}

export function statusClass(s) {
  if (s === 'Ready') return 's-ready';
  if (s === 'Delivered') return 's-delivered';
  return 's-pending';
}

export function statusLabel(s) {
  if (s === 'Ready') return '✅ Ready';
  if (s === 'Delivered') return '📦 Delivered';
  return '⏳ Pending';
}

export function getKnownNames(customer) {
  if (!customer) return [];
  const sz = customer.Sizes || {};
  return [...new Set([
    ...Object.keys(sz.Shirts || {}),
    ...Object.keys(sz.Pants  || {}),
  ])];
}

export function buildAcHint(customer, name) {
  if (!customer) return 'New profile';
  const hasSh = !!(customer.Sizes?.Shirts?.[name] &&
    Object.values(customer.Sizes.Shirts[name]).some(Boolean));
  const hasPa = !!(customer.Sizes?.Pants?.[name] &&
    Object.values(customer.Sizes.Pants[name]).some(Boolean));
  if (hasSh && hasPa) return 'Shirt & Pant sizes saved';
  if (hasSh) return 'Shirt sizes saved';
  if (hasPa) return 'Pant sizes saved';
  return 'No sizes yet';
}
