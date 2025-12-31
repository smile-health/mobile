import React, { useState } from 'react'
import { SafeAreaView } from 'react-native'
import LoadingDialog from '@/components/LoadingDialog'
import { SearchToolbarAction } from '@/components/toolbar/actions/SearchToolbarAction'
import { useSearchBar } from '@/components/toolbar/hooks/useSearchBar'
import { useLanguage } from '@/i18n/useLanguage'
import { IOptions } from '@/models/Common'
import AssetFilter from './component/AssetFilter'
import AssetInventoryList from './component/AssetInventoryList'
import { useAssetInventoryList } from './hooks/useAssetInventoryList'
import { useAssetOptions } from './hooks/useAssetOptions'

export default function ViewAssetInventoryScreen() {
  const { workingStatusFilterOptions } = useAssetOptions()

  const [searchText, setSearchText] = useState('')
  const [filter, setFilter] = useState<number | null>(0)

  const { t } = useLanguage()

  const {
    assetList,
    loadMore,
    refresh,
    page,
    shouldShowLoading,
    isSearch,
    setIsSearch,
    toggleSearch,
  } = useAssetInventoryList({
    searchText,
    statusId: filter,
  })

  const onSubmitSearch = (text: string) => {
    setSearchText(text)
  }

  const handleApplyFilter = (item: IOptions) => {
    setFilter(item.value)
  }

  const handleResetFilter = () => {
    setFilter(0)
  }

  useSearchBar({
    isSearch,
    setIsSearch,
    onSubmitSearch,
    placeholder: t('asset.search_placeholder'),
    keyboardType: 'default',
    toolbarProps: {
      title: t('home.menu.view_asset_inventory'),
      withDefaultSubtitle: true,
      actions: (
        <SearchToolbarAction onSearch={toggleSearch} onRefresh={refresh} />
      ),
    },
  })

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <AssetFilter
        statusId={filter}
        data={workingStatusFilterOptions}
        onResetFilter={handleResetFilter}
        onApplyFilter={handleApplyFilter}
      />
      <AssetInventoryList
        data={assetList}
        isLoading={shouldShowLoading && page > 1}
        onEndReached={loadMore}
        refresh={refresh}
      />
      <LoadingDialog
        modalVisible={shouldShowLoading && page === 1}
        testID='loading-dialog-asset-inventory-list'
      />
    </SafeAreaView>
  )
}
