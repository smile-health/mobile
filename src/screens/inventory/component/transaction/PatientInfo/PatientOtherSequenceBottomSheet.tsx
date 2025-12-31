import React, { useCallback, useMemo } from 'react'
import { FlatList, Text, View } from 'react-native'
import { FormProvider, useFormContext } from 'react-hook-form'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { CompletedSequenceForm } from '@/screens/inventory/schema/CompletedSequenceSchema'
import AppStyles from '@/theme/AppStyles'
import { getTestID } from '@/utils/CommonUtils'
import PatientOtherSequenceItem from './PatientOtherSequenceItem'

interface Props extends BottomSheetProps {
  onApply: () => void
}

function PatientOtherSequenceBottomSheet({
  onApply,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()

  const methods = useFormContext<CompletedSequenceForm>()
  const { watch } = methods
  const { patients } = watch()
  const patientData = useMemo(() => patients || [], [patients])

  const renderItem = useCallback(({ index, item }) => {
    return <PatientOtherSequenceItem index={index} patient={item} />
  }, [])

  return (
    <BottomSheet
      containerClassName='max-h-full min-h-[50%] bg-white'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <FormProvider {...methods}>
        <View className='flex-1'>
          <View className='p-4 pb-2'>
            <Text className={AppStyles.textBold}>
              {t('transaction.completed_sequence.confirmation')}
            </Text>
            <Text className={AppStyles.labelRegular}>
              {t('transaction.completed_sequence.description')}
            </Text>
          </View>
          <FlatList
            data={patientData}
            renderItem={renderItem}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='none'
            removeClippedSubviews={false}
            contentContainerClassName='p-4 gap-y-4 flex-grow'
          />
          <View className='flex-row items-center gap-x-2 p-4 border-t border-quillGrey'>
            <Button
              preset='outlined'
              text={t('button.cancel')}
              containerClassName='border-whiteTwo flex-1'
              onPress={toggleSheet}
              {...getTestID('btn-cancel-other-sequence')}
            />
            <Button
              preset='filled'
              text={t('button.apply')}
              containerClassName='flex-1'
              onPress={onApply}
              {...getTestID('btn-apply-other-sequence')}
            />
          </View>
        </View>
      </FormProvider>
    </BottomSheet>
  )
}

export default React.memo(PatientOtherSequenceBottomSheet)
