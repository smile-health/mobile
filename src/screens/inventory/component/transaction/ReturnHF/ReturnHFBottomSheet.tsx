import React, { useCallback } from 'react'
import { View, Text, FlatList } from 'react-native'
import { FormProvider, useFormContext } from 'react-hook-form'
import { Icons } from '@/assets/icons'
import {
  BottomSheet,
  BottomSheetProps,
} from '@/components/bottomsheet/BottomSheet'
import { Button, ImageButton } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { CreateTransaction } from '@/models/transaction/TransactionCreate'
import { ReturnHFForm } from '@/screens/inventory/schema/ReturnHealthFacilitySchema'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import ReturnHealthFacilityForm from './ReturnHealthFacilityForm'

interface Props extends BottomSheetProps {
  transactionCount: number
  transactionQty: number
  isDisableSave: boolean
  onSubmit: () => void
  onDeleteItem: (transactionID?: number) => void
  onPressDetailPatient: (data: CreateTransaction) => void
}

function ReturnHFBottomSheet({
  transactionCount,
  transactionQty,
  isDisableSave,
  onSubmit,
  onDeleteItem,
  onPressDetailPatient,
  toggleSheet,
  ...bottomSheetProps
}: Readonly<Props>) {
  const { t } = useLanguage()
  const methods = useFormContext<ReturnHFForm>()
  const { selectedTrx } = methods.watch()

  const renderItem = useCallback(
    ({ item, index }) => {
      return (
        <ReturnHealthFacilityForm
          index={index}
          onDelete={() => onDeleteItem(item.transaction_id)}
          onPressDetailPatient={() => onPressDetailPatient(item)}
        />
      )
    },
    [onDeleteItem, onPressDetailPatient]
  )

  return (
    <BottomSheet
      containerClassName='max-h-full'
      toggleSheet={toggleSheet}
      {...bottomSheetProps}>
      <FormProvider {...methods}>
        <View className='bg-white flex-1'>
          <View className='w-full p-4'>
            <View className='flex-row items-center justify-between'>
              <Text className={AppStyles.textBold}>
                {t('label.enter_return')}
              </Text>
              <ImageButton
                Icon={Icons.IcDelete}
                onPress={toggleSheet}
                size={20}
                {...getTestID('btn-close-bottom-sheet')}
              />
            </View>
            <View className='flex-row items-center gap-x-1 py-2 '>
              <Icons.IcFlag height={16} width={16} fill={colors.scienceBlue} />
              <Text className={cn(AppStyles.labelRegular, 'text-scienceBlue')}>
                {t('label.num_transaction', { num: transactionCount })}
              </Text>
              <Text className={AppStyles.labelRegular}>{t('label.qty')}</Text>
              <Text className={AppStyles.textBoldSmall}>
                {t('label.num_has_entered', { num: transactionQty })}
              </Text>
            </View>
          </View>
          <FlatList
            data={selectedTrx}
            renderItem={renderItem}
            keyboardShouldPersistTaps='handled'
            keyboardDismissMode='none'
            removeClippedSubviews={false}
            contentContainerClassName='p-4'
          />
          <View className='flex-row border-t border-quillGrey p-4 gap-x-2'>
            <Button
              preset='filled'
              containerClassName='flex-1 gap-x-2'
              text={t('button.save')}
              leftIconColor={colors.mainText()}
              LeftIcon={Icons.IcCheck}
              leftIconSize={20}
              onPress={onSubmit}
              disabled={isDisableSave}
              {...getTestID('btn-save-transaction')}
            />
          </View>
        </View>
      </FormProvider>
    </BottomSheet>
  )
}

export default React.memo(ReturnHFBottomSheet)
