import React, { useCallback } from 'react'
import { FlatList, View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { CompletedSequencePatient } from '@/models/transaction/Consumption'
import { identityTypeNames } from '@/screens/inventory/constant/transaction.constant'
import OtherSequenceDate from './OtherSequenceDate'

interface Props {
  patient: CompletedSequencePatient
  index: number
}

function PatientOtherSequenceItem({ index, patient }: Readonly<Props>) {
  const { t } = useLanguage()
  const { identity_number, identity_type, vaccine_method_title, data } = patient

  const renderItem = useCallback(
    ({ item, index: itemIndex }) => {
      return (
        <OtherSequenceDate
          parentIndex={index}
          index={itemIndex}
          title={item.vaccine_sequence_title}
        />
      )
    },
    [index]
  )

  return (
    <View className='border border-quillGrey rounded-sm p-2 gap-y-1'>
      <InfoRow
        label={t(identityTypeNames[identity_type ?? 0])}
        value={identity_number ?? ''}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.method')}
        value={vaccine_method_title ?? ''}
        valueClassName='font-mainBold'
      />
      <FlatList
        data={data}
        renderItem={renderItem}
        keyboardShouldPersistTaps='handled'
        keyboardDismissMode='none'
        removeClippedSubviews={false}
        contentContainerClassName='gap-y-2'
        keyExtractor={({ vaccine_sequence }) => String(vaccine_sequence)}
      />
    </View>
  )
}

export default React.memo(PatientOtherSequenceItem)
