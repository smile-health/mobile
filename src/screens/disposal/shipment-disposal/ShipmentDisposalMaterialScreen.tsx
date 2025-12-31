import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { Icons } from '@/assets/icons'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import { AppStackScreenProps } from '@/navigators'
import DisposalMaterialList from '../components/DisposalMaterialList'
import DisposalShipmentHeader from '../components/DisposalShipmentHeader'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useDisposalMaterial from '../hooks/useDisposalMaterial'

interface Props extends AppStackScreenProps<'SelfDisposalMaterial'> {}

export default function ShipmentDisposalMaterialScreen({ navigation }: Props) {
  const { t } = useLanguage()
  const {
    data,
    totalItems,
    control,
    disposal,
    isFetching,
    shouldShowFooter,
    refetch,
    handleLoadMore,
    deleteAllDisposal,
    setDisposalMaterial,
  } = useDisposalMaterial(DISPOSAL_TYPE.SHIPMENT)

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const openDeleteAllDialog = () => setShowDeleteAllDialog(true)
  const dismissDeleteAllDialog = () => setShowDeleteAllDialog(false)

  const onMaterialSelected = useCallback(
    (material: DisposalStockItemResponse) => {
      setDisposalMaterial(material)
      navigation.navigate('CreateDisposalShipmentMaterial')
    },
    [navigation, setDisposalMaterial]
  )

  const handleDeleteDisposalShipment = () => {
    deleteAllDisposal()
    dismissDeleteAllDialog()
  }

  const handleNavigateToReview = () => {
    navigation.navigate('ReviewDisposalShipment')
  }

  useToolbar({
    title: t('home.menu.create_disposal'),
    actions: <RefreshHomeAction onRefresh={refetch} />,
  })

  useEffect(() => {
    return () => {
      deleteAllDisposal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='flex-1 bg-white'>
      <DisposalShipmentHeader t={t} />
      <DisposalMaterialList
        control={control}
        data={data}
        totalItems={totalItems}
        disposal={disposal}
        onSelectMaterial={onMaterialSelected}
        onEndReached={handleLoadMore}
        isFetching={isFetching}
        type={DISPOSAL_TYPE.SHIPMENT}
      />

      {shouldShowFooter && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            onPress: handleNavigateToReview,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-review-disposal-shipment',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: openDeleteAllDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-disposal-shipment',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: showDeleteAllDialog,
            onCancel: dismissDeleteAllDialog,
            onConfirm: handleDeleteDisposalShipment,
          }}
        />
      )}
    </View>
  )
}
