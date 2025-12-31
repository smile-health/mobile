import React, { useState } from 'react'
import {
  FlatList,
  ListRenderItem,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import { ImageButton } from '@/components/buttons'
import CardWorkspace from '@/components/cards/CardWorkspace'
import { useSearchBar } from '@/components/toolbar/hooks/useSearchBar'
import { Workspace } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import { useGetWorkspacesQuery } from '@/services/apis/workspaces.api'
import { setAppTheme } from '@/services/features'
import { useAppDispatch } from '@/services/store'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'

interface Props extends AppStackScreenProps<'Workspace'> {}

const LoadingView = () => (
  <ActivityIndicator
    testID='activityindicator-loading'
    color={colors.bluePrimary}
    size={24}
    className='flex-1 bg-white justify-center items-center'
  />
)

export default function WorkspaceScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const [isSearch, setIsSearch] = useState(false)

  const { data = [], isLoading } = useGetWorkspacesQuery()

  const { t } = useTranslation()

  useSearchBar({
    isSearch,
    setIsSearch,
    placeholder: 'Cari workspace',
    onSubmitSearch(text) {
      console.log(text)
    },
    toolbarProps: {
      title: 'SMILE Indonesia',
      showBackButton: false,
      actions: (
        <ImageButton
          Icon={Icons.IcSearch}
          size={24}
          onPress={() => setIsSearch(true)}
        />
      ),
    },
  })

  const renderItem: ListRenderItem<Workspace> = ({ item }) => (
    <CardWorkspace
      testID={`cardworkspace-${item.key}`}
      name={t(item.key, item.name)}
      backgroundColor={''}
      onPress={() => onPressHome(item)}
    />
  )

  const renderEmptyComponent = () => {
    return <></>
  }

  const onPressHome = (item) => {
    dispatch(setAppTheme(item.key))
    navigation.navigate('Home', item)
  }

  if (isLoading) {
    return <LoadingView />
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <FlatList
        data={data}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        numColumns={4}
        {...getTestID('flatlist-workspaces')}
      />
    </SafeAreaView>
  )
}
