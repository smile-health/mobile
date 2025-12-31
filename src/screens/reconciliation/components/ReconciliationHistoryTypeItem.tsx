import React from 'react'
import { View, Text } from 'react-native'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import { ReconciliationItem } from '@/models/reconciliation/ReconciliationList'
import AppStyles from '@/theme/AppStyles'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { getDateRangeText } from '@/utils/DateFormatUtils'
import ReconciliationDetailBottomSheet from './ReconciliationDetailBottomSheet'
import useReconciliationDetail from '../hooks/useReconciliationDetail'

interface Props {
  reconciliationId: number
  item: ReconciliationItem
}

function ReconciliationHistoryTypeItem({
  item,
  reconciliationId,
}: Readonly<Props>) {
  const { t } = useLanguage()
  const { actual_qty, reconciliation_category_label, recorded_qty, id } = item

  const { data, detail, openBottomSheet, isLoading, toggleBottomSheet } =
    useReconciliationDetail(reconciliationId, id)
  const showDetail = !!data && !isLoading

  return (
    <React.Fragment>
      <View className='border border-quillGrey py-3 px-2 gap-y-2 rounded-sm mb-2'>
        <Text className={AppStyles.textBold}>
          {reconciliation_category_label}
        </Text>
        <InfoRow
          label={t('reconciliation.real_input', {
            type: reconciliation_category_label,
          })}
          value={numberFormat(actual_qty)}
        />
        <InfoRow label={t('common.smile')} value={numberFormat(recorded_qty)} />
        {actual_qty === recorded_qty ? (
          <View
            className={
              'border border-quillGrey bg-lightGreyMinimal rounded-sm p-2'
            }>
            <InfoRow label={t('reconciliation.reason_action')} value='-' />
          </View>
        ) : (
          <Button
            preset='outlined-primary'
            containerClassName='gap-x-2'
            textClassName='text-center capitalize'
            text={t('button.view_reason_action')}
            onPress={toggleBottomSheet}
            {...getTestID('btn-view-reason-action')}
          />
        )}
      </View>
      <ReconciliationDetailBottomSheet
        name={`DetailCategory_${id}`}
        actualQty={actual_qty}
        recordedQty={recorded_qty}
        period={getDateRangeText(data?.start_date, data?.end_date) ?? '-'}
        updatedAt={data?.updated_at}
        category={reconciliation_category_label}
        detail={detail}
        isOpen={openBottomSheet}
        isLoading={isLoading}
        showDetail={showDetail}
        toggleSheet={toggleBottomSheet}
      />
    </React.Fragment>
  )
}

export default React.memo(ReconciliationHistoryTypeItem)
