import { StyleSheet } from 'react-native';
import type { Colors } from './colors';
import { fontSize, fontWeight } from './typography';

export const formStyles = (colors: Colors) => StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: fontSize.emphasis, fontWeight: fontWeight.bold, color: colors.textPrimary, marginBottom: 20 },
  label: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold, color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, paddingHorizontal: 12 },
  currencySymbol: { fontSize: fontSize.emphasis, color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: fontSize.emphasis, color: colors.textPrimary, paddingVertical: 12, fontWeight: fontWeight.semibold },
  input: { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, color: colors.textPrimary, padding: 12, fontSize: fontSize.body },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, padding: 12 },
  selectText: { fontSize: fontSize.body },
  dropdown: { borderRadius: 10, marginTop: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderColor, maxHeight: 280 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderColor },
  dropdownText: { fontSize: fontSize.body },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: '#fff' },
});
