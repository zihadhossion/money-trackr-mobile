import { StyleSheet } from 'react-native';
import type { Colors } from './colors';
import { TOUCH_TARGET } from './shapes';
import { fontSize, fontWeight } from './typography';

export const screenStyles = (colors: Colors) => StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8 },
  // Back arrow + title, for the pushed screens that are not tabs.
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtn: { width: TOUCH_TARGET, height: TOUCH_TARGET, justifyContent: 'center', alignItems: 'flex-start' },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16 },
  addBtnText: { color: '#fff', fontWeight: fontWeight.semibold, fontSize: fontSize.body },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 100 },
});
