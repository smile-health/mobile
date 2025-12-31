import React, { useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { CheckBox } from '@/components/buttons/CheckBox'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { ORDER_STATUS } from '@/utils/Constants'

interface OrderColdChainProps {
  data: any
  orderStatus: number
}

export function OrderColdChain({
  orderStatus,
  data,
}: Readonly<OrderColdChainProps>) {
  const { t } = useLanguage()
  const [showColdChain, setShowColdChain] = useState(false)
  const statusLabel = useMemo(() => {
    return orderStatus === ORDER_STATUS.PENDING
      ? t('order.ordered')
      : t('order.confirmed')
  }, [orderStatus, t])

  const { unconfirmedData, preferredData } = useMemo(() => {
    const unconfirmedData = data.find((c) => !c.is_confirm) ?? null
    const confirmedData = data.find((c) => c.is_confirm) ?? null
    return {
      unconfirmedData,
      preferredData: confirmedData ?? unconfirmedData,
    }
  }, [data])

  const toggleCheckbox = () => setShowColdChain((prev) => !prev)
  return (
    <>
      <View className='bg-white pb-4'>
        <View className='bg-softIvory border border-orangeRust rounded px-3.5 py-3 mt-2 mx-4  gap-y-1'>
          <Text className={cn(AppStyles.textBold, 'text-orangeRust')}>
            {t('order.coldchain_capacity_status', {
              status: statusLabel,
            })}
          </Text>
          <ColdChainData
            label={t('order.projected_total_order_volume')}
            value={preferredData?.total_volume}
          />
          <ColdChainData
            label={t('order.net_storage_capacity')}
            value={preferredData?.capacity_asset}
          />
          <ColdChainData
            label={t('order.percentage_used_capacity')}
            value={`${preferredData?.percent_capacity ?? '-'}%`}
          />
        </View>
      </View>

      {orderStatus !== ORDER_STATUS.PENDING && (
        <>
          <CheckBox
            text={t('order.show_ordered_coldchain')}
            containerClassName='mt-4'
            checked={showColdChain}
            onPress={toggleCheckbox}
            testID='checkbox-show-ordered-coldchain'
          />
          {showColdChain && (
            <View className='bg-whiteThree rounded px-3.5 py-3 gap-y-1 mt-4'>
              <ColdChainData
                label={t('order.projected_total_order_volume')}
                value={unconfirmedData?.total_volume}
              />
              <ColdChainData
                label={t('order.net_storage_capacity')}
                value={unconfirmedData?.capacity_asset}
              />
              <ColdChainData
                label={t('order.percentage_used_capacity')}
                value={`${unconfirmedData?.percent_capacity ?? '-'}%`}
              />
            </View>
          )}
        </>
      )}
    </>
  )
}

interface ColdChainDataProps {
  label: string
  value?: string | number | null
}
function ColdChainData({ label, value = '-' }: Readonly<ColdChainDataProps>) {
  return (
    <View className={AppStyles.rowBetween}>
      <Text className={AppStyles.textRegularSmall}>{label}</Text>
      <Text className={AppStyles.textBoldSmall}>{value}</Text>
    </View>
  )
}
