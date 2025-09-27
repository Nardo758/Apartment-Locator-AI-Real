import { PropertyStateProvider } from './PropertyStateProvider'
import { usePropertyState } from './property-state-hook'

// Single entry that groups the PropertyState provider and its hook. Import
// from '@/contexts/PropertyState' if you want both from one place without
// modifying the component-only entrypoint used for fast-refresh.

export { PropertyStateProvider, usePropertyState }
