// Single entry that groups the PropertyState provider and its hook. Import
// from '@/contexts/PropertyState' if you want both from one place without
// modifying the component-only entrypoint used for fast-refresh.

// Use correct direct imports to avoid circular dependencies
export { PropertyStateProvider } from './PropertyStateContext'
export { usePropertyState } from './property-state-hook'
