import { useRef, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type BottomSheet from '@gorhom/bottom-sheet';

export interface DismissibleSheet {
  ref: React.RefObject<BottomSheet | null>;
  open: boolean;
  /** Screen-side state to reset alongside the sheet itself. */
  onClose?: () => void;
}

/**
 * Ties a screen's bottom sheets to its focus.
 *
 * Two things fall out of tab screens staying mounted. A sheet left open
 * survives a trip to another tab, so an edit form can come back holding a row
 * that the refetch-on-focus has since changed or removed — and saving it then
 * writes to something that is no longer there. And Android's back button,
 * which this library does not handle, leaves the screen instead of closing
 * the sheet, which is how the sheet gets left open in the first place.
 *
 * So: closed on blur, and back closes the sheet before it navigates.
 */
export function useSheetDismiss(sheets: DismissibleSheet[]) {
  // The array is rebuilt every render; the effect reads it through a ref so it
  // registers once per focus instead of tearing down on each keystroke.
  const latest = useRef(sheets);
  latest.current = sheets;

  const closeOpen = useCallback(() => {
    const open = latest.current.filter((s) => s.open);
    open.forEach((s) => { s.ref.current?.close(); s.onClose?.(); });
    return open.length > 0;
  }, []);

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => closeOpen());
      return () => {
        sub.remove();
        closeOpen();
      };
    }, [closeOpen]),
  );
}
