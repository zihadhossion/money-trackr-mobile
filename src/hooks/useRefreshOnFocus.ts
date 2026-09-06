import { useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Re-runs `refresh` every time the screen regains focus, skipping the first
 * focus so it does not duplicate the initial mount fetch.
 */
export function useRefreshOnFocus(refresh: () => void) {
  const firstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh])
  );
}
