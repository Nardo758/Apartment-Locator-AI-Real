import { createContext } from 'react'
import { PropertyStateContextType } from './PropertyStateContextTypes'

export const PropertyStateContext = createContext<PropertyStateContextType | undefined>(undefined)
