import { useRef, useState, useCallback, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

export function useBottomSheet<T>() {
  const sheetRef = useRef<BottomSheet>(null);
  const [editing, setEditing] = useState<T | null>(null);
  const snapPoints = useMemo(() => ['90%'], []);

  const openAdd = useCallback(() => { setEditing(null); sheetRef.current?.expand(); }, []);
  const openEdit = useCallback((item: T) => { setEditing(item); sheetRef.current?.expand(); }, []);
  const closeSheet = useCallback(() => { sheetRef.current?.close(); setEditing(null); }, []);

  return { sheetRef, snapPoints, editing, openAdd, openEdit, closeSheet };
}
