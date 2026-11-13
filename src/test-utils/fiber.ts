// Pengganti screen.UNSAFE_root / UNSAFE_getByProps yang dihapus di RNTL 14.
// Pohon test-renderer v14 hanya berisi host element, jadi props komponen
// komposit (mis. onEndReached milik FlatList) dibaca dari fiber-nya.
type FiberLike = {
  memoizedProps?: Record<string, any> | null
  child?: FiberLike | null
  sibling?: FiberLike | null
}

export type PropsNode = { props: Record<string, any> }

export const fiberFindAll = (
  screen: { root: any },
  predicate: (node: PropsNode) => boolean
): PropsNode[] => {
  const out: PropsNode[] = []
  const walk = (fiber: FiberLike | null | undefined) => {
    for (let f = fiber; f; f = f.sibling) {
      const props = f.memoizedProps
      if (props && typeof props === 'object' && predicate({ props })) {
        out.push({ props })
      }
      walk(f.child)
    }
  }
  walk(screen.root?.unstable_fiber)
  return out
}

export const fiberGetByProps = (
  screen: { root: any },
  match: Record<string, any>
): PropsNode => {
  const found = fiberFindAll(screen, (n) =>
    Object.entries(match).every(([k, v]) => n.props[k] === v)
  )
  if (found.length === 0) {
    throw new Error(`No fiber with props ${JSON.stringify(match)}`)
  }
  return found[0]
}
