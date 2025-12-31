import React, { useCallback, useMemo } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  View,
} from 'react-native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderItem } from '@/models/order/OrderItem'
import {
  relocationState,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import AppStyles, { flexStyle } from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { OrderReviewItem } from '../component/OrderReviewItem'
import OrderCommentSection from '../component/section/OrderCommentSection'
import OrderHeaderSection from '../component/section/OrderHeaderSection'
import useRelocationReview from '../hooks/relocation/useRelocationReview'
import { useReasonOptions } from '../hooks/useReasonOptions'

export default function RelocationReviewScreen() {
  const { t } = useLanguage()
  const { activity, vendor, relocations } = useAppSelector(relocationState)
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const isHierarchy = selectedWorkspace?.config.material.is_hierarchy_enabled
  const { reasonRelocationOptions } = useReasonOptions()

  const {
    control,
    dateString,
    comment,
    handleDateChange,
    onPressReviewRelocation,
  } = useRelocationReview()

  const renderHeader = useCallback(
    () => (
      <OrderHeaderSection
        t={t}
        title={t('order.new_order')}
        activityName={activity?.name}
        vendorName={vendor?.name}
        vendorAddress={vendor?.address}
        date={dateString}
        isMandatoryDate={false}
        onDateChange={handleDateChange}
        totalItem={relocations?.length}
        showDate
      />
    ),
    [
      t,
      activity?.name,
      vendor?.name,
      vendor?.address,
      dateString,
      handleDateChange,
      relocations?.length,
    ]
  )

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <OrderReviewItem
          item={item}
          dataReason={reasonRelocationOptions}
          isHierarchy={isHierarchy}
          isReason={true}
        />
      )
    },
    [isHierarchy, reasonRelocationOptions]
  )

  const keyExtractor = useCallback(
    (item: OrderItem) => `relocation-${item.material_id}`,
    []
  )

  const renderFooter = useMemo(
    () => <OrderCommentSection t={t} control={control} />,
    [control, t]
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={flexStyle}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 16}>
      <SafeAreaView className='flex-1 bg-paleGrey'>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={relocations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerClassName='bg-white'
          keyboardShouldPersistTaps='handled'
          keyboardDismissMode='none'
          removeClippedSubviews={false}
          extraData={comment}
        />

        <View className='p-4 border-whiteTwo bg-white border-t'>
          <Button
            preset='filled'
            textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
            text={t('button.review')}
            LeftIcon={Icons.IcArrowForward}
            leftIconColor={colors.white}
            onPress={onPressReviewRelocation}
            testID='btn-review-relocation'
          />
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}
