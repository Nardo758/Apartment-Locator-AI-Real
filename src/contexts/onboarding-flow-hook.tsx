import { useContext } from 'react'
import { OnboardingFlowContext } from './onboarding-flow-context'
import { OnboardingFlowContextType } from './onboarding-flow-utils'

export const useOnboardingFlow = () => {
  const context = useContext<OnboardingFlowContextType | null>(OnboardingFlowContext)
  if (!context) {
    throw new Error('useOnboardingFlow must be used within OnboardingFlowProvider')
  }
  return context
}
