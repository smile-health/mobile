import React, { useCallback } from 'react'
import { View, ActivityIndicator, FlatList } from 'react-native'
import { Icons } from '@/assets/icons'
import EmptyState from '@/components/EmptyState'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { EntityType } from '@/models'
import colors from '@/theme/colors'
import EntityDetailHeader from '../../program-entity/components/EntityDetailHeader'
import UserItem from '../../program-entity/components/UserItem'

interface UserListScreenBaseProps {
  entity: any
  userList: any[]
  totalUser: number
  isLoadMore: boolean
  isLoadingUser: boolean
  control: any
  handleLoadMore: () => void
  handleSearchUser: (value: string) => void
  type?: EntityType | 'user_entity'
  loadingDialogTestId?: string
  renderUserItem?: (item: any, t: any) => React.ReactElement
}

export default function UserListScreenBase({
  entity,
  userList,
  totalUser,
  isLoadMore,
  isLoadingUser,
  control,
  handleLoadMore,
  handleSearchUser,
  type = 'user_entity',
  loadingDialogTestId = 'loadingdialog-user-entity',
  renderUserItem,
}: Readonly<UserListScreenBaseProps>) {
  const { t } = useLanguage()

  const defaultRenderUserItem = useCallback(
    (item: any) => {
      // Default implementation for workspace user list
      return (
        <UserItem
          name={`${item?.firstname} ${item?.lastname}`}
          username={item?.username}
          phone={item?.mobile_phone}
          role={item?.role_label}
          t={t}
        />
      )
    },
    [t]
  )

  const renderItem = useCallback(
    ({ item }) => {
      return renderUserItem
        ? renderUserItem(item, t)
        : defaultRenderUserItem(item)
    },
    [t, renderUserItem, defaultRenderUserItem]
  )

  const renderHeader = useCallback(
    () => (
      <EntityDetailHeader
        control={control}
        entity={entity}
        itemCount={totalUser}
        onSearch={handleSearchUser}
        type={type}
      />
    ),
    [control, entity, handleSearchUser, totalUser, type]
  )

  const renderEmpty = useCallback(
    () => (
      <View className='flex-1 items-center'>
        <EmptyState
          testID='empty-state-user'
          Icon={Icons.IcEmptyStateOrder}
          title={t('empty_state.no_data_available')}
          subtitle={t('empty_state.no_data_message')}
        />
      </View>
    ),
    [t]
  )

  const renderFooter = useCallback(() => {
    if (!isLoadMore) return null
    return (
      <View className='py-4'>
        <ActivityIndicator size='large' color={colors.main()} />
      </View>
    )
  }, [isLoadMore])

  return (
    <View className='flex-1 bg-white'>
      <FlatList
        data={userList}
        renderItem={renderItem}
        onEndReached={handleLoadMore}
        contentContainerClassName='flex-grow'
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={renderHeader}
      />
      <LoadingDialog
        testID={loadingDialogTestId}
        modalVisible={isLoadingUser}
      />
    </View>
  )
}
