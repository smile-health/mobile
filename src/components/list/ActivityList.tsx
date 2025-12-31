import React, { useCallback } from 'react'
import { FlatList } from 'react-native'
import { useLanguage } from '@/i18n/useLanguage'
import { Activity } from '@/models/'
import { AppNotifActivity } from '@/models/notif/AppNotifMaterial'
import ActivityMaterialItem from './ActivityMaterialItem'
import ListTitle from './ListTitle'
import Banner from '../banner/Banner'

interface ActivityListProps {
  data: Activity[]
  onPress: (val: Activity) => void
  activity?: Activity
  materialAlert?: AppNotifActivity[]
}

export default function ActivityList({
  data,
  onPress,
  activity,
  materialAlert,
}: Readonly<ActivityListProps>) {
  const renderItem = useCallback(
    ({ item }) => {
      const showFlag =
        activity?.id === item.id &&
        activity?.entity_activity_id === item.entity_activity_id

      const activityMaterialAlert = materialAlert?.find(
        (ma) => ma.id === item.id
      )
      return (
        <ActivityMaterialItem
          testID={`activity-item-${item.title}`}
          onPress={() => onPress(item)}
          title={item.name}
          showFlag={showFlag}
          activityMaterialAlert={activityMaterialAlert}
        />
      )
    },
    [activity, onPress, materialAlert]
  )

  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      data={data}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={renderItem}
      ListHeaderComponent={<ActivityListHeader itemCount={data.length} />}
    />
  )
}

const ActivityListHeader = ({ itemCount }: { readonly itemCount: number }) => {
  const { t } = useLanguage()
  return (
    <React.Fragment>
      <Banner
        title={t('home.select_activity_info')}
        testID='activity-list-info'
        titleClassName='flex-1'
        containerClassName='mb-0'
      />
      <ListTitle
        title={t('home.activity_list')}
        itemCount={itemCount}
        className='px-0'
      />
    </React.Fragment>
  )
}
