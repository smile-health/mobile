import React, { useCallback, useEffect, useState } from 'react'
import { View } from 'react-native'

import { Icons } from '@/assets/icons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { DisposalStockItemResponse } from '@/models/disposal/DisposalStock'
import { AppStackScreenProps } from '@/navigators'
import DisposalMaterialList from '../components/DisposalMaterialList'
import { DISPOSAL_TYPE } from '../disposal-constant'
import useDisposalMaterial from '../hooks/useDisposalMaterial'

interface Props extends AppStackScreenProps<'SelfDisposalMaterial'> {}

export default function SelfDisposalMaterialScreen({ navigation }: Props) {
  const { t } = useLanguage()
  const {
    activity,
    data,
    control,
    totalItems,
    disposal,
    isFetching,
    shouldShowFooter,
    handleLoadMore,
    setDisposalMaterial,
    deleteAllDisposal,
  } = useDisposalMaterial()

  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)

  const openDeleteAllDialog = () => {
    setShowDeleteAllDialog(true)
  }

  const dismissDeleteAllDialog = () => {
    setShowDeleteAllDialog(false)
  }

  const onMaterialSelected = useCallback(
    (material: DisposalStockItemResponse) => {
      setDisposalMaterial(material)
      navigation.navigate('CreateSelfDisposalMaterial')
    },
    [navigation, setDisposalMaterial]
  )

  const handleDeleteSelfDisposal = () => {
    deleteAllDisposal()
    dismissDeleteAllDialog()
  }

  const handleNavigateToReview = () => {
    navigation.navigate('ReviewSelfDisposal')
  }

  useEffect(() => {
    return () => {
      deleteAllDisposal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View className='flex-1 bg-white'>
      <ActivityHeader name={activity.name} />
      <DisposalMaterialList
        data={data}
        disposal={disposal}
        totalItems={totalItems}
        onEndReached={handleLoadMore}
        isFetching={isFetching}
        onSelectMaterial={onMaterialSelected}
        control={control}
        type={DISPOSAL_TYPE.SELF}
      />

      {shouldShowFooter && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.review'),
            onPress: handleNavigateToReview,
            LeftIcon: Icons.IcArrowForward,
            testID: 'btn-navigate-to-review',
          }}
          secondaryAction={{
            text: t('button.delete_all'),
            onPress: openDeleteAllDialog,
            LeftIcon: Icons.IcDelete,
            testID: 'btn-delete-self-disposal',
          }}
          confirmationDialog={{
            title: t('dialog.delete_all_item'),
            message: t('dialog.delete_all'),
            isVisible: showDeleteAllDialog,
            onConfirm: handleDeleteSelfDisposal,
            onCancel: dismissDeleteAllDialog,
          }}
        />
      )}
    </View>
  )
}
