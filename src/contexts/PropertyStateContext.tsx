import { PropertyStateProvider } from './PropertyStateProvider'

// Component-only entrypoint to preserve fast-refresh behavior during development.
// Hooks and helper re-exports live in `src/contexts/index.ts` so consumer code can
// import both from '@/contexts' without exposing non-component symbols here.

export { PropertyStateProvider };