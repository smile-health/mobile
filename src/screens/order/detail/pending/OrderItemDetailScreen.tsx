import React, { useMemo } from 'react'
import { SafeAreaView, SectionList, Text, View } from 'react-native'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import { useAppSelector, workspaceState } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { orderTypeNames } from '@/utils/Constants'
import OrderItemQuantityInfo from '../../component/OrderItemDetail/OrderItemQuantityInfo'
import OrderItemStockInfo from '../../component/OrderItemDetail/OrderItemStockInfo'
import TradeMarkMaterialItem from '../../component/TradeMarkMaterialItem'
import { useOrderItemDetail } from '../../hooks/useOrderItemDetail'

interface Props extends AppStackScreenProps<'OrderItemDetail'> {}
export default function OrderItemDetailScreen({ route }: Props) {
  const { selectedWorkspace } = useAppSelector(workspaceState)

  const { data, orderDetail } = route.params
  const { order_stocks } = data

  const {
    t,
    isHierarchy,
    showSectionHeader,
    labelText,
    quantities,
    entityInfo,
  } = useOrderItemDetail(data, orderDetail, selectedWorkspace)

  const orderItemSection = useMemo(
    () => [
      isHierarchy
        ? {
            key: 'hierarchy',
            title: `${t('label.trademark_material')}(s)`,
            data: data?.children || [],
          }
        : {
            key: 'non_hierarchy',
            title: t('section.material_batch'),
            data: order_stocks,
          },
    ],
    [data?.children, isHierarchy, order_stocks, t]
  )

  useToolbar({
    title: t(orderTypeNames[orderDetail.type]),
  })

  const renderHeader = () => (
    <React.Fragment>
      <Text className={AppStyles.textBold}>{t('order.item_detail')}</Text>
      <View className='my-4'>
        {isHierarchy && (
          <Text className={cn(AppStyles.textBold, 'text-mediumGray mb-2')}>
            {t('label.active_ingredient_material')}
          </Text>
        )}
        <View className='border border-quillGrey p-2 rounded-sm '>
          <Text className={cn(AppStyles.textBold, 'flex-1 mb-1')}>
            {data.material.name}
          </Text>
          <OrderItemQuantityInfo
            orderStatus={orderDetail.status}
            orderedQty={quantities.orderedQty}
            confirmedQty={quantities.confirmedQty}
            allocatedQty={quantities.allocatedQty}
            receivedQty={quantities.receivedQty}
            shippedQty={quantities.shippedQty}
          />
        </View>
      </View>
    </React.Fragment>
  )

  const renderSectionHeader = ({ section }) => {
    return showSectionHeader ? (
      <Text className={cn(AppStyles.textBold, 'text-mediumGray mb-2')}>
        {section.title}
      </Text>
    ) : null
  }

  const renderItem = ({ item }) => {
    return isHierarchy ? (
      <View />
    ) : (
      <OrderItemStockInfo
        data={{
          ...item,
          shipped_qty: orderDetail.shipped_at ? item.allocated_qty : 0,
        }}
        orderStatus={orderDetail.status}
      />
    )
  }

  const renderFooter = () => {
    return isHierarchy
      ? data?.children?.map((child) => (
          <TradeMarkMaterialItem
            key={child.id}
            type='detail'
            name={child.material?.name}
            label={labelText}
            qty={child.qty}
            data={child}
            t={t}
            orderStatus={orderDetail.status}
          />
        ))
      : null
  }

  return (
    <SafeAreaView className='flex-1 bg-lightBlueGray'>
      <HeaderMaterial
        items={[
          {
            label: t('label.activity'),
            value: orderDetail.activity.name,
          },
          { label: entityInfo.entityLabel, value: entityInfo.entityName },
        ]}
      />
      <SectionList
        sections={orderItemSection}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item?.id?.toString()}
        contentContainerClassName='bg-white p-4'
      />
    </SafeAreaView>
  )
}
