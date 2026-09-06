import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  title?: string;
  /** Inline footer variant, for when the list already has rows on screen. */
  compact?: boolean;
}

export default React.memo(function ErrorState({ message, onRetry, title, compact }: ErrorStateProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (compact) {
    return (
      <View style={styles.compact}>
        <Text style={[styles.message, styles.compactMessage, { color: colors.danger }]} accessibilityRole="alert">
          {message}
        </Text>
        <TouchableOpacity
          style={[styles.compactBtn, { borderColor: colors.primary }]}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel={t('a11y.retry')}
        >
          <Text style={[styles.btnText, { color: colors.primary }]}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Sibling of the retry button on purpose: an `accessible` parent would
          hide the button from the accessibility tree on iOS. */}
      <View style={styles.group} accessible accessibilityRole="alert" accessibilityLabel={`${title ?? t('common.load_failed_title')}. ${message}`}>
        <View style={[styles.iconWrap, { backgroundColor: colors.dangerBg }]}>
          <Feather name="wifi-off" size={32} color={colors.danger} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {title ?? t('common.load_failed_title')}
        </Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      </View>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('a11y.retry')}
      >
        <Text style={styles.btnText}>{t('common.retry')}</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  group: { alignItems: 'center' },
  iconWrap: { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 6, textAlign: 'center' },
  message: { fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  btn: { borderRadius: 10, minHeight: 44, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  compact: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  compactMessage: { marginBottom: 0 },
  compactBtn: { borderRadius: 10, borderWidth: 1, minHeight: 44, paddingHorizontal: 24, justifyContent: 'center', alignItems: 'center' },
});
