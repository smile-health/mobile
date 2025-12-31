import React, { useCallback } from 'react'
import { View, Text } from 'react-native'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { numberFormat } from '@/utils/CommonUtils'
import ActionReasonItem from './ActionReasonItem'
import { ReconciliationFormItem } from '../schema/CreateReconciliationSchema'

interface Props {
  item: ReconciliationFormItem
}

function ReviewReconciliationTypeItem({ item }: Readonly<Props>) {
  const { t } = useLanguage()
  const {
    actual_qty = 0,
    reconciliation_category_label: categoryLabel,
    recorded_qty,
    action_reasons = [],
  } = item

  const renderActionReasons = useCallback((item) => {
    return (
      <ActionReasonItem
        key={`${item.action_id}-${item.reason_id}`}
        reason={item.reason_title}
        action={item.action_title}
      />
    )
  }, [])

  return (
    <View className='border border-quillGrey px-4 py-3 gap-y-2 rounded-sm mb-2'>
      <Text className={AppStyles.textBold}>{categoryLabel}</Text>
      <InfoRow
        label={t('reconciliation.real_input', { type: categoryLabel })}
        value={numberFormat(actual_qty)}
      />
      <InfoRow label={t('common.smile')} value={numberFormat(recorded_qty)} />
      {!!action_reasons?.length && (
        <>
          <View className='border-b border-quillGrey' />
          <Text className={AppStyles.labelBold}>
            {t('reconciliation.reason_action')}
          </Text>
          {action_reasons.map((item) => renderActionReasons(item))}
        </>
      )}
    </View>
  )
}

export default React.memo(ReviewReconciliationTypeItem)
