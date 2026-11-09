import { emptyListFixture, listFixture } from './fixtures'

type Mode = 'data' | 'empty' | 'loading' | 'error'
let mode: Mode = 'data'
export const setRtkMode = (m: Mode) => {
  mode = m
}

const unwrapResult = () => Promise.resolve({ data: [], id: 1 })
export const mutationFn = jest.fn(() => {
  const p: any = Promise.resolve({ data: { id: 1 } })
  p.unwrap = unwrapResult
  return p
})

// Referensi stabil: komponen yang memakai `data` di dependency useEffect
// tidak boleh melihat objek baru di tiap render (infinite loop).
const refetch = jest.fn()
const dataFx = listFixture()
const emptyFx = emptyListFixture()
const states = {
  data: { data: dataFx, isLoading: false, isFetching: false, isSuccess: true, isError: false, refetch },
  empty: { data: emptyFx, isLoading: false, isFetching: false, isSuccess: true, isError: false, refetch },
  loading: { data: undefined, isLoading: true, isFetching: true, isSuccess: false, isError: false, refetch },
  error: { data: undefined, error: { status: 500 }, isLoading: false, isFetching: false, isSuccess: false, isError: true, refetch },
}
const queryState = () => states[mode]

const lazyResult = { data: dataFx, isSuccess: true }
const lazyTriggerFn = jest.fn(() => {
  const p: any = Promise.resolve(lazyResult)
  p.unwrap = () => Promise.resolve(dataFx)
  return p
})
const mutationTuple = [mutationFn, { isLoading: false, isSuccess: false }]

/** Ganti semua hook useXxxQuery/Mutation dari modul api dengan stub. */
export const wrapApiModule = (actual: Record<string, any>) => {
  const out: Record<string, any> = { ...actual }
  for (const key of Object.keys(actual)) {
    if (/^useLazy.*Query$/.test(key)) {
      out[key] = () => [lazyTriggerFn, queryState()]
    } else if (/^use.*Query$/.test(key)) {
      out[key] = () => queryState()
    } else if (/^use.*Mutation$/.test(key)) {
      out[key] = () => mutationTuple
    }
  }
  return out
}
