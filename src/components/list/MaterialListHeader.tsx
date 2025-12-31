import React, { useState } from 'react'
import { Control } from 'react-hook-form'
import { useLanguage } from '@/i18n/useLanguage'
import { MATERIAL_LIST_TYPE } from '@/utils/Constants'
import ListTitle from './ListTitle'
import MaterialInfoModal from './MaterialInfoModal'
import { MaterialListType } from './MaterialList'
import { SearchField } from '../forms'

interface Props {
  control: Control<any>
  itemCount: number
  title?: string
  onSearch?: (text: string) => void
  type?: MaterialListType
}

function MaterialListHeader({
  control,
  itemCount,
  title,
  type = MATERIAL_LIST_TYPE.NORMAL,
  onSearch,
}: Readonly<Props>) {
  const [isOpenInfoModal, setIsOpenInfoModal] = useState(false)
  const { t } = useLanguage()

  const handleOpenInfoModal = () => {
    setIsOpenInfoModal(true)
  }

  const handleCloseInfoModal = () => {
    setIsOpenInfoModal(false)
  }

  return (
    <React.Fragment>
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t('search_material_name')}
        containerClassName='bg-white px-4 py-2 border-b border-b-whiteTwo'
        {...(onSearch && { onChangeText: onSearch })}
      />
      <ListTitle
        title={title ?? t('label.material_list')}
        itemCount={itemCount}
        withInfoIcon
        onPressInfo={handleOpenInfoModal}
      />
      <MaterialInfoModal
        type={type}
        isOpen={isOpenInfoModal}
        onClose={handleCloseInfoModal}
      />
    </React.Fragment>
  )
}

export default React.memo(MaterialListHeader)
