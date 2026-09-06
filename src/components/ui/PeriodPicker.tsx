import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import SegmentedControl from './SegmentedControl';
import MonthGrid from './MonthGrid';
import type { Period, PeriodFilter } from '../../hooks/useListFilters';

interface PeriodPickerProps {
  value: PeriodFilter;
  onChange: (next: Partial<PeriodFilter>) => void;
}

/**
 * The period half of every filter sheet: three presets, plus the month grid
 * for the one preset that needs a specific month. The grid is hidden for
 * "last month" and "all time" because picking a month there would mean
 * nothing.
 */
export default React.memo(function PeriodPicker({ value, onChange }: PeriodPickerProps) {
  const { t } = useTranslation();

  const options = useMemo(() => ([
    // "Month", not "This month": the grid below can move it to any month.
    { value: 'month' as Period, label: t('filters.by_month') },
    { value: 'lastMonth' as Period, label: t('filters.last_month') },
    { value: 'all' as Period, label: t('filters.all_time') },
  ]), [t]);

  return (
    <View style={{ gap: 12 }}>
      <SegmentedControl
        options={options}
        value={value.period}
        onChange={(period) => onChange({ period })}
      />
      {value.period === 'month' && (
        <MonthGrid
          month={value.month}
          year={value.year}
          onChange={(month, year) => onChange({ month, year })}
        />
      )}
    </View>
  );
});
