import React, { useState } from 'react'
import {
  FlatList,
  ListRenderItem,
  Text,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native'
import { ItemSeparator } from '@/components/list/ItemSeparator'
import { useLanguage } from '@/i18n/useLanguage'
import { ChangeHistory } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { useGetChangeHistoryQuery } from '@/services/apis'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { cn } from '@/theme/theme-config'
import ChangeHistoryBottomSheet from './component/ChangeHistoryBottomSheet'
import { ChangeHistoryItem } from './component/ChangeHistoryItem'

interface Props extends AppStackScreenProps<'ChangeHistory'> {}

const itemSeparator = () => <ItemSeparator />

export default function ChangeHistoryScreen({ route }: Props) {
  const { userId } = route.params
  const { data = [], isLoading } = useGetChangeHistoryQuery(userId, {
    skip: !userId,
    refetchOnMountOrArgChange: true,
  })

  const { t } = useLanguage()

  const [selectedHistory, setSelectedHistory] = useState<ChangeHistory>()
  const [isOpenBottomSheet, setIsOpenBottomSheet] = useState(false)

  const dismissBottomSheet = () => {
    setIsOpenBottomSheet(false)
  }

  const showBottomSheet = (item: ChangeHistory) => {
    setSelectedHistory(item)
    setIsOpenBottomSheet(true)
  }

  const renderHeader = () => (
    <Text className={cn(AppStyles.textMedium, 'text-[13px] p-4 text-warmGrey')}>
      {t('profile.changes_history_desc')}
    </Text>
  )

  const renderItem: ListRenderItem<ChangeHistory> = ({ item }) => (
    <ChangeHistoryItem data={item} onPress={() => showBottomSheet(item)} />
  )

  if (isLoading) {
    return (
      <ActivityIndicator
        size='large'
        color={colors.app()}
        className='flex-1 justify-center items-center bg-white'
      />
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={itemSeparator}
        contentContainerClassName='pb-6'
      />
      <ChangeHistoryBottomSheet
        isOpen={isOpenBottomSheet}
        name='ChangeHistoryBottomSheet'
        toggleSheet={dismissBottomSheet}
        data={selectedHistory}
      />
    </SafeAreaView>
  )
}
