import React, { useMemo } from 'react'
import { View, Text } from 'react-native'
import { TFunction } from 'i18next'
import { Icons } from '@/assets/icons'
import { Button } from '@/components/buttons'
import { EventReportDetailResponse } from '@/models/order/EventReportDetail'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTicketStatusColor } from '@/utils/CommonUtils'
import { SHORT_DATE_TIME_FORMAT } from '@/utils/Constants'
import { convertString } from '@/utils/DateFormatUtils'
import { findStatusLabelTicket } from '@/utils/helpers/labelLookup'
import { useCalculateTotalLeadTime } from '../../helpers/TicketHelpers'

interface TicketDetailHeaderProps {
  ticketDetail: EventReportDetailResponse
  t: TFunction
  onViewOrderDetail: () => void
  onViewPackingSlip: () => void
}

const StatusHeader = React.memo(
  ({
    statusLabel,
    createdAt,
    statusId,
  }: {
    statusLabel: string
    createdAt?: string
    statusId?: number
  }) => {
    const { background, text } = getTicketStatusColor(statusId)

    return (
      <View className={`flex-row justify-between p-2 ${background}`}>
        <Text className={text}>{statusLabel}</Text>
        <Text className={cn(AppStyles.textBold)}>
          {convertString(createdAt, SHORT_DATE_TIME_FORMAT)}
        </Text>
      </View>
    )
  }
)
StatusHeader.displayName = 'StatusHeader'

const CustomerInfo = React.memo(
  ({
    entityName,
    entityAddress,
    t,
  }: {
    entityName?: string
    entityAddress?: string
    t: TFunction
  }) => (
    <View className='flex mt-2'>
      <Text className='text-xs text-gray-500 mb-1'>{t('label.customer')}</Text>
      <Text className={cn(AppStyles.textBold, 'mb-1')}>{entityName}</Text>
      <Text className='text-xs text-darkGray mb-1'>{entityAddress ?? '-'}</Text>
    </View>
  )
)
CustomerInfo.displayName = 'CustomerInfo'

const DetailRow = React.memo(
  ({ label, value }: { label: string; value: string | number }) => (
    <View className='flex-row justify-between mt-1'>
      <Text className='text-xs text-gray-500 mt-1'>{label}</Text>
      <Text className={cn(AppStyles.textBold, 'text-xs text-darkGray mt-1')}>
        {value}
      </Text>
    </View>
  )
)
DetailRow.displayName = 'DetailRow'

const StatusHistory = React.memo(
  ({
    history,
    ticketDetail,
    t,
    onViewOrderDetail,
    onViewPackingSlip,
  }: {
    history: EventReportDetailResponse['history_change_status']
    ticketDetail: EventReportDetailResponse
    t: TFunction
    onViewOrderDetail: () => void
    onViewPackingSlip: () => void
  }) => (
    <View className='px-4 py-3'>
      <Text className={cn(AppStyles.textBold, 'text-base mb-1 text-gray-500')}>
        {t('ticket.status_history')}
      </Text>
      {history?.map((item) => (
        <View
          key={`${item.status_label}-${item.created_at}-${item?.created_by?.firstname}`}
          className='flex-row justify-between'>
          <Text className='text-xs text-gray-500 mt-1'>
            {item.status_label}
          </Text>
          <Text className='text-xs text-darkGray mt-1'>
            {convertString(item.created_at, SHORT_DATE_TIME_FORMAT)} by{' '}
            {item?.created_by?.firstname ?? '-'}
          </Text>
        </View>
      ))}
      {Boolean(ticketDetail?.order_id) && (
        <View className='mt-6 flex-row justify-start'>
          <Button
            preset='outlined-primary'
            LeftIcon={Icons.IcOrderDetail}
            containerClassName='items-start justify-start gap-x-2'
            text={t('ticket.view_order_detail')}
            onPress={onViewOrderDetail}
          />
        </View>
      )}

      {Boolean(ticketDetail?.slip_link) && (
        <View className='mt-4 flex-row justify-start'>
          <Button
            preset='outlined-primary'
            LeftIcon={Icons.IcLink}
            containerClassName='items-start justify-start gap-x-2'
            text={t('ticket.view_packing_slip_link')}
            onPress={onViewPackingSlip}
          />
        </View>
      )}

      <View className='mt-4 h-2 bg-[#F1F5F9] mx-[-14px]' />
    </View>
  )
)
StatusHistory.displayName = 'StatusHistory'

const ItemsHeader = React.memo(
  ({ itemsCount, t }: { itemsCount: number; t: TFunction }) => (
    <View className='flex-row px-4 justify-between items-center mt-2'>
      <Text className={cn(AppStyles.textBold, 'text-base')}>
        {t('ticket.item', 'Item')}
      </Text>
      <Text className='text-xs text-gray-500'>
        {`Total: ${t('label.count_items', { count: itemsCount })}`}
      </Text>
    </View>
  )
)
ItemsHeader.displayName = 'ItemsHeader'

const TicketDetailHeader: React.FC<TicketDetailHeaderProps> = ({
  ticketDetail,
  t,
  onViewOrderDetail,
  onViewPackingSlip,
}) => {
  const statusLabel = useMemo(
    () =>
      findStatusLabelTicket(
        ticketDetail?.history_change_status ?? [],
        ticketDetail?.status_id ?? 0
      ) ??
      ticketDetail?.status_label ??
      '',
    [
      ticketDetail?.history_change_status,
      ticketDetail?.status_id,
      ticketDetail?.status_label,
    ]
  )

  const totalLeadTime = useCalculateTotalLeadTime(
    ticketDetail?.created_at,
    ticketDetail?.updated_at,
    ticketDetail?.status_id
  )

  const labelDONumberOrOrder = ticketDetail.order_id
    ? 'ticket.order_number'
    : 'ticket.do_number'

  const valueDONumberOrOrder = ticketDetail.order_id || ticketDetail?.do_number

  const isOrderId = ticketDetail?.order_id

  return (
    <View className='bg-white'>
      <StatusHeader
        statusLabel={statusLabel}
        createdAt={ticketDetail?.created_at}
        statusId={ticketDetail?.status_id}
      />

      <View className='mx-4 py-3 border-b border-gray-200'>
        <Text className={cn(AppStyles.textBold, 'text-base mb-1')}>
          {t('ticket.detail_title')} - LK-{ticketDetail.id}
        </Text>

        <CustomerInfo
          entityName={ticketDetail?.entity?.name}
          entityAddress={ticketDetail?.entity?.address}
          t={t}
        />

        <View className='my-1 border-b border-gray-200' />

        <DetailRow
          label={t(labelDONumberOrOrder)}
          value={valueDONumberOrOrder}
        />

        <DetailRow label={t('ticket.total_lead_time')} value={totalLeadTime} />

        {isOrderId && (
          <DetailRow
            label={t('ticket.cancel_inquiry')}
            value={t('common.yes')}
          />
        )}
      </View>

      <StatusHistory
        history={ticketDetail.history_change_status}
        ticketDetail={ticketDetail}
        t={t}
        onViewOrderDetail={onViewOrderDetail}
        onViewPackingSlip={onViewPackingSlip}
      />

      <ItemsHeader itemsCount={ticketDetail?.items?.length ?? 0} t={t} />
    </View>
  )
}

TicketDetailHeader.displayName = 'TicketDetailHeader'

export default React.memo(TicketDetailHeader)
