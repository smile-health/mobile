import React, { useCallback } from 'react'
import { FlatList, ListRenderItem } from 'react-native'
import { useTranslation } from 'react-i18next'
import CircularLoadingIndicator from '@/components/CircularLoadingIndicator'
import ListTitle from '@/components/list/ListTitle'
import { DisposalMethod } from '@/models/disposal/DisposalMethod'
import DisposalMethodItem from './DisposalMethodItem'

interface DisposalMethodListProps {
  data: DisposalMethod[]
  onPressMethod: (method: DisposalMethod) => void
  isLoading: boolean
}

export default function DisposalMethodList({
  data,
  onPressMethod,
  isLoading,
}: Readonly<DisposalMethodListProps>) {
  const { t } = useTranslation()

  const renderItem: ListRenderItem<DisposalMethod> = useCallback(
    ({ item }) => (
      <DisposalMethodItem
        name={item.title}
        onPress={() => onPressMethod(item)}
      />
    ),
    [onPressMethod]
  )

  const renderHeader = useCallback(() => {
    if (isLoading) return null

    return <ListTitle title={t('disposal.method')} itemCount={data.length} />
  }, [data.length, t, isLoading])

  const renderFooter = useCallback(() => {
    if (!isLoading) return null

    return <CircularLoadingIndicator />
  }, [isLoading])

  const keyExtractor = useCallback((item: DisposalMethod) => item.id, [])

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      className='flex-1'
      contentContainerClassName='gap-2'
    />
  )
}
