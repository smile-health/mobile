import { useAppSelector, workspaceState } from '@/services/store'

const useProgramId = (): number => {
  const { selectedWorkspace } = useAppSelector(workspaceState)
  return Number(selectedWorkspace?.id)
}

export default useProgramId
