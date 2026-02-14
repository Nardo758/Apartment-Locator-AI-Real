/**
 * User Data Engine Exports
 * Central service layer for all user data
 */

export { UserDataEngine } from './userDataEngine';
export type { UserType, BaseUserData, DataEngineOptions } from './userDataEngine';

export { RenterDataEngine } from './renterDataEngine';
export type {
  RenterData,
  POI,
  RenterPreferences,
  CommuteSettings,
  SearchHistory,
} from './renterDataEngine';

export { LandlordDataEngine } from './landlordDataEngine';
export type {
  LandlordData,
  LandlordProperty,
  PortfolioMetrics,
  PricingSettings,
  LandlordAlert,
} from './landlordDataEngine';

export { AgentDataEngine } from './agentDataEngine';
export type {
  AgentData,
  AgentClient,
  AgentDeal,
  AgentCommission,
  AgentPipeline,
  AgentStats,
} from './agentDataEngine';
