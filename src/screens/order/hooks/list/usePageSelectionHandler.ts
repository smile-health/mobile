import { useCallback, useRef } from 'react'
import { PagerViewOnPageSelectedEvent } from 'react-native-pager-view'
import { setOrderFilter } from '@/services/features/order.slice'
import { OrderStatusRef } from '../../component/OrderFilter'
import { getOrderStatusFromIndex } from '../../helpers/OrderHelpers'

const PAGE_CHANGE_THROTTLE = 300
const DISPATCH_DELAY = 50

export const usePageSelectionHandler = (
  dispatch: any,
  setActiveTab: React.Dispatch<React.SetStateAction<number>>,
  tabRef: React.RefObject<OrderStatusRef>
) => {
  const lastPageChangeRef = useRef(0)
  const pageProcessingRef = useRef(false)

  const executePageChange = useCallback(
    (index: number, orderStatusValue: any) => {
      const updatePageState = () => {
        dispatch(setOrderFilter({ status: orderStatusValue }))
        setActiveTab(index)
        tabRef.current?.scrollToIndex({ animated: true, index })

        setTimeout(() => {
          pageProcessingRef.current = false
        }, PAGE_CHANGE_THROTTLE)
      }

      requestAnimationFrame(updatePageState)
    },
    [dispatch, setActiveTab, tabRef]
  )

  const handlePageSelection = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      const now = Date.now()

      if (
        now - lastPageChangeRef.current < PAGE_CHANGE_THROTTLE ||
        pageProcessingRef.current
      ) {
        return
      }

      lastPageChangeRef.current = now
      pageProcessingRef.current = true

      const { position: index } = event.nativeEvent
      const orderStatusValue = getOrderStatusFromIndex(index)

      setTimeout(
        () => executePageChange(index, orderStatusValue),
        DISPATCH_DELAY
      )
    },
    [executePageChange]
  )

  return handlePageSelection
}
