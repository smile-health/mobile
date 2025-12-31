import { useNavigation } from '@react-navigation/native'
import { Icons } from '@/assets/icons'
import { ImageButtonProps } from '@/components/buttons'
import { PopupMenuProps } from '@/components/menu/PopupMenu'
import { useLanguage } from '@/i18n/useLanguage'
import { AppDataType } from '@/models'
import { useLazyGetMaterialsQuery } from '@/services/apis'
import { useLazyGetCVAQuery } from '@/services/apis/cva.api'
import { useAppSelector, workspaceState } from '@/services/store'
import { getTestID, showSuccess } from '@/utils/CommonUtils'
import { DATA_TYPES } from '@/utils/Constants'

export const useAppDataAction = (
  type: AppDataType,
  onRefresh?: () => void,
  isLoading?: boolean
) => {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  const { t } = useLanguage()
  const navigation = useNavigation()

  const data = [{ label: t('common.home'), key: 'common.home' }]

  const [refreshCVA, { isLoading: cvaLoading, isFetching: isRefreshCVA }] =
    useLazyGetCVAQuery()
  const [
    refreshMaterial,
    { isLoading: materialsLoading, isFetching: isRefreshMaterial },
  ] = useLazyGetMaterialsQuery()

  const showLoading = [
    cvaLoading,
    materialsLoading,
    isRefreshCVA,
    isRefreshMaterial,
    isLoading,
  ].some(Boolean)

  const refreshActions = {
    [DATA_TYPES.CVA]: (programId: number) => refreshCVA(programId),
    [DATA_TYPES.MATERIAL]: (programId: number) => refreshMaterial(programId),
  }

  const handleNavigation = () => navigation.navigate('Home')

  const handleRefreshList = async () => {
    if (!selectedWorkspace) return

    const runSuccess = () => {
      showSuccess(t('common.success_update_data'), 'snackbar-success-add-order')
    }

    if (onRefresh) {
      onRefresh()
      runSuccess()
      return
    }
    const action = refreshActions[type]
    if (action) {
      await action(selectedWorkspace.id)
      runSuccess()
    }
  }
  const toolbarActions: ImageButtonProps[] = [
    {
      Icon: Icons.IcRefresh,
      onPress: handleRefreshList,
      ...getTestID('btn-toolbar-refresh'),
    },
  ]

  return {
    showLoading,
    toolbarActions,
    popupProps: {
      data,
      labelField: 'label',
      containerClassName: 'right-0 mr-2 w-1/4',
      itemContainerClassName: 'px-4 py-2',
      onPressItem: handleNavigation,
    } as Omit<
      PopupMenuProps<{
        label: string
        key: string
      }>,
      'dismissDialog' | 'modalVisible'
    >,
  }
}
