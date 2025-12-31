import React from 'react'
import { View } from 'react-native'
import { Icons } from '@/assets/icons'
import EntityActivityHeader from '@/components/header/EntityActivityHeader'
import MaterialList from '@/components/list/MaterialList'
import ScreenFooterActions from '@/components/view/ScreenFooterActions'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackScreenProps } from '@/navigators'
import { MaterialInfo } from '@/screens/shared/component/MaterialInfo'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import useRelocationTrademark from '../hooks/relocation/useRelocationTrademark'

interface Props extends AppStackScreenProps<'RelocationTrademarkMaterial'> {}

export default function RelocationTrademarkMaterialScreen({ route }: Props) {
  const data = route.params?.material

  const {
    activity,
    vendor,
    relocations,
    isHierarchy,
    materialHierarchy,
    hasRelocationHierarchy,
    handlePressTrademarkMaterial,
    handleSave,
    dialogVisible,
    toggleDialog,
    handleDeleteAll,
  } = useRelocationTrademark({ data })

  const { t } = useLanguage()

  return (
    <View className='bg-white flex-1'>
      <EntityActivityHeader
        activityName={activity.name}
        entityLabel='label.vendor'
        entityName={vendor?.name}
      />

      <MaterialInfo
        data={data}
        qtyMaterial={data.total_qty}
        currentMinMax={data.activityMinMax}
        isHierarchy={isHierarchy}
      />

      <MaterialList
        type={MATERIAL_LIST_TYPE.NORMAL}
        data={materialHierarchy}
        orders={relocations}
        onPressMaterial={handlePressTrademarkMaterial}
      />

      {hasRelocationHierarchy && (
        <ScreenFooterActions
          primaryAction={{
            text: t('button.save'),
            onPress: handleSave,
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
    </View>
  )
}
