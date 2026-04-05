import { format, startOfMonth, endOfMonth, type Locale } from 'date-fns';
import { enUS, bn } from 'date-fns/locale';

export const DATE_FNS_LOCALES: Record<string, Locale> = {
  en: enUS,
  bn,
};

export function getMonthDateRange(year: number, month: number) {
  const date = new Date(year, month - 1, 1);
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return {
    startDate: format(start, 'yyyy-MM-dd'),
    endDate: format(end, 'yyyy-MM-dd'),
  };
}

export function formatDate(dateStr: string, locale: Locale = enUS): string {
  if (!dateStr) return '';
  try {
    return format(new Date(dateStr), 'MMM dd, yyyy', { locale });
  } catch {
    return dateStr;
  }
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
