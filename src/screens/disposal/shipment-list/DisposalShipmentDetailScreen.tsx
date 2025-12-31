import React, { useCallback } from 'react'
import { SectionList, View, Text } from 'react-native'
import { Button } from '@/components/buttons'
import { ActivityHeader } from '@/components/header/ActivityHeader'
import ListTitle from '@/components/list/ListTitle'
import LoadingDialog from '@/components/LoadingDialog'
import { RefreshHomeAction } from '@/components/toolbar/actions/RefreshHomeAction'
import { useToolbar } from '@/components/toolbar/hooks/useToolbar'
import { AppStackScreenProps } from '@/navigators'
import AppStyles from '@/theme/AppStyles'
import colors from '@/theme/colors'
import { getTestID } from '@/utils/CommonUtils'
import DisposalCommentItem from '../components/shipment-list/DisposalCommentItem'
import DisposalShipmentDetailHeader from '../components/shipment-list/DisposalShipmentDetailHeader'
import DisposalShipmentDetailItem from '../components/shipment-list/DisposalShipmentDetailItem'
import DisposalShipmentStatus from '../components/shipment-list/DisposalShipmentStatus'
import ShipmentWarningBox from '../components/shipment-list/ShipmentWarningBox'
import { DISPOSAL_STATUS } from '../disposal-constant'
import useDisposalShipmentDetail from '../hooks/useDisposalShipmentDetail'

interface Props extends AppStackScreenProps<'DisposalShipmentDetail'> {}

const SectionTitle = ({ section, t }) => {
  if (section.key === 'items') {
    return (
      <ListTitle title={t(section.title)} itemCount={section.data.length} />
    )
  }
  return (
    <View className='p-4'>
      <Text className={AppStyles.textBold}>
        {`${t(section.title)} (${section.data.length})`}
      </Text>
    </View>
  )
}

export default function DisposalShipmentDetailScreen({ route }: Props) {
  const {
    t,
    data,
    sections,
    actionConfig,
    isShipped,
    isLoading,
    isSender,
    refetch,
    handlePressItem,
    handleActionButton,
  } = useDisposalShipmentDetail(route.params)

  const renderHeader = useCallback(() => {
    if (!data) return null
    return <DisposalShipmentDetailHeader data={data} />
  }, [data])

  const renderSectionHeader = useCallback(
    ({ section }) => {
      return (
        <View className='bg-white'>
          <View className='h-2 bg-lightBlueGray' />
          <SectionTitle section={section} t={t} />
        </View>
      )
    },
    [t]
  )

  const renderItem = useCallback(
    ({ item, section }) => {
      switch (section.key) {
        case 'items': {
          return (
            <DisposalShipmentDetailItem
              item={item}
              onPressDetail={handlePressItem}
            />
          )
        }
        case 'comments': {
          return <DisposalCommentItem item={item} />
        }
        default: {
          return null
        }
      }
    },
    [handlePressItem]
  )

  const renderFooter = useCallback(() => {
    if (isSender || data?.status !== DISPOSAL_STATUS.SHIPPED) return null
    return (
      <>
        <View className='h-2 bg-lightBlueGray' />
        <ShipmentWarningBox />
      </>
    )
  }, [isSender, data?.status])

  useToolbar({
    title: t('disposal.disposal_shipment'),
    actions: <RefreshHomeAction onRefresh={refetch} />,
  })

  return (
    <View className='flex-1 bg-lightBlueGray'>
      <ActivityHeader name={data?.activity.name} />
      <DisposalShipmentStatus
        status={data?.status}
        updatedAt={data?.updated_at}
        t={t}
      />
      <SectionList
        sections={sections}
        renderItem={renderItem}
        ListHeaderComponent={renderHeader}
        renderSectionHeader={renderSectionHeader}
        ListFooterComponent={renderFooter}
        stickySectionHeadersEnabled={false}
      />
      {isShipped && (
        <View className='p-4 bg-white border-t border-quillGrey'>
          <Button
            preset={actionConfig.buttonPreset}
            text={t(actionConfig.buttonText)}
            LeftIcon={actionConfig.Icon}
            containerClassName='gap-x-2'
            leftIconColor={colors.mainText()}
            onPress={handleActionButton}
            {...getTestID(actionConfig.testID)}
          />
        </View>
      )}
      <LoadingDialog
        modalVisible={isLoading}
        testID='loadingdialog-disposal-shipment-detail'
      />
    </View>
  )
}
