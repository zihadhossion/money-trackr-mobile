import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PaginationFooterProps {
  loadingMore: boolean;
  color: string;
}

/**
 * Only ever a spinner: FlatList's onEndReached already loads the next page as
 * soon as the list is scrolled to the end, so a manual "load more" button was
 * replaced by the spinner before anyone could tap it.
 */
export default function PaginationFooter({ loadingMore, color }: PaginationFooterProps) {
  const { t } = useTranslation();

  if (!loadingMore) return null;

  return (
    <View style={styles.container} accessible accessibilityLabel={t('a11y.loading_more')}>
      <ActivityIndicator color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: 48, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
});
