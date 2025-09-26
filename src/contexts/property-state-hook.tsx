import { useContext } from 'react'
import { PropertyStateContext } from './property-state-context'
import { PropertyStateContextType } from './PropertyStateContextTypes'

export const usePropertyState = () => {
  const context = useContext<PropertyStateContextType | undefined>(PropertyStateContext)
  if (context === undefined) {
    throw new Error('usePropertyState must be used within a PropertyStateProvider')
  }
  return context
}
