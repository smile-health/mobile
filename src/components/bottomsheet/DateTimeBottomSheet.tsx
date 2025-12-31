import React, { useState } from 'react'
import { Modal, Platform, TouchableOpacity, View } from 'react-native'
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker'
import { useTranslation } from 'react-i18next'
import { getTestID } from '@/utils/CommonUtils'
import { BaseButton } from '../buttons'

interface DateTimeBottomSheetProps {
  date: Date
  maximumDate?: Date
  minimumDate?: Date
  modalVisible: boolean
  testID: string
  onDateChange: (date: Date) => void
  dismissDialog: () => void
}

export default function DateTimeBottomSheet({
  modalVisible,
  testID,
  date,
  minimumDate,
  maximumDate,
  onDateChange,
  dismissDialog,
}: Readonly<DateTimeBottomSheetProps>) {
  const { t } = useTranslation()
  const [localDate, setLocalDate] = useState(date)

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (selectedDate) {
      setLocalDate(selectedDate)
    }
  }

  function handleConfirm() {
    onDateChange(localDate)
    dismissDialog()
  }

  return (
    <Modal
      animationType='slide'
      transparent={true}
      visible={modalVisible}
      onRequestClose={dismissDialog}
      {...getTestID(testID)}>
      <TouchableOpacity
        activeOpacity={1}
        className='flex-1 bg-blackTransparent  justify-end'
        onPress={dismissDialog}>
        <TouchableOpacity activeOpacity={1} className='bg-white items-center'>
          <DateTimePicker
            maximumDate={maximumDate}
            minimumDate={minimumDate}
            value={localDate}
            mode={'date'}
            onChange={handleDateChange}
            themeVariant='light'
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          />

          <View className='flex-row p-3'>
            <BaseButton
              preset='outlined-primary'
              textClassName='text-main'
              containerClassName='flex-1 me-1 text-center'
              text={t('button.cancel')}
              onPress={dismissDialog}
              testID='btn-cancel'
            />
            <View className='w-4' />
            <BaseButton
              preset='filled'
              containerClassName='flex-1 bg-main'
              text={t('button.apply')}
              onPress={handleConfirm}
              testID='btn-apply'
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  )
}
