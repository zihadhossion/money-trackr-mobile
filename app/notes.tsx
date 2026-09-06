import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
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
import { usePagination } from '../src/hooks/usePagination';
import NoteCard from '../src/components/ui/NoteCard';
import NoteForm from '../src/components/forms/NoteForm';
import EmptyState from '../src/components/ui/EmptyState';
import ErrorState from '../src/components/ui/ErrorState';
import PaginationFooter from '../src/components/ui/PaginationFooter';
import NoteListSkeleton from '../src/components/skeletons/NoteListSkeleton';
import { notesService } from '../src/services/notesService';
import { screenStyles } from '../src/theme/screenStyles';
import { TOUCH_TARGET } from '../src/theme/shapes';
import type { Note, NotePayload } from '../src/types';
import { getErrorMessage } from '../src/utils/error';

const PAGE_SIZE = 20;

export default function NotesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const ss = useMemo(() => screenStyles(colors), [colors]);
  const s = localStyles;

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const {
    data: notes, loading, loadingMore, refreshing, error,
    reloading, refresh, reload, retry, loadMore,
  } = usePagination<Note>({
    fetcher: useCallback(async (page, pageSize) => {
      const { notes, totalPages } = await notesService.getAll({
        search: debouncedSearch || undefined,
        page,
        limit: pageSize,
      });
      return { data: notes, totalPages };
    }, [debouncedSearch]),
    deps: [debouncedSearch],
    pageSize: PAGE_SIZE,
  });

  const { sheetRef, snapPoints, editing, formKey, isOpen, openAdd, openEdit, closeSheet, handleSheetChange } = useBottomSheet<Note>();

  useSheetDismiss([{ ref: sheetRef, open: isOpen, onClose: closeSheet }]);

  const handleSubmit = async (data: NotePayload) => {
    setSaving(true);
    try {
      if (editing) {
        await notesService.update(editing._id, data);
      } else {
        await notesService.create(data);
      }
      closeSheet();
      reload();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = useCallback((note: Note) => {
    Alert.alert(t('notes.delete_title'), t('notes.delete_message', { title: note.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await notesService.delete(note._id);
            reload();
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  }, [t, reload]);

  const renderItem = useCallback(({ item }: { item: Note }) => (
    <NoteCard
      note={item}
      onEdit={() => openEdit(item)}
      onDelete={() => handleDelete(item)}
    />
  ), [openEdit, handleDelete]);

  const listEmpty = loading ? (
    <NoteListSkeleton />
  ) : error ? (
    <ErrorState message={error} onRetry={retry} />
  ) : (
    <EmptyState
      icon="file-text"
      title={debouncedSearch ? t('notes.empty_search') : t('notes.empty')}
      subtitle={debouncedSearch ? t('notes.empty_search_subtitle') : t('notes.empty_subtitle')}
      onAction={debouncedSearch ? undefined : openAdd}
      actionLabel={debouncedSearch ? undefined : t('notes.add')}
    />
  );

  // Rows already on screen: report the failure inline instead of replacing them.
  // No footer while page 1 is in flight or the list is empty: there is no
  // "end of list" to load past yet, and anything shown here would be a guess.
  const listFooter = reloading || notes.length === 0 ? null : error ? (
    <ErrorState compact message={error} onRetry={retry} />
  ) : (
    <PaginationFooter loadingMore={loadingMore} color={colors.primary} />
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
          <Text style={[ss.title, { color: colors.textPrimary }]}>{t('notes.title')}</Text>
        </View>
        <TouchableOpacity
          style={[ss.addBtn, { backgroundColor: colors.primary }]}
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel={t('notes.add')}
        >
          <Feather name="plus" size={20} color="#fff" />
          <Text style={ss.addBtnText}>{t('common.add')}</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[s.searchRow, { backgroundColor: colors.bgPrimary, borderColor: colors.borderColor }]}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={[s.searchInput, { color: colors.textPrimary }]}
          value={search}
          onChangeText={setSearch}
          placeholder={t('notes.search_placeholder')}
          placeholderTextColor={colors.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={s.clearBtn}
            onPress={() => setSearch('')}
            accessibilityRole="button"
            accessibilityLabel={t('a11y.clear_search')}
          >
            <Feather name="x" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={ss.scroll}
        keyboardShouldPersistTaps="handled"
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined
            : <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={listEmpty}
        ListFooterComponent={listFooter}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        removeClippedSubviews
        initialNumToRender={10}
        maxToRenderPerBatch={10}
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
          <NoteForm
            key={formKey}
            initial={editing ?? undefined}
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  clearBtn: { width: TOUCH_TARGET, height: TOUCH_TARGET, justifyContent: 'center', alignItems: 'center' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
});
