import { StyleSheet } from 'react-native';
import type { Colors } from './colors';

export const screenStyles = (colors: Colors) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 100 },
});
