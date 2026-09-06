import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';
import { useBottomSheet } from '../src/hooks/useBottomSheet';
import { useSheetDismiss } from '../src/hooks/useSheetDismiss';
import { useAsyncData } from '../src/hooks/useAsyncData';
import CategoryCard from '../src/components/ui/CategoryCard';
import CategoryForm from '../src/components/forms/CategoryForm';
import EmptyState from '../src/components/ui/EmptyState';
import ErrorState from '../src/components/ui/ErrorState';
import CategoryGridSkeleton from '../src/components/skeletons/CategoryGridSkeleton';
import { categoryService } from '../src/services/categoryService';
import { screenStyles } from '../src/theme/screenStyles';
import { TOUCH_TARGET } from '../src/theme/shapes';
import type { Category } from '../src/types';
import { getErrorMessage } from '../src/utils/error';

type TabType = 'expense' | 'income';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = localStyles;

  const [tab, setTab] = useState<TabType>('expense');
  const [saving, setSaving] = useState(false);

  const { sheetRef, snapPoints, editing, formKey, isOpen, openAdd, openEdit, closeSheet, handleSheetChange } = useBottomSheet<Category>();

  useSheetDismiss([{ ref: sheetRef, open: isOpen, onClose: closeSheet }]);

  const {
    data: categories, loading, refreshing, error, refresh, reload, retry,
  } = useAsyncData<Category[]>({
    fetcher: useCallback(() => categoryService.getAll(), []),
    initial: [],
  });

  const filtered = useMemo(() => categories.filter((c) => c.type === tab), [categories, tab]);

  const handleSubmit = async (data: Omit<Category, '_id' | 'isDefault'>) => {
    setSaving(true);
    try {
      if (editing) {
        await categoryService.update(editing._id, data);
      } else {
        await categoryService.create(data);
      }
      closeSheet();
      reload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((cat: Category) => {
    if (cat.isDefault) return Alert.alert(t('categories.cannot_delete_title'), t('categories.cannot_delete_message'));
    Alert.alert(t('categories.delete_title'), t('categories.delete_message', { name: cat.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await categoryService.delete(cat._id);
            reload();
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  }, [t, reload]);

  const renderItem = useCallback(({ item }: { item: Category }) => (
    <View style={s.gridItem}>
      <CategoryCard
        category={item}
        onEdit={() => openEdit(item)}
        onDelete={() => handleDelete(item)}
      />
    </View>
  ), [openEdit, handleDelete]);

  const listEmpty = loading ? (
    <CategoryGridSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : (
    <EmptyState
      icon="grid"
      title={tab === 'expense' ? t('categories.empty_expense') : t('categories.empty_income')}
      subtitle={t('categories.empty_subtitle')}
      onAction={openAdd}
      actionLabel={t('categories.add')}
    />
  );

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { paddingBottom: 12 }]}>
        <View style={ss.headerLeft}>
          <TouchableOpacity
            style={ss.backBtn}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.back')}
          >
            <Feather name="arrow-left" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('categories.title')}</Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={t('categories.add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[s.tabs, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
        {(['expense', 'income'] as TabType[]).map((tabType) => (
          <TouchableOpacity
            key={tabType}
            style={[s.tab, tab === tabType && { backgroundColor: colors.primary }]}
            onPress={() => setTab(tabType)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === tabType }}
          >
            <Text style={[s.tabText, { color: tab === tabType ? '#fff' : colors.textSecondary }]}>
              {tabType === 'expense' ? t('categories.tab_expenses') : t('categories.tab_income')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        numColumns={3}
        columnWrapperStyle={s.row}
        contentContainerStyle={ss.scroll}
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={listEmpty}
        removeClippedSubviews
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={11}
      />

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onChange={handleSheetChange}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
        backgroundStyle={{ backgroundColor: colors.bgPrimary }}
        handleIndicatorStyle={{ backgroundColor: colors.borderColor }}
      >
        <BottomSheetScrollView>
          <CategoryForm
            key={formKey}
            initial={editing ? { ...editing, type: tab } : { type: tab }}
            onSubmit={handleSubmit}
            onCancel={closeSheet}
            loading={saving}
          />
        </BottomSheetScrollView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  tabs: { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  tab: { flex: 1, minHeight: TOUCH_TARGET, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 14, fontWeight: '600' },
  row: { gap: 10, marginBottom: 10 },
  // Capped so a last row holding one or two tiles keeps the column width
  // instead of stretching them across the screen.
  gridItem: { flex: 1, maxWidth: '31%' },
});
