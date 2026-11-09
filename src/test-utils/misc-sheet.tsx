import React from 'react'
import { Pressable, Text, View } from 'react-native'

/** Pengganti BottomSheet: selalu render children. */
export const bottomSheetModule = {
  BottomSheet: ({ children }: any) => <View>{children}</View>,
}

/** Pengganti DateRangePicker: tombol yang memanggil onApply('2025-01-01','2025-01-31'). */
export const dateRangeModule = {
  __esModule: true,
  default: ({ onApply, testID, startDate, endDate }: any) => (
    <Pressable testID={testID} onPress={() => onApply('2025-01-01', '2025-01-31')}>
      <Text>{`${startDate ?? ''}|${endDate ?? ''}`}</Text>
    </Pressable>
  ),
}

/** Pengganti PickerSelect: tombol yang memanggil onSelect dengan opsi pertama dari data. */
export const pickerModule = {
  __esModule: true,
  default: ({ onSelect, data, testID, value }: any) => (
    <Pressable
      testID={testID}
      onPress={() => onSelect(data?.[0] ?? { value: 1, label: 'x' })}>
      <Text>{`picker:${testID}:${value ?? ''}`}</Text>
    </Pressable>
  ),
}
