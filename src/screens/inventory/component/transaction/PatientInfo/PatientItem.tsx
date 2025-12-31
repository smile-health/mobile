import React from 'react'
import { View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { cn } from '@/theme/theme-config'

interface Props {
  identityType?: string
  patientID?: string
  phoneNumber?: string
  vaccineSequence?: string
  containerClassName?: string
}

function PatientItem({
  identityType,
  patientID,
  phoneNumber,
  vaccineSequence,
  containerClassName,
}: Readonly<Props>) {
  const { t } = useLanguage()
  return (
    <View className={cn('bg-catskillWhite gap-y-2', containerClassName)}>
      <InfoRow label={t('label.identity_type')} value={identityType ?? '-'} />
      <InfoRow label={t('label.patient_id')} value={patientID ?? '-'} />
      <InfoRow label={t('label.phone_number')} value={phoneNumber ?? '-'} />
      {vaccineSequence && (
        <InfoRow label={t('label.vaccine_sequence')} value={vaccineSequence} />
      )}
    </View>
  )
}

export default React.memo(PatientItem)
