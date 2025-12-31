import React, { useCallback, useMemo } from 'react'
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ListRenderItem,
} from 'react-native'
import Animated, {
  FadeInUp,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import { Icons } from '@/assets/icons'
import { NotifData } from '@/models'
import { HomeMenuChildItem } from '@/models/home/Home'
import { AppNotifMaterial } from '@/models/notif/AppNotifMaterial'
import { checkTrxDraftFlag } from '@/screens/inventory/helpers/TransactionHelpers'
import { trxState, useAppSelector } from '@/services/store'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import { getTestID } from '@/utils/CommonUtils'
import { MENU_NAMES } from '@/utils/Constants'
import AccordionItem from './AccordionItem'

interface AccordionProps {
  name: string
  onToggleAccordion: () => void
  onPressChild: (item: HomeMenuChildItem) => void
  isOpen: boolean
  childs: HomeMenuChildItem[]
  testID: string
  notif: NotifData
  notifMaterial?: AppNotifMaterial
}

export default function Accordion(props: Readonly<AccordionProps>) {
  const {
    name,
    onToggleAccordion,
    onPressChild,
    isOpen,
    childs,
    testID,
    notif,
    notifMaterial,
  } = props
  const { draftTrxTypeId } = useAppSelector(trxState)

  const showAlertIcon = useMemo(() => {
    const orderMenus = [MENU_NAMES.ORDER.ROOT] as const
    type OrderMenuType = (typeof orderMenus)[number]

    const isOrderMenu = orderMenus.includes(notif?.menuName as OrderMenuType)

    const haveOrderAlert =
      (notif?.notifData?.order_not_received?.total ?? 0) > 0

    const haveMaterialAlert =
      !!notifMaterial?.expired || !!notifMaterial?.expired_in_30_day
    return (isOrderMenu && haveOrderAlert) || haveMaterialAlert
  }, [
    notif?.menuName,
    notif?.notifData?.order_not_received?.total,
    notifMaterial?.expired,
    notifMaterial?.expired_in_30_day,
  ])

  const _damping = 20

  const arrowIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isOpen ? '-180deg' : '0deg') }],
  }))

  const handleToggleAccordion = () => {
    onToggleAccordion()
  }

  const checkShowFlag = useCallback(
    (item: HomeMenuChildItem) => {
      const hasTrxDraft = checkTrxDraftFlag(
        item.transactionType,
        draftTrxTypeId
      )
      return hasTrxDraft
    },
    [draftTrxTypeId]
  )

  const handlePress = (item: HomeMenuChildItem) => onPressChild(item)

  const renderItem: ListRenderItem<HomeMenuChildItem> = ({ item }) => {
    const data = {
      menuName: item.name,
      notifData: notif?.notifData,
    }
    const showFlag = checkShowFlag(item)

    return (
      <AccordionItem
        testID={`item-accordion-${item.name}`}
        name={item.name}
        notif={data}
        materialAlert={notifMaterial}
        showFlag={showFlag}
        onPress={() => handlePress(item)}
      />
    )
  }

  return (
    <Animated.View
      exiting={FadeOutUp}
      layout={LinearTransition.springify().damping(_damping)}>
      <TouchableOpacity
        style={style.container}
        className={cn(
          AppStyles.rowBetween,
          'bg-white rounded-md px-4 py-3 shadow-blackTransparent'
        )}
        activeOpacity={0.8}
        onPress={handleToggleAccordion}
        {...getTestID(testID)}>
        <Text className={AppStyles.textRegularMedium}>{name}</Text>
        <View className='flex flex-row items-center'>
          {showAlertIcon && <Icons.IcError />}
          <Animated.View className='ml-2' style={arrowIconStyle}>
            <Icons.IcExpandMore height={20} width={20} fill={colors.marine} />
          </Animated.View>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <Animated.FlatList
          entering={FadeInUp.springify().damping(_damping)}
          exiting={FadeOutUp}
          layout={LinearTransition.springify().damping(_damping)}
          className='mt-2'
          showsVerticalScrollIndicator={false}
          data={childs}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
        />
      )}
    </Animated.View>
  )
}

const style = StyleSheet.create({
  container: {
    elevation: 3,
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
})
