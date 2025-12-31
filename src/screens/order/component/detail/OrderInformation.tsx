import React, { useMemo, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ParseKeys, TFunction } from 'i18next'
import { FieldValue } from '@/components/list/FieldValue'
import { useLanguage } from '@/i18n/useLanguage'
import { OrderDetailResponse } from '@/models/order/OrderDetail'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import {
  SHORT_DATE_FORMAT,
  SHORT_DATE_TIME_FORMAT,
  ORDER_STATUS,
  orderTypeNames,
} from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import BadgeIntegrationOrder from './BadgeIntegrationOrder'
import { OrderHistorySection } from './OrderHistorySection'
import VendorCustomerSection from '../section/VendorCustomerSection'

interface CommonProps {
  t: TFunction
}

interface OrderDetailsSectionProps extends CommonProps {
  order: OrderDetailResponse
  orderStatus: OrderStatus
}

interface OrderInformationProps {
  readonly order: OrderDetailResponse
}

interface OrderStatus {
  IS_ORDER_PENDING: boolean
  IS_ORDER_CONFIRMED: boolean
  IS_ORDER_ALLOCATED: boolean
  IS_ORDER_FULFILLED: boolean
  IS_ORDER_CANCELLED: boolean
}

const OrderDetailsSection = ({
  order,
  orderStatus,
  t,
}: OrderDetailsSectionProps) => {
  const { IS_ORDER_FULFILLED, IS_ORDER_CONFIRMED, IS_ORDER_PENDING } =
    orderStatus

  const fieldConfigs = [
    {
      label: 'label.delivery_type',
      value: order.delivery_type || '-',
    },
    {
      label: 'label.contract_number',
      value: order.po_no,
    },
    {
      label: 'label.required_by_date',
      value: convertString(order.required_date, SHORT_DATE_FORMAT) || '-',
      valueClassName: 'uppercase',
    },
  ]

  if (IS_ORDER_FULFILLED) {
    fieldConfigs.push(
      {
        label: 'label.estimated_arrival_date',
        value: convertString(order.estimated_date, SHORT_DATE_FORMAT) || '-',
        valueClassName: 'uppercase',
      },
      {
        label: 'label.customer_picked_up',
        value: t(order.taken_by_customer ? 'common.yes' : 'common.no'),
      }
    )
  }

  if (!IS_ORDER_PENDING || !IS_ORDER_CONFIRMED) {
    fieldConfigs.push(
      {
        label: 'label.actual_shipment_date',
        value: convertString(order.shipped_at, SHORT_DATE_FORMAT) || '-',
        valueClassName: 'uppercase',
      },
      {
        label: 'label.actual_receipt_date',
        value: convertString(order.fulfilled_at, SHORT_DATE_FORMAT) || '-',
        valueClassName: 'uppercase',
      }
    )
  }

  return (
    <View className='border-t border-t-whiteTwo mt-3.5 pt-3.5 gap-y-2'>
      {fieldConfigs.map((field) => (
        <FieldValue
          key={field.label}
          label={t(field.label as ParseKeys)}
          value={field.value}
          className={AppStyles.rowBetween}
          labelClassName={AppStyles.labelRegular}
          valueClassName={cn(
            AppStyles.textBoldSmall,
            'text-right',
            field.valueClassName
          )}
        />
      ))}
    </View>
  )
}

export function OrderInformation({
  order,
  ...restProps
}: OrderInformationProps) {
  const { t } = useLanguage()
  const [showDetail, setShowDetail] = useState(false)

  const orderStatus = {
    IS_ORDER_PENDING: order.status === ORDER_STATUS.PENDING,
    IS_ORDER_CONFIRMED: order.status === ORDER_STATUS.CONFIRMED,
    IS_ORDER_ALLOCATED: order.status === ORDER_STATUS.ALLOCATED,
    IS_ORDER_FULFILLED: order.status === ORDER_STATUS.FULFILLED,
    IS_ORDER_CANCELLED: order.status === ORDER_STATUS.CANCELLED,
  }

  const formatDateWithUser = useMemo(
    () => (date, user) => {
      const formattedDate = convertString(date, SHORT_DATE_TIME_FORMAT)
      return formattedDate
        ? `${formattedDate} ${t('label.by')} ${user?.firstname || ''} ${user?.lastname || '-'}`.trim()
        : '-'
    },
    [t]
  )

  const timestamps = useMemo(
    () => ({
      createdAt: formatDateWithUser(order.created_at, order.user_created_by),
      confirmedAt: formatDateWithUser(
        order.confirmed_at,
        order.user_confirmed_by
      ),
      allocatedAt: formatDateWithUser(
        order.allocated_at,
        order.user_allocated_by
      ),
      shippedAt: formatDateWithUser(order.shipped_at, order.user_shipped_by),
      fulfilledAt: formatDateWithUser(
        order.fulfilled_at,
        order.user_fulfilled_by
      ),
      cancelledAt: formatDateWithUser(
        order.cancelled_at,
        order.user_cancelled_by
      ),
    }),
    [
      formatDateWithUser,
      order.allocated_at,
      order.cancelled_at,
      order.confirmed_at,
      order.created_at,
      order.fulfilled_at,
      order.shipped_at,
      order.user_allocated_by,
      order.user_cancelled_by,
      order.user_confirmed_by,
      order.user_created_by,
      order.user_fulfilled_by,
      order.user_shipped_by,
    ]
  )

  const orderTitle = useMemo(() => {
    const orderType = t(orderTypeNames[order?.type] || '')
    return `${orderType} ${t('label.details')} - ${order.id}`
  }, [order?.type, order.id, t])

  const badgeIntegrationType = order?.metadata?.client_key

  return (
    <View className='p-4 bg-white' {...restProps}>
      <View className={cn(AppStyles.card, 'px-0 border-white py-0')}>
        <View className='flex-row items-center mb-2'>
          <Text className={cn(AppStyles.textBold, 'mr-2')}>{orderTitle}</Text>
          {badgeIntegrationType && (
            <BadgeIntegrationOrder type={badgeIntegrationType} />
          )}
        </View>
        <VendorCustomerSection
          vendor={order.vendor}
          customer={order.customer}
          t={t}
        />
        {showDetail && (
          <>
            <OrderDetailsSection
              order={order}
              orderStatus={orderStatus}
              t={t}
            />
            <OrderHistorySection order={order} timestamps={timestamps} t={t} />
          </>
        )}
      </View>
      <TouchableOpacity
        {...getTestID('btn-toggle-show-detail')}
        onPress={() => setShowDetail((prev) => !prev)}
        activeOpacity={0.7}
        className='self-end gap-x-2 mt-4'>
        <Text className={cn(AppStyles.textRegular, 'text-main text-right')}>
          {showDetail ? t('button.show_less') : t('button.show_all')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}
