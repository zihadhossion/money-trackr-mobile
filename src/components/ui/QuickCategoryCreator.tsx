import React, { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Keyboard } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BottomSheetTextInput, type BottomSheetScrollViewMethods } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { formStyles } from '../../theme/formStyles';
import { PALETTE_COLORS } from '../../theme/colors';
import type { Colors } from '../../theme/colors';
import type { Category } from '../../types';
import { TOUCH_TARGET, CATEGORY_EMOJI } from '../../theme/shapes';
import { fontSize, fontWeight } from '../../theme/typography';
import { getErrorMessage } from '../../utils/error';

// A subset of CategoryForm's emoji set, so the full editor still highlights
// the chosen icon when the category is edited later.
const ICONS: Record<Category['type'], string[]> = {
  expense: ['🍔', '🚗', '🏠', '💊', '📚', '👗', '🎮', '✈️', '⚡', '📱', '☕', '💪'],
  income: ['💰', '💻', '📈', '🎁', '🎯', '🌱', '🔧', '🏠', '📚', '🎬', '⚡', '💪'],
};

type NewCategory = Omit<Category, '_id' | 'isDefault'>;

// The sheet shrinks its viewport on the same keyboardDidShow event, and a
// scroll issued before that layout lands is clamped to the old, taller one.
// The first attempt catches it on most phones; the second finishes the job on
// a slow one and is a no-op otherwise, since the target has already been reached.
const SCROLL_ATTEMPTS_MS = [50, 250];

interface QuickCategoryCreatorProps {
  type: Category['type'];
  /** The account's categories of `type`: typing one of their names selects it
   *  instead of creating a duplicate the server would accept. */
  existing: Category[];
  /** The sheet's scroll view. The creator sits low in the form, and the sheet
   *  does not scroll a focused input clear of the keyboard by itself. */
  scrollRef: RefObject<BottomSheetScrollViewMethods | null>;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreate: (data: NewCategory) => Promise<Category>;
  onCreated: (category: Category) => void;
}

/**
 * Creates a category from inside the add expense/income form. Sending the
 * user to the Categories screen instead would throw away the amount and notes
 * they had already typed. Only name and icon are asked for: the type follows
 * the form and a colour is assigned; both stay editable on the Categories screen.
 */
export default function QuickCategoryCreator({
  type, existing, scrollRef, open, onOpen, onClose, onCreate, onCreated,
}: QuickCategoryCreatorProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const fs = useMemo(() => formStyles(colors), [colors]);
  const s = useMemo(() => styles(colors), [colors]);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState(ICONS[type][0]);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<View>(null);

  // Once the keyboard is up, bring the creator to the top of what is left of
  // the sheet. Also runs on open when the keyboard is already showing (the
  // amount field was focused), since no new show event fires then.
  useEffect(() => {
    if (!open) return;

    let timers: ReturnType<typeof setTimeout>[] = [];
    const scrollNow = () => {
      const scrollView = scrollRef.current;
      // gorhom's type leaves it out, but the ref is the RN ScrollView itself.
      const content = (scrollView as unknown as { getInnerViewRef?: () => View | null } | null)
        ?.getInnerViewRef?.();
      if (!scrollView || !content || !containerRef.current) return;
      containerRef.current.measureLayout(content, (_x, y) => {
        scrollView.scrollTo({ y: Math.max(0, y - 12), animated: true });
      });
    };
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const scrollIntoView = () => {
      clearTimers();
      timers = SCROLL_ATTEMPTS_MS.map((ms) => setTimeout(scrollNow, ms));
    };

    if (Keyboard.isVisible()) scrollIntoView();
    const sub = Keyboard.addListener('keyboardDidShow', scrollIntoView);
    return () => {
      sub.remove();
      clearTimers();
    };
  }, [open, scrollRef]);

  const canAdd = name.trim().length > 0 && !saving;

  function reset() {
    setName('');
    setIcon(ICONS[type][0]);
  }

  function handleCancel() {
    reset();
    onClose();
  }

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    const match = existing.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      reset();
      onCreated(match);
      return;
    }

    setSaving(true);
    try {
      const created = await onCreate({
        name: trimmed,
        type,
        icon,
        // Rotate through the palette so new slices stay apart in the pie chart.
        color: PALETTE_COLORS[existing.length % PALETTE_COLORS.length],
      });
      reset();
      onCreated(created);
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <TouchableOpacity
        style={s.addRow}
        onPress={onOpen}
        accessibilityRole="button"
        accessibilityLabel={t('categories.add')}
      >
        <Feather name="plus" size={16} color={colors.primary} />
        <Text style={s.addText}>{t('categories.add')}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View ref={containerRef} style={s.creator}>
      <Text style={s.heading}>{t('categories.add')}</Text>

      <BottomSheetTextInput
        style={[fs.input, { backgroundColor: colors.bgPrimary }]}
        value={name}
        onChangeText={setName}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={handleAdd}
        placeholder={t('common.category_name_placeholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('a11y.category_name_input')}
      />

      <View style={s.iconGrid}>
        {ICONS[type].map((e) => (
          <TouchableOpacity
            key={e}
            style={[s.iconBtn, icon === e && { borderColor: colors.primary, backgroundColor: `${colors.primary}15` }]}
            onPress={() => setIcon(e)}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.emoji_option', { icon: e })}
            accessibilityState={{ selected: icon === e }}
          >
            <Text style={s.icon}>{e}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.actions}>
        <TouchableOpacity
          style={s.cancelBtn}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <Text style={[s.btnText, { color: colors.textSecondary }]}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.addBtn, { backgroundColor: colors.primary, opacity: canAdd ? 1 : 0.5 }]}
          onPress={handleAdd}
          disabled={!canAdd}
          accessibilityRole="button"
          accessibilityLabel={t('common.add')}
          accessibilityState={{ disabled: !canAdd, busy: saving }}
        >
          <Text style={[s.btnText, { color: '#fff' }]}>{saving ? t('common.saving') : t('common.add')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: Colors) => StyleSheet.create({
  addRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    minHeight: TOUCH_TARGET, paddingHorizontal: 12,
  },
  addText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold, color: colors.primary },
  creator: { padding: 12, gap: 10 },
  heading: { fontSize: fontSize.meta, fontWeight: fontWeight.semibold, color: colors.textSecondary },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  iconBtn: {
    width: TOUCH_TARGET, height: TOUCH_TARGET, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: colors.borderColor,
  },
  icon: { fontSize: CATEGORY_EMOJI.optionSize },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, minHeight: TOUCH_TARGET, borderRadius: 10, borderWidth: 1, borderColor: colors.borderColor,
    justifyContent: 'center', alignItems: 'center',
  },
  addBtn: { flex: 1, minHeight: TOUCH_TARGET, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  btnText: { fontSize: fontSize.body, fontWeight: fontWeight.semibold },
});
