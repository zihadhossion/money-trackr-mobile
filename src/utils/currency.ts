export const SUPPORTED_CURRENCIES = [
  { code: 'BDT', symbol: '৳', label: 'BDT - Bangladeshi Taka' },
  { code: 'USD', symbol: '$', label: 'USD - US Dollar' },
  { code: 'EUR', symbol: '€', label: 'EUR - Euro' },
  { code: 'GBP', symbol: '£', label: 'GBP - British Pound' },
  { code: 'INR', symbol: '₹', label: 'INR - Indian Rupee' },
] as const;

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]['code'];

export const DEFAULT_CURRENCY: CurrencyCode = 'BDT';

export function getCurrencySymbol(currency: string = DEFAULT_CURRENCY): string {
  return SUPPORTED_CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$';
}

// Grouping is fixed to en-US: Hermes ships only a partial ICU, so a locale it
// doesn't carry silently falls back and the same amount renders two ways.
// Fraction digits are 0-2 so a whole amount stays ৳45,000 — the totals and the
// list rows below them have to agree.
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  return `${getCurrencySymbol(currency)}${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
