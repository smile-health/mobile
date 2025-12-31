import React, { useCallback } from 'react'
import {
  SafeAreaView,
  Text,
  View,
  FlatList,
  ListRenderItem,
} from 'react-native'
import { ParseKeys } from 'i18next'
import { Icons } from '@/assets/icons'
import Banner from '@/components/banner/Banner'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { ReasonOption } from '@/models/Common'
import { OrderItem } from '@/models/order/OrderItem'
import { vendorState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { SHORT_DATE_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { OrderReviewItem } from './OrderReviewItem'

interface DataVendor {
  name: string
  address: string
}

interface HeaderItem {
  label: string
  value: string | undefined
}

interface OrderReviewListProps {
  headerItems: HeaderItem[]
  data: OrderItem[]
  date: string
  comment: string
  isLoading?: boolean
  handleConfirm: () => void
  message?: string
  toogleCancelOrderDialog?: () => void
  dialogOpen?: boolean
  handleSubmit?: () => void
  titleButton: string
  dataVendor?: DataVendor
  title: string
  renderItem?: ListRenderItem<OrderItem>
  qty?: number | string
  isHierarchy?: boolean
  dataReason?: ReasonOption[]
  withComment?: boolean
  labelDateKey?: ParseKeys
}

export default function OrderReviewList({
  headerItems,
  data,
  date,
  comment,
  isLoading = false,
  handleConfirm,
  message,
  toogleCancelOrderDialog = () => {},
  dialogOpen = false,
  handleSubmit,
  titleButton,
  dataVendor,
  title,
  renderItem,
  isHierarchy,
  dataReason,
  withComment = true,
  labelDateKey = 'label.required_by_date',
}: Readonly<OrderReviewListProps>) {
  const { t } = useLanguage()
  const { vendor } = useAppSelector(vendorState)

  const defaultRenderItem = useCallback<ListRenderItem<OrderItem>>(
    ({ item }) => (
      <OrderReviewItem
        item={item}
        isHierarchy={isHierarchy}
        dataReason={dataReason}
        isReason
      />
    ),
    [dataReason, isHierarchy]
  )

  const _renderItem = renderItem ?? defaultRenderItem

  const renderHeader = useCallback(
    () => (
      <View>
        <HeaderMaterial items={headerItems} />
        <View className='bg-white px-4 py-2'>
          <Text className={cn(AppStyles.textBold, 'mb-2')}>{title}</Text>
          <Banner
            testID='banner-order-review'
            title={t('order.banner.order_review_confirmation')}
          />
          <View className='border border-whiteTwo p-2 mb-2'>
            <Text
              className={cn(AppStyles.textBoldSmall, 'text-mediumGray mb-1')}>
              {t('label.vendor')}
            </Text>
            <Text className={cn(AppStyles.textBold, 'mb-1')}>
              {vendor?.name ?? dataVendor?.name}
            </Text>
            <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
              {vendor?.address ?? dataVendor?.address}
            </Text>
          </View>
        </View>
        <View className='p-4 pt-0'>
          <Text
            className={cn(AppStyles.textRegularSmall, 'text-mediumGray mb-1')}>
            {t(labelDateKey)}
          </Text>
          <Text className={cn(AppStyles.textRegular, 'uppercase')}>
            {convertString(date, SHORT_DATE_FORMAT) || '-'}
          </Text>
        </View>
        <View className='bg-lightBlueGray w-full h-2' />
        <View className={cn(AppStyles.rowBetween, 'p-4')}>
          <Text className={cn(AppStyles.textBoldMedium, 'text-midnightBlue')}>
            {t('label.item')}
          </Text>
          <Text className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
            {t('label.total')}
            <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
              {t('label.count_items', { count: data?.length })}
            </Text>
          </Text>
        </View>
      </View>
    ),
    [
      headerItems,
      title,
      t,
      vendor?.name,
      vendor?.address,
      dataVendor?.name,
      dataVendor?.address,
      date,
      data?.length,
    ]
  )

  const renderFooter = useCallback(
    () =>
      withComment ? (
        <View className='bg-white mb-2'>
          <View className='bg-lightBlueGray w-full h-2' />
          <View className='p-4'>
            <Text className={cn(AppStyles.textBold, 'mb-1')}>
              {t('label.comment')}
            </Text>
            <Text className={AppStyles.textRegular}>{comment || '-'}</Text>
          </View>
          <View className='bg-lightBlueGray w-full h-2' />
        </View>
      ) : null,
    [comment, t, withComment]
  )

  return (
    <SafeAreaView className='flex-1 bg-paleGrey'>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        renderItem={_renderItem}
        keyExtractor={(item) => `${item.material_id}`}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        contentContainerClassName='bg-white'
      />
      <View className='p-4 border-whiteTwo bg-white border-t'>
        <Button
          preset='filled'
          textClassName={cn(AppStyles.textMedium, 'text-white ml-2')}
          text={titleButton}
          LeftIcon={Icons.IcArrowForward}
          leftIconColor={colors.white}
          onPress={handleConfirm}
          disabled={isLoading}
          testID='btn-process-order'
        />
      </View>
      <ConfirmationDialog
        modalVisible={dialogOpen}
        dismissDialog={toogleCancelOrderDialog}
        onCancel={toogleCancelOrderDialog}
        onConfirm={handleSubmit}
        title={t('dialog.order_without_companion_materials_title')}
        message={message}
        cancelText={t('button.cancel')}
        cancelProps={{
          textClassName: 'text-deepBlue px-2',
          containerClassName: 'rounded-md border border-deepBlue px-3 py-2',
          ...getTestID('btn-cancel-order'),
        }}
        confirmProps={{
          textClassName: 'text-white',
          containerClassName: 'rounded-md border bg-deepBlue px-3 py-2',
          ...getTestID('btn-continue-order'),
        }}
        confirmText={t('button.continue_to_order')}
      />
      <LoadingDialog
        modalVisible={isLoading}
        title={t('dialog.hang_tight') as ParseKeys}
        message={t('dialog.processing_message')}
        containerClassName='p-6'
        titleClassName={cn('mt-4', AppStyles.textMediumMedium)}
        messageClassName={cn(AppStyles.textRegularSmall, 'text-mediumGray')}
        testID='loading-dialog-create-order'
      />
    </SafeAreaView>
  )
}
