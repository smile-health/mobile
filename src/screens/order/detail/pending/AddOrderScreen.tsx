import React, { useCallback, useMemo } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { ParseKeys } from 'i18next'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { TextField } from '@/components/forms'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import {
  activityState,
  authState,
  homeState,
  useAppSelector,
} from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID, showSuccess } from '@/utils/CommonUtils'
import { DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { addOrderSchema } from '../../schema/AddOrderSchema'

type AddNewOrderFormField = yup.InferType<typeof addOrderSchema>
interface Props extends AppStackScreenProps<'AddOrder'> {}

export default function AddOrderScreen({ navigation, route }: Props) {
  const { user } = useAppSelector(authState)
  const { activeMenu } = useAppSelector(homeState)
  const { activeActivity } = useAppSelector(activityState)

  const { name, available, min, max, updated_at } = route.params

  const { t } = useLanguage()

  const {
    control,
    reset,
    watch,
    formState: { errors },
    handleSubmit,
  } = useForm<AddNewOrderFormField>({
    resolver: yupResolver(addOrderSchema),
    mode: 'onChange',
  })

  const { quantity } = watch()

  const onRefresh = useCallback(() => {}, [])

  const isFormInvalid = useCallback(() => {
    return Object.keys(errors).length > 0 || !quantity
  }, [errors, quantity])

  const isDisabledSave = useMemo(isFormInvalid, [isFormInvalid])

  const onSubmit: SubmitHandler<AddNewOrderFormField> = useCallback(() => {
    reset()
    showSuccess(t('order.success_add_order'), 'snackbar-success-add-order')
    navigation.goBack()
  }, [navigation, reset, t])

  const getStockMessage = useMemo(() => {
    return quantity && t('order.recommended_num', { stock: 10 })
  }, [t, quantity])

  useToolbar({
    title: t(activeMenu?.name as ParseKeys, activeMenu?.key || ''),
    withDefaultSubtitle: true,
    actions: <RefreshHomeAction onRefresh={onRefresh} />,
  })

  return (
    <View className='bg-white flex-1'>
      <HeaderMaterial
        items={[
          { label: t('label.customer'), value: user?.entity?.name },
          { label: t('label.activity'), value: activeActivity?.name },
        ]}
      />
      <View className={cn(AppStyles.rowBetween, 'p-4')}>
        <View>
          <Text className={AppStyles.textBold}>{name}</Text>
          <Text className='mt-1 font-mainRegular text-[10px] text-mediumGray'>
            {t('label.data_updated_on')}:{' '}
            {convertString(updated_at, DATE_TIME_FORMAT)}
          </Text>
        </View>
        <Text className={AppStyles.textBoldLarge}>{available}</Text>
      </View>
      <View className={cn(AppStyles.rowBetween, 'p-4')}>
        <View>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('label.min')}
          </Text>
          <Text className={cn(AppStyles.textBoldLarge, ' text-paleGold')}>
            {min}
          </Text>
        </View>
        <View>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('label.max')}
          </Text>
          <Text className={cn(AppStyles.textBoldLarge, 'text-bluePrimary')}>
            {max}
          </Text>
        </View>
      </View>
      <View
        style={styles.container}
        className={cn(
          AppStyles.rowBetween,
          'bg-white rounded-md px-4 py-[13px]  shadow-blackTransparent mx-4'
        )}>
        <TextField
          name='quantity'
          control={control}
          label={t('label.order_qty')}
          placeholder={t('label.order_qty')}
          labelClassName='mt-2'
          keyboardType='numeric'
          errors={t(errors.quantity?.message as ParseKeys)}
          helper={getStockMessage}
          {...getTestID('textfield-order-quantity')}
        />
      </View>
      <View className='p-4  border-whiteTwo border-t mt-auto'>
        <Button
          preset='filled'
          text={t('button.save')}
          onPress={handleSubmit(onSubmit)}
          LeftIcon={Icons.IcCheck}
          containerClassName='bg-bluePrimary'
          textClassName='ml-2 '
          disabled={isDisabledSave}
          {...getTestID('btn-save')}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    elevation: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
})
