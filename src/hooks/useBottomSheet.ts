import { useRef, useState, useCallback, useMemo } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

export function useBottomSheet<T>() {
  const sheetRef = useRef<BottomSheet>(null);
  const [editing, setEditing] = useState<T | null>(null);
  // Bumped on every open so the form inside the sheet remounts with fresh
  // state — otherwise a second "add" reuses the previous entry's inputs.
  const [formKey, setFormKey] = useState(0);
  const snapPoints = useMemo(() => ['90%'], []);

  const openAdd = useCallback(() => {
    setEditing(null);
    setFormKey((k) => k + 1);
    sheetRef.current?.expand();
  }, []);
  const openEdit = useCallback((item: T) => {
    setEditing(item);
    setFormKey((k) => k + 1);
    sheetRef.current?.expand();
  }, []);
  const closeSheet = useCallback(() => { sheetRef.current?.close(); setEditing(null); }, []);

  return { sheetRef, snapPoints, editing, formKey, openAdd, openEdit, closeSheet };
}
