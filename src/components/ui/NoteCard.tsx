import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { resolveNoteColor } from '../../utils/noteColor';
import type { Note } from '../../types';
import RowAction from './RowAction';
import { NOTE_CARD as C } from '../../theme/shapes';
import { fontSize, fontWeight, lineHeight } from '../../theme/typography';

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
    // The card is a plain View so the text block and the buttons are siblings:
    // an `accessible` parent would swallow the buttons on iOS. Editing used to
    // be a tap on the card itself, which nothing else in the app does and
    // nothing on screen announced — it is an explicit button now.
    <View style={[styles.card, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <View
        style={styles.body}
        accessible
        accessibilityRole="text"
        accessibilityLabel={t('a11y.note_item', { title: note.title, content: note.content })}
      >
        <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
          {note.title}
        </Text>
        <Text style={[styles.content, { color: colors.textSecondary }]} numberOfLines={3}>
          {note.content}
        </Text>
      </View>
      <View style={styles.actions}>
        <RowAction
          icon="edit-2"
          color={colors.primary}
          onPress={onEdit}
          accessibilityLabel={t('a11y.edit_note', { title: note.title })}
        />
        <RowAction
          icon="trash-2"
          color={colors.danger}
          onPress={onDelete}
          accessibilityLabel={t('a11y.delete_note', { title: note.title })}
          accessibilityHint={t('a11y.delete_hint')}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: C.radius, borderWidth: 1, overflow: 'hidden', marginBottom: C.marginBottom },
  accent: { width: C.accentWidth },
  body: { flex: 1, padding: C.padding, paddingRight: 4 },
  title: { fontSize: fontSize.body, fontWeight: fontWeight.bold, marginBottom: 4 },
  content: { fontSize: fontSize.meta, lineHeight: lineHeight.meta },
  // Pinned to the top so the pair does not drift as the content grows to three lines.
  actions: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 6, paddingRight: 4 },
});
