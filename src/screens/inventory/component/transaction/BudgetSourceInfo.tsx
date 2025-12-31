import React from 'react'
import { View, Text } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Path } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { InfoRow } from '@/components/list/InfoRow'
import { useLanguage } from '@/i18n/useLanguage'
import {
  BudgetSourceData,
  CreateTransactionForm,
  TrxReasonOption,
} from '@/models/transaction/TransactionCreate'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID, numberFormat } from '@/utils/CommonUtils'

interface BudgetSourceInfoProps extends BudgetSourceData {
  transactionReason?: TrxReasonOption | null
  fieldName: Path<CreateTransactionForm>
}
function BudgetSourceInfo(props: Readonly<BudgetSourceInfoProps>) {
  const {
    change_qty,
    budget_source,
    budget_source_id,
    year,
    price,
    unit,
    transactionReason,
    fieldName,
  } = props

  const navigation = useNavigation()
  const { t } = useLanguage()

  const handleAddBudgetInfo = () => {
    navigation.navigate('AddBudgetInfo', {
      path: fieldName,
      isPurchase: transactionReason?.is_purchase,
      data: {
        change_qty,
        unit,
        budget_source_id,
        budget_source,
        year,
        price,
      },
    })
  }

  const isDisabledAdd = !change_qty || !transactionReason?.value
  const budgetSourceFilled = [budget_source_id, year, price].some(Boolean)
  const showAddBudgetInfoButton = !budgetSourceFilled

  if (showAddBudgetInfoButton)
    return (
      <Button
        preset='outlined-primary'
        text={t('button.add_budget_info')}
        onPress={handleAddBudgetInfo}
        containerClassName='mt-2'
        disabled={isDisabledAdd}
        {...getTestID('btn-add-budget-info')}
      />
    )
  return budgetSourceFilled ? (
    <View className='border border-quillGrey p-2 rounded-sm gap-y-1 mt-2'>
      <View className='flex-row items-center gap-x-1'>
        <Text className={cn(AppStyles.textBold, 'flex-1')}>
          {t('label.budget_info')}
        </Text>
        <Button
          text={t('button.edit')}
          textClassName='text-main text-sm'
          onPress={handleAddBudgetInfo}
          RightIcon={Icons.IcChevronRightActive}
          rightIconColor={colors.main()}
          rightIconSize={20}
        />
      </View>
      <InfoRow
        label={t('label.unit')}
        value={unit}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.budget_source')}
        value={budget_source?.label ?? '-'}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.budget_year')}
        value={year ?? '-'}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.total_price')}
        value={numberFormat(price) || '0'}
        valueClassName='font-mainBold'
      />
      <InfoRow
        label={t('label.price')}
        value={numberFormat((price ?? 0) / change_qty) || '-'}
        valueClassName='font-mainBold'
      />
    </View>
  ) : null
}
export default React.memo(BudgetSourceInfo)
