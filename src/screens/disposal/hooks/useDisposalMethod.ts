import { useCallback } from 'react'
import { DisposalMethod } from '@/models/disposal/DisposalMethod'
import { useGetDisposalMethodsQuery } from '@/services/apis'
import { setDisposalMethod } from '@/services/features'
import { disposalState, useAppDispatch, useAppSelector } from '@/services/store'

export default function useDisposalMethod() {
  const dispatch = useAppDispatch()
  const { data = [], isLoading } = useGetDisposalMethodsQuery()
  const { activity } = useAppSelector(disposalState)

  const saveDisposalMethod = useCallback(
    (item: DisposalMethod) => {
      dispatch(setDisposalMethod(item))
    },
    [dispatch]
  )

  return {
    methods: data,
    isLoading,
    activity,
    saveDisposalMethod,
  }
}
