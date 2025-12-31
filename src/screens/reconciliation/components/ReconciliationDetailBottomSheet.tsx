import React, { useCallback, useMemo } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { ImageButton } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { ReconciliationDetailItem } from '@/models/reconciliation/ReconciliationList'
import AppStyles from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import ActionReasonItem from './ActionReasonItem'

interface Props extends BottomSheetProps {
  category: string
  period: string
  updatedAt?: string
  actualQty: number
  recordedQty: number
  detail?: ReconciliationDetailItem
  showDetail: boolean
  isLoading: boolean
}

const LoadingView = React.memo(() => (
  <View className='items-center justify-center py-16'>
    <ActivityIndicator animating size='large' />
  </View>
))

LoadingView.displayName = 'LoadingView'

function ReconciliationDetailBottomSheet({
  category,
  period,
  updatedAt,
  actualQty,
  recordedQty,
  detail,
  isLoading,
  showDetail,
  toggleSheet,
  ...props
}: Readonly<Props>) {
  const { t } = useLanguage()

  const reasonActions = useMemo(() => {
    if (!detail) return []
    return detail.reasons.map((reason, index) => ({
      key: `${reason.id}-${index}`,
      reason: reason.title ?? '',
      action: detail.actions[index]?.title ?? '',
    }))
  }, [detail])

  const renderDetailActionReason = useCallback((item) => {
    return (
      <ActionReasonItem
        key={item.key}
        reason={item.reason}
        action={item.action}
      />
    )
  }, [])

  return (
    <BottomSheet
      toggleSheet={toggleSheet}
      containerClassName='max-h-full'
      {...props}>
      <View className='p-4 gap-y-2'>
        <View className='flex-row justify-between items-center'>
          <Text className={AppStyles.textBold}>
            {t('reconciliation.detail')}
          </Text>
          <ImageButton
            onPress={toggleSheet}
            Icon={Icons.IcDelete}
            size={20}
            {...getTestID('btn-close-detail')}
          />
        </View>
        {isLoading && <LoadingView />}
        {showDetail && (
          <React.Fragment>
            <InfoRow label={t('label.period')} value={period} />
            <InfoRow
              label={t('label.updated_at')}
              value={convertString(updatedAt, SHORT_DATE_TIME_FORMAT) ?? '-'}
            />
            <View className='gap-y-2 bg-white p-3 mb-2 rounded-sm border border-quillGrey'>
              <Text className={AppStyles.textRegular}>{category}</Text>
              <InfoRow
                label={t('common.smile')}
                value={numberFormat(recordedQty)}
              />
              <View className='border border-quillGrey p-2 gap-y-2 rounded-sm'>
                <Text className={AppStyles.textBold}>{t('label.real')}</Text>
                <InfoRow
                  label={t('reconciliation.real_input', {
                    type: category,
                  })}
                  value={numberFormat(actualQty)}
                />
                {reasonActions.length > 0 && (
                  <React.Fragment>
                    <View className='border-b border-quillGrey' />
                    <Text className={AppStyles.labelBold}>
                      {t('reconciliation.reason_action')}
                    </Text>
                    {reasonActions.map((item) =>
                      renderDetailActionReason(item)
                    )}
                  </React.Fragment>
                )}
              </View>
            </View>
          </React.Fragment>
        )}
      </View>
    </BottomSheet>
  )
}

export default React.memo(ReconciliationDetailBottomSheet)
