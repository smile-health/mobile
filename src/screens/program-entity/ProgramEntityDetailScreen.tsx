import React, { useCallback } from 'react'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { useLanguage } from '@/i18n/useLanguage'
import { useLocalizedName } from '@/i18n/useLocalizedName'
import { ENTITY_TYPE } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import UserItem from './components/UserItem'
import useEntityDetail from './hooks/useEntityDetail'
import UserListScreenBase from '../shared/component/UserListScreenBase'

interface Props extends AppStackScreenProps<'ProgramEntityDetail'> {}

const title = {
  [ENTITY_TYPE.CUSTOMER]: 'customer_vendor.title.customer_detail',
  [ENTITY_TYPE.VENDOR]: 'customer_vendor.title.vendor_detail',
}

export default function ProgramEntityDetailScreen({ route }: Props) {
  const { data, type } = route.params
  const { t } = useLanguage()
  const { roleName } = useLocalizedName()
  const hookData = useEntityDetail(data)

  useToolbar({ title: t(title[type]) })

  const renderUserItem = useCallback(
    (item: any) => {
      const { full_name, username, phone_number, role } = item
      return (
        <UserItem
          name={full_name}
          username={username}
          phone={phone_number}
          role={roleName(role)}
          t={t}
        />
      )
    },
    [t, roleName]
  )

  return (
    <UserListScreenBase
      {...hookData}
      type={type}
      loadingDialogTestId='loadingdialog-entity-user'
      renderUserItem={renderUserItem}
    />
  )
}
