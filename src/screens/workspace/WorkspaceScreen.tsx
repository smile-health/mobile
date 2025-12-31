import React, { useMemo } from 'react'
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  SafeAreaView,
} from 'react-native'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Icons } from '@/assets/icons'
import CardWorkspace from '@/components/cards/CardWorkspace'
import EmptyState from '@/components/EmptyState'
import { SearchField } from '@/components/forms'
import LoadingDialog from '@/components/LoadingDialog'
import { Workspace } from '@/models'
import { AppStackScreenProps } from '@/navigators'
import {
  useLazyFetchProfileQuery,
  useLazyGetNotificationCountQuery,
  useLazyGetOrderReasonsQuery,
} from '@/services/apis'
import { setProgramColor } from '@/services/features'
import {
  ProgramWasteManagement,
  setSelectedWorkspace,
} from '@/services/features/workspace.slice'
import {
  useAppDispatch,
  useAppSelector,
  workspaceState,
} from '@/services/store'
import colors from '@/theme/colors'
import { getTestID, showError } from '@/utils/CommonUtils'
import { ORDER_REASON_TYPE, PAGINATE } from '@/utils/Constants'
import HeaderEntity from './component/HeaderEntity'

interface Props extends AppStackScreenProps<'Workspace'> {}

export default function WorkspaceScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const { workspaces } = useAppSelector(workspaceState)

  const [fetchProfile, { isLoading, isFetching }] = useLazyFetchProfileQuery()
  const [fetchNotificationCount] = useLazyGetNotificationCountQuery()
  const [fetchOrderReason] = useLazyGetOrderReasonsQuery()

  const fetchRequestOrderReasons = async () => {
    return await fetchOrderReason({
      paginate: PAGINATE,
      order_type: ORDER_REASON_TYPE.REQUEST,
    })
  }

  const fetchRelocationOrderReasons = async () => {
    return await fetchOrderReason({
      paginate: PAGINATE,
      order_type: ORDER_REASON_TYPE.RELOCATION,
    })
  }

  const isLoadProfile = isLoading || isFetching

  const { t } = useTranslation()
  const { control, watch } = useForm({ defaultValues: { name: '' } })
  const search = watch('name')

  const filteredProgram = useMemo(() => {
    return workspaces.filter((w) =>
      w.name.toLowerCase().includes(search?.toLowerCase())
    )
  }, [search, workspaces])

  const renderItem: ListRenderItem<Workspace> = ({ item }) => (
    <CardWorkspace
      name={item.name}
      programKey={item.key}
      backgroundColor={item.config.color}
      onPress={() => onPressHome(item)}
      testID={`card-workspace-${item.key}`}
    />
  )

  const renderEmptyComponent = () => {
    return (
      <EmptyState
        testID='empty-state-workspace'
        Icon={Icons.IcEmptyStateWorkspace}
        title={t('no_apps_available')}
        subtitle={t('no_apps_installed')}
      />
    )
  }

  const handleRefresh = async () => {
    await fetchProfile()
    await fetchNotificationCount({})
    await fetchRequestOrderReasons()
    await fetchRelocationOrderReasons()
  }

  const onPressHome = (item: Workspace) => {
    if (item.key === ProgramWasteManagement.key) {
      showError(t('in_development_message'))
      return
    }
    dispatch(setSelectedWorkspace(item))
    dispatch(setProgramColor(item.config.color))
    navigation.navigate('Home')
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <HeaderEntity />
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t('search_program_name')}
        containerClassName='bg-white px-4 py-3 border-b border-b-quillGrey'
      />
      <FlatList
        data={filteredProgram}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerClassName='p-4 gap-y-4 flex-grow'
        columnWrapperClassName='gap-x-3'
        numColumns={3}
        refreshControl={
          <RefreshControl
            refreshing={isLoadProfile}
            onRefresh={handleRefresh}
            colors={[colors.bluePrimary]}
          />
        }
        {...getTestID('flatlist-workspaces')}
      />
      <LoadingDialog
        testID='loadingdialog-load-profile'
        modalVisible={isLoadProfile}
      />
    </SafeAreaView>
  )
}
