import React from 'react'
import { View, Text } from 'react-native'
import { Control } from 'react-hook-form'
import { SearchField } from '@/components/forms'
import ListTitle from '@/components/list/ListTitle'
import { useLanguage } from '@/i18n/useLanguage'
import AppStyles from '@/theme/AppStyles'
import StockTakingMaterialItem from './StockTakingMaterialItem'

interface Props {
  control: Control<any>
  itemCount: number
  onSearch?: (text: string) => void
  title?: string
  parentMaterial?: {
    name: string
    remainingQty: number
    isMandatory?: boolean
  }
}

const StockTakingMaterialListHeader = ({
  control,
  itemCount,
  title,
  onSearch,
  parentMaterial,
}: Readonly<Props>) => {
  const { t } = useLanguage()

  return (
    <React.Fragment>
      {parentMaterial && (
        <View className='p-4 bg-lightGrey gap-y-1 border-b border-quillGrey'>
          <Text className={AppStyles.textBold}>
            {t('label.active_ingredient_material')}
          </Text>
          <StockTakingMaterialItem className='mx-0 mb-0' {...parentMaterial} />
        </View>
      )}
      <SearchField
        testID='search-field-name'
        control={control}
        name='name'
        placeholder={t('search_material_name')}
        containerClassName='bg-white px-4 py-2 border-b border-quillGrey'
        {...(onSearch && { onChangeText: onSearch })}
      />
      <ListTitle title={title ?? ''} itemCount={itemCount} />
    </React.Fragment>
  )
}

export default React.memo(StockTakingMaterialListHeader)
