import React, { useCallback } from 'react'
import {
  SafeAreaView,
  SectionList,
  SectionListData,
  SectionListRenderItem,
  Text,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import {
  DetailOrderSection as Section,
  DetailOrderSectionItem as SectionItem,
  CommentData,
  OrderItemData,
} from '@/models/order/OrderDetailSection'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import {
  SHORT_DATE_TIME_FORMAT,
  ORDER_STATUS,
  orderTypeNames,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import {
  OrderCommentItem,
  OrderDetailItem,
  OrderInformation,
} from './component/detail'
import WarningBox from './component/detail/WarningBox'
import { useOrderDetail } from './hooks/useOrderDetail'

type SectionRender = (info: {
  section: SectionListData<SectionItem, Section>
}) => React.ReactElement

type SectionItemRender = SectionListRenderItem<SectionItem, Section>

interface Props extends AppStackScreenProps<'OrderDetail'> {}

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { t } = useLanguage()

  const { id, type } = route.params

  const {
    SECTION_DATA,
    handleAddItem,
    handleOrderDetailItem,
    statusName,
    statusStyle,
    shouldShowAddItemButton,
    isVendor,
    isCustomer,
    orderDetailData,
    refetchOrderDetail,
    FooterActionButtons,
    shouldShowLoading,
    isMaterialHierarchy,
  } = useOrderDetail({
    id,
    t,
    navigation,
  })

  const onRefresh = useCallback(() => {
    refetchOrderDetail()
  }, [refetchOrderDetail])

  const orderTypeTitle = orderTypeNames?.[type] ?? 'order.service.regular'

  useToolbar({
    title: t(orderTypeTitle),
    actions: <RefreshHomeAction onRefresh={onRefresh} />,
  })

  useFocusEffect(
    useCallback(() => {
      refetchOrderDetail()
    }, [refetchOrderDetail])
  )

  const renderHeader = () =>
    orderDetailData ? (
      <OrderInformation
        order={orderDetailData}
        {...getTestID('section-order-information')}
      />
    ) : null

  const renderFooter = () => {
    return isCustomer && orderDetailData?.status === ORDER_STATUS.SHIPPED ? (
      <WarningBox
        title={t('order.accept_warning_title')}
        subTitle={t('order.accept_warning_subtitle')}
        icon={<Icons.IcWarning />}
        containerClassName='my-2 px-4'
      />
    ) : null
  }

  const renderSectionHeader: SectionRender = ({ section }) => {
    const itemCount = section.data?.length || 0
    const isItemSection = section.key === 'items'
    const isCommentSection = section.key === 'comment'

    return (
      <View className='bg-white px-4 mt-2'>
        {isItemSection && (
          <View className={cn('mt-4 mb-2', AppStyles.rowBetween)}>
            <Text className={AppStyles.textBold}>{t(section.title)}</Text>
            <View className='flex-row items-center'>
              <Text
                className={cn(AppStyles.textRegularSmall, 'text-mediumGray')}>
                {t('label.total')}{' '}
              </Text>
              <Text className={cn(AppStyles.textBoldSmall, 'text-mediumGray')}>
                {t('label.count_items', { count: itemCount })}
              </Text>
            </View>
          </View>
        )}
        {isCommentSection && (
          <View className={cn('mt-4 mb-2', AppStyles.rowCenterAlign)}>
            <Text className={AppStyles.textBold}>{t(section.title)}</Text>
            <Text className={AppStyles.textBold}>{` (${itemCount})`}</Text>
          </View>
        )}
        {shouldShowAddItemButton && isItemSection && (
          <Button
            text={t('button.add_item')}
            textClassName='text-main'
            containerClassName='self-end gap-x-2 mb-4'
            LeftIcon={Icons.IcAdd}
            leftIconColor={colors.main()}
            onPress={handleAddItem}
            {...getTestID('btn-add-order-item')}
          />
        )}
      </View>
    )
  }

  const renderItem: SectionItemRender = useCallback(
    ({ section, item }) => {
      switch (section.key) {
        case 'items': {
          return (
            <OrderDetailItem
              isHierarchy={isMaterialHierarchy}
              type={type}
              data={item as OrderItemData}
              orderStatus={orderDetailData?.status ?? 0}
              isVendor={isVendor}
              onPress={handleOrderDetailItem}
              containerClassName='px-4 pb-2'
            />
          )
        }

        case 'comment': {
          return <OrderCommentItem data={item as CommentData} />
        }
        default: {
          return null
        }
      }
    },
    [
      isMaterialHierarchy,
      type,
      orderDetailData?.status,
      isVendor,
      handleOrderDetailItem,
    ]
  )

  return (
    <SafeAreaView className='flex-1'>
      <View className={cn(AppStyles.rowBetween, 'px-4 py-2 bg-paleGreyTwo')}>
        <Text className={AppStyles.textRegularSmall}>
          {t('label.activity')}
        </Text>
        <Text className={AppStyles.textBoldSmall}>
          {orderDetailData?.activity?.name}
        </Text>
      </View>
      <View className={statusStyle.background}>
        <Text className={statusStyle.text}>{statusName}</Text>
        <Text className={cn('uppercase text-right', AppStyles.textBoldSmall)}>
          {convertString(orderDetailData?.updated_at, SHORT_DATE_TIME_FORMAT)}
        </Text>
      </View>
      <SectionList<SectionItem, Section>
        sections={SECTION_DATA || []}
        ListHeaderComponent={renderHeader}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ListFooterComponent={renderFooter}
        contentContainerClassName=''
        keyExtractor={(_, index) => `key-${index}`}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
      />
      {FooterActionButtons}
      <LoadingDialog
        testID='loading-dialog-order-detail'
        modalVisible={shouldShowLoading}
      />
    </SafeAreaView>
  )
}
