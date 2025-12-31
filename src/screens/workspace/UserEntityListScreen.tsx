import React, { useCallback } from 'react'
import { useLanguage } from '@/i18n/useLanguage'
import { UserGlobal } from '@/models/shared/EntityUser'
import useUserEntityList from './hooks/useUserEntityList'
import UserItem from '../program-entity/components/UserItem'
import UserListScreenBase from '../shared/component/UserListScreenBase'

export default function UserEntityListScreen() {
  const hookData = useUserEntityList()
  const { t } = useLanguage()

  const renderUserItem = useCallback(
    (item: UserGlobal) => {
      // Handle null firstname or lastname
      const fullName = [item?.firstname, item?.lastname]
        .filter(Boolean)
        .join(' ')

      return (
        <UserItem
          labelNameKey='label.fullname'
          name={fullName}
          username={item?.username}
          phone={item?.mobile_phone}
          role={item?.role_label}
          t={t}
        />
      )
    },
    [t]
  )

  return (
    <UserListScreenBase
      {...hookData}
      type='user_entity'
      loadingDialogTestId='loadingdialog-user-entity'
      renderUserItem={renderUserItem}
    />
  )
}
