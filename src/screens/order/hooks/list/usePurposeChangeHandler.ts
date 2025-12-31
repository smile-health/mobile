import React, { useCallback, useRef } from 'react'
import PagerView from 'react-native-pager-view'

const TAB_CHANGE_DEBOUNCE = 150

export const useTabChangeHandler = (
  pagerViewRef: React.RefObject<PagerView>,
  setActiveTab: React.Dispatch<React.SetStateAction<number>>
) => {
  const tabChangeTimeoutRef = useRef<NodeJS.Timeout>()

  const handleTabChange = useCallback(
    (statusId: number | null = null) => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current)
      }

      tabChangeTimeoutRef.current = setTimeout(() => {
        const targetIndex = statusId ?? 0

        requestAnimationFrame(() => {
          setActiveTab(targetIndex)
          pagerViewRef.current?.setPage(targetIndex)
        })
      }, TAB_CHANGE_DEBOUNCE)
    },
    [pagerViewRef, setActiveTab]
  )

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (tabChangeTimeoutRef.current) {
        clearTimeout(tabChangeTimeoutRef.current)
      }
    }
  }, [])

  return handleTabChange
}
