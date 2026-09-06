import { PALETTE_COLORS } from '../theme/colors';

// The backend defaults `color` to the string 'indigo' and the web client never
// sets it, so notes created there arrive with a name rather than a hex value.
const NAMED: Record<string, string> = {
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  violet: '#8b5cf6',
  cyan: '#06b6d4',
};

export const NOTE_COLORS = PALETTE_COLORS;

export function resolveNoteColor(color?: string): string {
  if (!color) return NOTE_COLORS[0];
  if (color.startsWith('#')) return color;
  return NAMED[color.toLowerCase()] ?? NOTE_COLORS[0];
}
