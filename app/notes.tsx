import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Alert, RefreshControl, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';
import { useBottomSheet } from '../src/hooks/useBottomSheet';
import NoteCard from '../src/components/ui/NoteCard';
import NoteForm from '../src/components/forms/NoteForm';
import EmptyState from '../src/components/ui/EmptyState';
import NoteListSkeleton from '../src/components/skeletons/NoteListSkeleton';
import { notesService } from '../src/services/notesService';
import { screenStyles } from '../src/theme/screenStyles';
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
  const [notes, setNotes] = useState<Note[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { sheetRef, snapPoints, editing, formKey, openAdd, openEdit, closeSheet } = useBottomSheet<Note>();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchNotes = useCallback(async (targetPage: number, append: boolean) => {
    try {
      const result = await notesService.getAll({
        search: debouncedSearch || undefined,
        page: targetPage,
        limit: PAGE_SIZE,
      });
      setNotes((prev) => (append ? [...prev, ...result.notes] : result.notes));
      setPage(result.page);
      setTotalPages(result.totalPages);
    } catch (e) {
      console.error('Notes fetch error:', e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  }, [debouncedSearch]);

  // Re-runs on every search change, always resetting to the first page.
  useEffect(() => {
    setLoading(true);
    fetchNotes(1, false);
  }, [fetchNotes]);

  const handleSubmit = async (data: NotePayload) => {
    setSaving(true);
    try {
      if (editing) {
        const updated = await notesService.update(editing._id, data);
        setNotes((prev) => prev.map((n) => (n._id === editing._id ? updated : n)));
      } else {
        const created = await notesService.create(data);
        setNotes((prev) => [created, ...prev]);
      }
      closeSheet();
    } catch (e) {
      Alert.alert(t('common.error'), getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (note: Note) => {
    Alert.alert(t('notes.delete_title'), t('notes.delete_message', { title: note.title }), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'), style: 'destructive', onPress: async () => {
          try {
            await notesService.delete(note._id);
            setNotes((prev) => prev.filter((n) => n._id !== note._id));
          } catch (e) {
            Alert.alert(t('common.error'), getErrorMessage(e));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[ss.safe, { backgroundColor: colors.bgSecondary }]}>
      <View style={[ss.header, { paddingBottom: 12 }]}>
        <View style={s.headerLeft}>
          <TouchableOpacity
            style={s.backBtn}
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

      <ScrollView
        contentContainerStyle={ss.scroll}
        keyboardShouldPersistTaps="handled"
        // No pull-to-refresh mid-load: it would fire a duplicate request on top
        // of the one already in flight. Scrolling stays enabled.
        refreshControl={
          loading ? undefined : (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotes(1, false); }}
              tintColor={colors.primary}
            />
          )
        }
      >
        {loading ? (
          <NoteListSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState
            icon="file-text"
            title={debouncedSearch ? t('notes.empty_search') : t('notes.empty')}
            subtitle={debouncedSearch ? t('notes.empty_search_subtitle') : t('notes.empty_subtitle')}
            onAction={debouncedSearch ? undefined : openAdd}
            actionLabel={debouncedSearch ? undefined : t('notes.add')}
          />
        ) : (
          <>
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                note={note}
                onEdit={() => openEdit(note)}
                onDelete={() => handleDelete(note)}
              />
            ))}
            {page < totalPages && (
              <TouchableOpacity
                style={[s.loadMore, { borderColor: colors.borderColor }]}
                onPress={() => { setLoadingMore(true); fetchNotes(page + 1, true); }}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <Text style={[s.loadMoreText, { color: colors.primary }]}>{t('notes.load_more')}</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>

      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  clearBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  loadMore: { borderWidth: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 6 },
  loadMoreText: { fontSize: 14, fontWeight: '600' },
});
