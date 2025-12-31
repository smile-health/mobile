import React, { useCallback, useMemo, useRef } from 'react'
import {
  SafeAreaView,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import {
  activityState,
  vendorState,
  orderState,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { DATE_FILTER_FORMAT } from '@/utils/Constants'
import { dateToString, stringToDate } from '@/utils/DateFormatUtils'
import useProgramId from '@/utils/hooks/useProgramId'
import { OrderReviewItem } from '../component/OrderReviewItem'
import OrderCommentSection from '../component/section/OrderCommentSection'
import OrderHeaderSection from '../component/section/OrderHeaderSection'
import { useReasonOptions } from '../hooks/useReasonOptions'
import { EditOrderSchema as OrderReviewSchema } from '../schema/EditOrderSchema'

interface Props extends AppStackScreenProps<'RegularReview'> {}
type OrderReviewFormField = yup.InferType<ReturnType<typeof OrderReviewSchema>>

export default function RegularReviewScreen({ navigation }: Props) {
  const { t } = useLanguage()

  const { drafts } = useAppSelector(orderState)
  const { activeActivity } = useAppSelector(activityState)
  const { vendor } = useAppSelector(vendorState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { reasonRegularOptions } = useReasonOptions()

  const programId = useProgramId()
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled

  const orderDraft = drafts?.regular?.[programId]

  const flatListRef = useRef(null)
  const commentInputRef = useRef<TextInput>(null)

  const { control, watch, setValue } = useForm<OrderReviewFormField>({
    resolver: yupResolver(OrderReviewSchema()),
    mode: 'onChange',
  })

  const form = watch()
  const date = useMemo(
    () => (form.date ? stringToDate(form.date) : undefined),
    [form.date]
  )

  useToolbar({
    title: `${t('order.add_order')}`,
  })

  const handleDateChange = useCallback(
    (val: Date) => setValue('date', dateToString(val, DATE_FILTER_FORMAT)),
    [setValue]
  )

  const onPressReviewOrder = useCallback(() => {
    navigation.navigate('RegularFinalReview', form)
  }, [form, navigation])

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        title={t('order.new_order')}
        activityName={activeActivity?.name}
        vendorName={vendor?.name}
        vendorAddress={vendor?.address}
        date={date}
        isMandatoryDate={false}
        onDateChange={handleDateChange}
        totalItem={orderDraft?.length}
        showDate
      />
    ),
    [
      t,
      activeActivity?.name,
      vendor?.name,
      vendor?.address,
      date,
      handleDateChange,
      orderDraft?.length,
    ]
  )

  const renderFooter = useMemo(
    () => (
      <OrderCommentSection t={t} control={control} inputRef={commentInputRef} />
    ),
    [control, t]
  )

  const renderItem = useCallback(
    ({ item }) => (
      <OrderReviewItem
        item={item}
        isHierarchy={isHierarchy}
        isReason
        dataReason={reasonRegularOptions}
      />
    ),
    [isHierarchy, reasonRegularOptions]
  )

  const keyExtractor = useCallback((item) => `${item?.material_id}`, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={flexStyle}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
      <SafeAreaView className='flex-1 bg-paleGrey'>
        <FlatList
          ref={flatListRef}
          showsVerticalScrollIndicator={false}
          data={orderDraft}
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
            testID='btn-review-order'
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
