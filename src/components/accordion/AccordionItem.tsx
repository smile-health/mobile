import React, { memo, useMemo } from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { Icons } from '@/assets/icons'
import { useLanguage } from '@/i18n/useLanguage'
import { NotifData } from '@/models'
import { AppNotifMaterial } from '@/models/notif/AppNotifMaterial'
import AppStyles from '@/theme/AppStyles'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { MENU_NAMES } from '@/utils/Constants'
import MaterialAlert from './MaterialAlert'

interface AccordionItemProps {
  name: string
  testID: string
  notif?: NotifData
  materialAlert?: AppNotifMaterial
  showFlag?: boolean
  onPress: () => void
}

const NotificationBadge = memo(({ notif }: { notif?: NotifData }) => {
  const { t } = useLanguage()

  if (!notif?.notifData?.order_not_received?.total) return null

  return (
    <View
      {...getTestID('notification-badge')}
      className='flex-row items-center p-1 gap-x-1 rounded-sm bg-softPink'>
      <Icons.IcAlertED height={16} width={16} />
      <Text className={cn(AppStyles.labelRegular, 'text-lavaRed')}>
        {t('order.orders_not_received', {
          num: notif.notifData.order_not_received.total,
        })}
      </Text>
    </View>
  )
})
NotificationBadge.displayName = 'NotificationBadge'

export default function AccordionItem(props: Readonly<AccordionItemProps>) {
  const { name, testID, showFlag, notif, materialAlert, onPress } = props
  const { t } = useLanguage()

  const hasUnreceivedOrders =
    name === MENU_NAMES.ORDER.LIST_ORDER &&
    (notif?.notifData?.order_not_received?.total ?? 0) > 0

  const alert = useMemo(() => {
    if (name !== MENU_NAMES.INVENTORY.VIEW_STOCK) return
    return {
      batch_ed: materialAlert?.expired,
      batch_near_ed: materialAlert?.expired_in_30_day,
    }
  }, [materialAlert?.expired, materialAlert?.expired_in_30_day, name])

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(AppStyles.borderBottom, 'px-4 py-3 gap-y-2')}
      {...getTestID(testID)}>
      <View className={cn(AppStyles.rowCenterAlign, 'gap-x-2')}>
        <Text className={cn(AppStyles.textRegularMedium, 'flex-1')}>
          {t(name, '')}
        </Text>
        {showFlag && <Icons.IcFlag height={16} width={16} />}
        <Icons.IcChevronRight height={16} width={16} />
      </View>
      {alert && (
        <MaterialAlert
          expiredBatch={alert.batch_ed}
          nearExpiredBatch={alert.batch_near_ed}
        />
      )}
      {hasUnreceivedOrders && <NotificationBadge notif={notif} />}
    </TouchableOpacity>
  )
}
