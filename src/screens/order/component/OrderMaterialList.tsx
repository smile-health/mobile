import React from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import HeaderMaterial from '@/components/header/HeaderMaterial'
import MaterialList, { MaterialListType } from '@/components/list/MaterialList'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'

interface HeaderItem {
  label: string
  value: string | undefined
}

interface OrderMaterialListProps {
  headerItems: HeaderItem[]
  materials: any[]
  orders: any[]
  isLoading?: boolean
  loadingTestId?: string
  onPressMaterial: (item: any) => void
  onNavigateToReview: () => void
  onDeleteAll: () => void
  LoadingComponent?: React.ReactNode
  type?: MaterialListType
}

export default function OrderMaterialList({
  headerItems,
  materials,
  orders,
  onPressMaterial,
  onNavigateToReview,
  onDeleteAll,
  LoadingComponent,
  type,
}: Readonly<OrderMaterialListProps>) {
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const { t } = useLanguage()

  const hasOrder = orders?.length > 0

  const toggleDialog = () => {
    setDialogVisible(!dialogVisible)
  }

  const handleDeleteAll = () => {
    onDeleteAll()
    setDialogVisible(false)
  }

  return (
    <View className='flex flex-1 bg-white'>
      <HeaderMaterial items={headerItems} />
      <MaterialList
        type={type}
        data={materials}
        onPressMaterial={onPressMaterial}
        orders={orders}
      />
      {hasOrder && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            onPress: onNavigateToReview,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-navigate-review-order',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: toggleDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-all-order',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: dialogVisible,
            onConfirm: handleDeleteAll,
            onCancel: toggleDialog,
          }}
        />
      )}

      {LoadingComponent}
    </View>
  )
}
