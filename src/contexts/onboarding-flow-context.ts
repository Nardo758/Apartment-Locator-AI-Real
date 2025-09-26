import { createContext } from 'react'
import { OnboardingFlowContextType } from './onboarding-flow-utils'

export const OnboardingFlowContext = createContext<OnboardingFlowContextType | null>(null)
