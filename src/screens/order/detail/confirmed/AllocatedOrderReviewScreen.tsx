import React, { useCallback } from 'react'
import { FlatList, SafeAreaView, Text, View } from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import { Button } from '@/components/buttons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import AllocatedReviewItemHierarchy from '../../component/allocation/AllocatedReviewItemHierarchy'
import { useAllocatedOrderReview } from '../../hooks/useAllocatedOrderReview'

interface Props extends AppStackScreenProps<'AllocatedOrderReview'> {}

export default function AllocatedOrderReviewScreen({ route }: Props) {
  const { data, comment = '' } = route.params

  const { t } = useLanguage()

  const { allocatedDraft, isLoadingAllocateOrder, handleProcessOrder } =
    useAllocatedOrderReview(data, comment)

  useToolbar({
    title: `${t('label.allocated_stock')}: ${data?.id}`,
  })

  const renderHeader = useCallback(
    () => (
      <View>
        <View className='m-4'>
          <Banner
            testID='banner-order-allocate'
            title={t('order.banner.order_allocation_review_confirmation')}
            titleClassName={AppStyles.textRegularMedium}
            containerClassName='m-0'
          />
          <Text className={cn(AppStyles.textBold, 'my-2')}>
            {t('label.review_allocation')}
          </Text>
          <View className='border border-whiteTwo p-2 mb-2'>
            <Text
              className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
              {t('label.customer')}
            </Text>
            <Text className={cn(AppStyles.textBoldSmall, 'mb-1')}>
              {data.customer.name}
            </Text>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {data.customer.address}
            </Text>
          </View>
        </View>
        <View className='bg-lightBlueGray w-full h-2' />
        <View className={cn(AppStyles.rowBetween, 'm-4')}>
          <Text className={AppStyles.textBold}>{t('label.item')}</Text>
          <Text className={AppStyles.textRegularSmall}>
            {t('label.total')}{' '}
            <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
              {t('label.count_items', { count: allocatedDraft.length })}
            </Text>
          </Text>
        </View>
      </View>
    ),
    [t, data?.customer.name, data.customer.address, allocatedDraft.length]
  )

  const renderItem = useCallback(
    ({ item }) => (
      <AllocatedReviewItemHierarchy item={item} detail={data} t={t} />
    ),
    [data, t]
  )
  const renderFooter = useCallback(
    () => (
      <View className=''>
        <View className='bg-lightBlueGray w-full h-2' />
        <View className='m-4'>
          <Text className={cn(AppStyles.textBold, 'mb-2')}>
            {t('label.comment')}
          </Text>
          <Text className={AppStyles.textRegular}>{comment || '-'}</Text>
        </View>
        <View className='bg-lightBlueGray w-full h-2' />
      </View>
    ),
    [comment, t]
  )

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: data.activity.name,
          },
          {
            label: t('label.customer'),
            value: data.customer.name,
          },
        ]}
      />
      <FlatList
        data={allocatedDraft}
        keyExtractor={(item) => String(item?.material_id)}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        className='bg-white'
        ListFooterComponent={renderFooter}
      />
      <View className='p-4 border-whiteTwo mt-auto border-t bg-white'>
        <Button
          disabled={isLoadingAllocateOrder}
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-1')}
          text={t('button.process_allocation')}
          LeftIcon={Icons.IcArrowForward}
          onPress={handleProcessOrder}
          {...getTestID('btn-save-allocation')}
        />
      </View>
      <LoadingDialog
        modalVisible={isLoadingAllocateOrder}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-allocate-order'
      />
    </SafeAreaView>
  )
}
