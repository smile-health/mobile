export const getNextPageParam = (lastPage, _allPages, lastPageParam) => {
  const nextPage = (lastPageParam.page || 0) + 1
  const remainingPages = lastPage?.total_page - nextPage

  if (remainingPages < 0) return

  return {
    ...lastPageParam,
    page: nextPage,
  }
}
