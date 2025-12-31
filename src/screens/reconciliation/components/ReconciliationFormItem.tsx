import React, { useCallback } from 'react'
import { Text, View } from 'react-native'
import { Path, useFormContext } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID, numberFormat } from '@/utils/CommonUtils'
import { navigate } from '@/utils/NavigationUtils'
import ActionReasonItem from './ActionReasonItem'
import { ReconciliationForm } from '../schema/CreateReconciliationSchema'

interface Props {
  index: number
}

function ReconciliationFormItem({ index }: Readonly<Props>) {
  const { t } = useLanguage()
  const { watch } = useFormContext<ReconciliationForm>()
  const itemField: Path<ReconciliationForm> = `items.${index}`
  const item = watch(itemField)
  const {
    actual_qty,
    reconciliation_category_label: categoryLabel,
    recorded_qty,
    action_reasons,
  } = item

  const shouldShowButton = actual_qty === null || actual_qty === undefined

  const handleEnterRealValue = () => {
    navigate('AddReconciliationType', { data: item, path: itemField })
  }

  const renderActionReason = useCallback((item) => {
    return (
      <ActionReasonItem
        key={`${item.reason_id}-${item.action_id}`}
        reason={item.reason_title}
        action={item.action_title}
      />
    )
  }, [])

  return (
    <View className='gap-y-2 bg-white mx-4 p-3 mb-2 rounded-sm border border-quillGrey'>
      <Text className={AppStyles.textRegular}>{categoryLabel}</Text>
      <InfoRow label={t('common.smile')} value={numberFormat(recorded_qty)} />
      {shouldShowButton ? (
        <Button
          preset='outlined-primary'
          containerClassName='flex-1 gap-x-2'
          textClassName='text-center capitalize'
          text={t('button.enter_real_type', { type: categoryLabel })}
          onPress={handleEnterRealValue}
          {...getTestID('btn-add-enter-real-value')}
        />
      ) : (
        <View className='border border-quillGrey p-2 gap-y-2 rounded-sm'>
          <View className='flex-row items-center justify-between gap-x-1'>
            <Text className={AppStyles.textBold}>{t('label.real')}</Text>
            <Button
              text={t('button.edit_add')}
              textClassName='text-main text-sm'
              onPress={handleEnterRealValue}
              RightIcon={Icons.IcChevronRightActive}
              rightIconColor={colors.main()}
              rightIconSize={20}
              {...getTestID('btn-edit-add-actual-qty')}
            />
          </View>
          <InfoRow
            label={t('reconciliation.real_input', { type: categoryLabel })}
            value={numberFormat(actual_qty)}
          />
          {!!action_reasons?.length && (
            <>
              <View className='border-b border-quillGrey' />
              <Text className={AppStyles.labelBold}>
                {t('reconciliation.reason_action')}
              </Text>
              {action_reasons.map((item) => renderActionReason(item))}
            </>
          )}
        </View>
      )}
    </View>
  )
}

export default React.memo(ReconciliationFormItem)
