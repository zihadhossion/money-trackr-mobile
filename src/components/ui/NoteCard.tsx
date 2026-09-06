import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { resolveNoteColor } from '../../utils/noteColor';
import type { Note } from '../../types';
import { NOTE_CARD as C } from '../../theme/shapes';

interface NoteCardProps {
  note: Note;
  onEdit: () => void;
  onDelete: () => void;
}

export default React.memo(function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const accent = resolveNoteColor(note.color);

  return (
    // The card is a plain View so the edit target and the delete button are
    // siblings: a TouchableOpacity wrapping another one hides the inner button
    // from the accessibility tree on iOS.
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <TouchableOpacity
        style={styles.body}
        onPress={onEdit}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.note_item', { title: note.title, content: note.content })}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={3}>
          {note.content}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.delete_note', { title: note.title })}
        accessibilityHint={t('a11y.delete_hint')}
      >
        <Feather name="trash-2" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: C.radius, borderWidth: 1, overflow: 'hidden', marginBottom: C.marginBottom },
  accent: { width: C.accentWidth },
  body: { flex: 1, padding: C.padding, paddingRight: 8 },
  title: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  content: { fontSize: 13, lineHeight: 19 },
  deleteBtn: { width: 48, minHeight: 48, paddingTop: 14, alignItems: 'center' },
});
