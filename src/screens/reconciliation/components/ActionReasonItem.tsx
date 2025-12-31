import React from 'react'
import { View } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'

function ActionReasonItem({ reason, action }) {
  const { t } = useLanguage()

  return (
    <View className='bg-lightGreyMinimal border border-quillGrey rounded-sm p-2 gap-y-2'>
      <InfoRow label={t('label.reason')} value={reason} />
      <InfoRow label={t('label.action')} value={action} />
    </View>
  )
}

export default React.memo(ActionReasonItem)
