import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useBottomSheet } from '../../src/hooks/useBottomSheet';
import CategoryCard from '../../src/components/ui/CategoryCard';
import CategoryForm from '../../src/components/forms/CategoryForm';
import EmptyState from '../../src/components/ui/EmptyState';
import { categoryService } from '../../src/services/categoryService';
import { screenStyles } from '../../src/theme/screenStyles';
import type { Category } from '../../src/types';

type TabType = 'expense' | 'income';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = localStyles;

  const [tab, setTab] = useState<TabType>('expense');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { sheetRef, snapPoints, editing, openAdd, openEdit, closeSheet } = useBottomSheet<Category>();

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const filtered = categories.filter((c) => c.type === tab);

  const handleSubmit = async (data: Omit<Category, '_id' | 'isDefault'>) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await categoryService.update(editing._id, data);
        setCategories((prev) => prev.map((c) => (c._id === editing._id ? updated : c)));
      } else {
        const created = await categoryService.create(data);
        setCategories((prev) => [...prev, created]);
      }
      closeSheet();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.message || t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat: Category) => {
    if (cat.isDefault) return Alert.alert(t('categories.cannot_delete_title'), t('categories.cannot_delete_message'));
    Alert.alert(t('categories.delete_title'), t('categories.delete_message', { name: cat.name }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await categoryService.delete(cat._id);
            setCategories((prev) => prev.filter((c) => c._id !== cat._id));
          } catch (e: any) {
            Alert.alert(t('common.error'), e.message || t('common.error'));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { paddingBottom: 12 }]}>
        <Text style={[ss.title, { color: colors.textPrimary }]}>{t('categories.title')}</Text>
        <TouchableOpacity style={[ss.addBtn, { backgroundColor: colors.primary }]} onPress={openAdd}>
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
          >
            <Text style={[s.tabText, { color: tab === tabType ? '#fff' : colors.textMuted }]}>
              {tabType === 'expense' ? t('categories.tab_expenses') : t('categories.tab_income')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={ss.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCategories(); }} tintColor={colors.primary} />}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <EmptyState icon="grid" title={tab === 'expense' ? t('categories.empty_expense') : t('categories.empty_income')} subtitle={t('categories.empty_subtitle')} onAction={openAdd} actionLabel={t('categories.add')} />
        ) : (
          <View style={s.grid}>
            {filtered.map((cat) => (
              <View key={cat._id} style={s.gridItem}>
                <CategoryCard
                  category={cat}
                  onEdit={() => openEdit(cat)}
                  onDelete={() => handleDelete(cat)}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <BottomSheet ref={sheetRef} index={-1} snapPoints={snapPoints} enablePanDownToClose backgroundStyle={{ backgroundColor: colors.bgPrimary }} handleIndicatorStyle={{ backgroundColor: colors.borderColor }}>
        <BottomSheetScrollView>
          <CategoryForm
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
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabText: { fontSize: 14, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '30%' },
});
