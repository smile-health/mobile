import React, {
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
  useState,
} from 'react'
import { View, FlatList, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { Button } from '@/components/buttons'
import { ConfirmationDialog } from '@/components/dialog/ConfirmationDialog'
import LoadingDialog from '@/components/LoadingDialog'
import { useLanguage } from '@/i18n/useLanguage'
import { AppStackParamList } from '@/navigators'
import { getReasons } from '@/services/features'
import { setIgnoreConfirm } from '@/services/features/ticketReason.slice'
import { useAppSelector, useAppDispatch } from '@/services/store'
import { TICKET_STATUS } from '@/utils/Constants'
import { TicketCommentSection } from './components/TicketCommentSection'
import ReviewTicketItem from '../component/ticket/ReviewTicketItem'
import TicketDetailHeader from '../component/ticket/TicketDetailHeader'
import {
  mapItemsToTicketMaterials,
  useTicketDetail,
} from '../hooks/useTicketDetail'

const TicketDetailScreen = ({
  route,
}: NativeStackScreenProps<AppStackParamList, 'TicketDetail'>) => {
  const { t } = useLanguage()
  const { id } = route.params
  const dispatch = useAppDispatch()
  const navigation = useNavigation()
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)

  const reasonOptions = useAppSelector(getReasons)

  useLayoutEffect(() => {
    dispatch(setIgnoreConfirm(true))
    return () => {
      dispatch(setIgnoreConfirm(false))
    }
  }, [dispatch])

  const {
    ticketDetail,
    isLoading,
    refetch,
    handleViewOrderDetail,
    handleViewPackingSlip,
    handleChangeStatus,
    buttonVisibility,
    isUpdating,
  } = useTicketDetail(id)

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleCancel = useCallback(() => {
    navigation.navigate('CancelReport', { ticketId: id })
  }, [navigation, id])

  const handleCompletePress = useCallback(() => {
    setShowCompleteDialog(true)
  }, [])

  const handleConfirmComplete = useCallback(() => {
    handleChangeStatus(TICKET_STATUS.COMPLETED)
    setShowCompleteDialog(false)
  }, [handleChangeStatus])

  const renderTicketDetailHeader = useCallback(() => {
    if (!ticketDetail) return null

    return (
      <TicketDetailHeader
        ticketDetail={ticketDetail}
        t={t}
        onViewOrderDetail={handleViewOrderDetail}
        onViewPackingSlip={handleViewPackingSlip}
      />
    )
  }, [t, ticketDetail, handleViewOrderDetail, handleViewPackingSlip])

  const renderItem = useCallback(
    ({ item }) => (
      <ReviewTicketItem item={item} t={t} reasonOptions={reasonOptions} />
    ),
    [reasonOptions, t]
  )

  const keyExtractor = useCallback((item) => `detail-${item.id.toString()}`, [])

  const CommentsSection = useMemo(() => {
    if (!ticketDetail) return null
    return <TicketCommentSection comments={ticketDetail.comments ?? []} />
  }, [ticketDetail])

  const renderBottomButtons = useMemo(() => {
    const { showCancel, showComplete } = buttonVisibility

    if (!showCancel && !showComplete) return null

    return (
      <View className='flex-row justify-between border-t border-quillGrey items-center p-4 gap-x-2'>
        {showCancel && (
          <View className='flex-1'>
            <Button
              preset='outlined'
              text={t('button.cancel_ticket')}
              onPress={handleCancel}
              disabled={isUpdating}
            />
          </View>
        )}
        {showComplete && (
          <View className='flex-1'>
            <Button
              preset='filled'
              text={t('button.complete_ticket')}
              onPress={handleCompletePress}
              disabled={isUpdating}
            />
          </View>
        )}
      </View>
    )
  }, [buttonVisibility, t, handleCancel, handleCompletePress, isUpdating])

  return (
    <View className='flex-1 bg-white'>
      <ScrollView className='flex-1'>
        {renderTicketDetailHeader()}

        <FlatList
          data={mapItemsToTicketMaterials(ticketDetail?.items ?? [])}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          scrollEnabled={false}
        />
        {CommentsSection}
      </ScrollView>

      {renderBottomButtons}

      <LoadingDialog
        modalVisible={isLoading || isUpdating}
        testID='loadingdialog-detail-data'
      />

      <ConfirmationDialog
        modalVisible={showCompleteDialog}
        title={t('dialog.complete_ticket')}
        message={t('dialog.confirmation_complete_ticket')}
        confirmText={t('button.yes')}
        cancelText={t('button.cancel')}
        onConfirm={handleConfirmComplete}
        onCancel={() => setShowCompleteDialog(false)}
        dismissDialog={() => setShowCompleteDialog(false)}
      />
    </View>
  )
}

TicketDetailScreen.displayName = 'TicketDetailScreen'

export default React.memo(TicketDetailScreen)
