import { StyleSheet } from 'react-native';
import type { Colors } from './colors';

export const formStyles = (colors: Colors) => StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, paddingHorizontal: 12 },
  currencySymbol: { fontSize: 18, color: colors.textMuted, marginRight: 8 },
  amountInput: { flex: 1, fontSize: 18, color: colors.textPrimary, paddingVertical: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, color: colors.textPrimary, padding: 12, fontSize: 14 },
  select: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, backgroundColor: colors.bgTertiary, padding: 12 },
  selectText: { fontSize: 14 },
  dropdown: { borderRadius: 10, marginTop: 4, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderColor },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderColor },
  dropdownText: { fontSize: 14 },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24, marginBottom: 40 },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: colors.borderColor, borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
  submitBtn: { flex: 2, borderRadius: 10, padding: 14, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});
