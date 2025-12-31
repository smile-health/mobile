import * as React from 'react'
interface Element {
  name: string
  component: React.ReactNode
}
interface PortalContextProps {
  addComponent: (element: Element) => void
  removeComponent: (name: string) => void
}
const PortalContext = React.createContext<PortalContextProps>({
  addComponent: () => {},
  removeComponent: () => {},
})
export default PortalContext
