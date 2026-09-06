import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
import { NOTE_COLORS, resolveNoteColor } from '../../utils/noteColor';
import type { Note, NotePayload } from '../../types';

interface NoteFormProps {
  initial?: Partial<Note>;
  onSubmit: (data: NotePayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function NoteForm({ initial, onSubmit, onCancel, loading }: NoteFormProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => localStyles(colors), [colors]);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [color, setColor] = useState(resolveNoteColor(initial?.color));

  async function handleSubmit() {
    if (!title.trim()) return Alert.alert(t('common.validation'), t('validation.enter_note_title'));
    if (!content.trim()) return Alert.alert(t('common.validation'), t('validation.enter_note_content'));
    await onSubmit({ title: title.trim(), content: content.trim(), color });
  }

  return (
    <ScrollView style={fs.container} keyboardShouldPersistTaps="handled">
      <Text style={fs.title}>{initial?._id ? t('notes.edit') : t('notes.add')}</Text>

      <Text style={fs.label}>{t('notes.title_label')}</Text>
      <BottomSheetTextInput
        style={fs.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t('notes.title_placeholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('a11y.note_title_input')}
      />

      <Text style={fs.label}>{t('notes.content_label')}</Text>
      <BottomSheetTextInput
        style={[fs.input, s.textarea]}
        value={content}
        onChangeText={setContent}
        placeholder={t('notes.content_placeholder')}
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
        accessibilityLabel={t('a11y.note_content_input')}
      />

      <Text style={fs.label}>{t('notes.color_label')}</Text>
      <View style={s.colorRow}>
        {NOTE_COLORS.map((c, i) => (
          <TouchableOpacity
            key={c}
            style={[s.colorSwatch, { backgroundColor: c }, color === c && s.colorSelected]}
            onPress={() => setColor(c)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.color_option', { index: String(i + 1) })}
            accessibilityState={{ selected: color === c }}
          />
        ))}
      </View>

      <View style={fs.buttons}>
        <TouchableOpacity style={fs.cancelBtn} onPress={onCancel} accessibilityRole="button" accessibilityLabel={t('common.cancel')}>
          <Text style={[fs.cancelText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[fs.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel={t('common.save')}
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          <Text style={fs.submitText}>{loading ? t('common.saving') : t('common.save')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const localStyles = (colors: any) => StyleSheet.create({
  textarea: { minHeight: 140, paddingTop: 12 },
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorSwatch: { width: 34, height: 34, borderRadius: 17 },
  colorSelected: { borderWidth: 3, borderColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
});
