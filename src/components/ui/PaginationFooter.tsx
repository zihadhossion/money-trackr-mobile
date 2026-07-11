import React from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface PaginationFooterProps {
  loadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  color: string;
  loadMoreText: string;
}

export default function PaginationFooter({
  loadingMore,
  hasMore,
  onLoadMore,
  color,
  loadMoreText,
}: PaginationFooterProps) {
  if (loadingMore) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={color} />
      </View>
    );
  }

  if (hasMore) {
    return (
      <TouchableOpacity style={styles.container} onPress={onLoadMore}>
        <Text style={[styles.text, { color }]}>{loadMoreText}</Text>
      </TouchableOpacity>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { paddingVertical: 16, alignItems: 'center' },
  text: { fontSize: 14, fontWeight: '600' },
});
