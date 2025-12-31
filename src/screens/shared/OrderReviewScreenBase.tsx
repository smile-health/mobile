import React, { useCallback, useMemo, useRef } from 'react'
import {
  SafeAreaView,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { ParseKeys } from 'i18next'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps, AppStackParamList } from '@/navigators'
import {
  activityState,
  ordersState,
  orderState,
  useAppSelector,
} from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import { OrderBatchReviewItem } from '../order/component/OrderBatchReviewItem'
import OrderCommentSection from '../order/component/section/OrderCommentSection'
import OrderHeaderSection from '../order/component/section/OrderHeaderSection'
import { EditOrderSchema as OrderReviewSchema } from '../order/schema/EditOrderSchema'
interface OrderReviewScreenBaseProps<Screen extends keyof AppStackParamList> {
  navigation: AppStackScreenProps<Screen>['navigation']
  menuTitleKey: ParseKeys
  pageTitleKey: ParseKeys
  labelDateKey?: ParseKeys
  finalReviewRoute: keyof AppStackParamList
  buttonTestID: string
}

export default function OrderReviewScreenBase<
  Screen extends keyof AppStackParamList,
>({
  navigation,
  menuTitleKey,
  pageTitleKey,
  labelDateKey,
  finalReviewRoute,
  buttonTestID,
}: Readonly<OrderReviewScreenBaseProps<Screen>>) {
  const { t } = useLanguage()
  const { activeActivity } = useAppSelector(activityState)
  const { orders } = useAppSelector(ordersState)
  const { entities } = useAppSelector(orderState)

  const flatListRef = useRef<FlatList>(null)

  const { control, watch, setValue } = useForm<
    yup.InferType<ReturnType<typeof OrderReviewSchema>>
  >({
    resolver: yupResolver(OrderReviewSchema()),
    mode: 'onChange',
  })

  const form = watch()
  const date = form.date ? stringToDate(form.date) : undefined

  useToolbar({ title: t(menuTitleKey) })

  const handleDateChange = useCallback(
    (val: Date) => setValue('date', dateToString(val, DATE_FILTER_FORMAT)),
    [setValue]
  )

  const onPressReviewOrder = useCallback(() => {
    navigation.navigate(finalReviewRoute as any, form)
  }, [form, navigation, finalReviewRoute])

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        title={t(pageTitleKey)}
        headerItems={[
          { label: t('label.activity'), value: activeActivity?.name },
          { label: t('label.customer'), value: entities.distribution.name },
        ]}
        activityName={activeActivity?.name}
        customerName={entities.distribution.name}
        customerAddress={entities.distribution.address}
        date={date}
        isMandatoryDate={false}
        onDateChange={handleDateChange}
        totalItem={orders?.length}
        showDate
        labelDate={labelDateKey}
      />
    ),
    [
      t,
      pageTitleKey,
      activeActivity?.name,
      entities.distribution.name,
      entities.distribution.address,
      date,
      handleDateChange,
      orders?.length,
      labelDateKey,
    ]
  )

  const renderFooter = useMemo(
    () => <OrderCommentSection t={t} control={control} />,
    [control, t]
  )

  const renderItem = useCallback(
    ({ item }) => <OrderBatchReviewItem item={item} />,
    []
  )

  const keyExtractor = useCallback((item) => `${item.material_id}`, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={flexStyle}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 16}>
      <SafeAreaView className='flex-1 bg-paleGrey'>
        <FlatList
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          data={orders}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerClassName='bg-white'
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='none'
          removeClippedSubviews={false}
          extraData={form.comment}
        />
        <View className='p-4 border-whiteTwo bg-white border-t'>
          <Button
            preset='filled'
            textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
            text={t('button.review')}
            LeftIcon={Icons.IcArrowForward}
            leftIconColor={colors.white}
            onPress={onPressReviewOrder}
            testID={buttonTestID}
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
