import { UserDataEngine } from './userDataEngine';

export interface LandlordData {
  portfolio: {
    totalUnits: number;
    occupiedUnits: number;
    propertyIds: string[];
  };
  settings: {
    defaultLeaseTermMonths: number;
    renewalNoticeDays: number;
    autoAlerts: boolean;
    alertEmail: string;
  };
  market: {
    targetCity: string;
    targetState: string;
    submarkets: string[];
  };
  retentionGoals: {
    targetRetentionRate: number;
    maxAcceptableVacancyDays: number;
    renewalIncentiveBudget: number;
  };
  notifications: {
    leaseExpirations: boolean;
    marketChanges: boolean;
    retentionAlerts: boolean;
    weeklyDigest: boolean;
  };
}

export class LandlordDataEngine extends UserDataEngine<LandlordData> {
  constructor(userId: string) {
    super(userId, 'landlord');
  }

  getDefaults(): LandlordData {
    return {
      portfolio: {
        totalUnits: 0,
        occupiedUnits: 0,
        propertyIds: [],
      },
      settings: {
        defaultLeaseTermMonths: 12,
        renewalNoticeDays: 60,
        autoAlerts: true,
        alertEmail: '',
      },
      market: {
        targetCity: '',
        targetState: '',
        submarkets: [],
      },
      retentionGoals: {
        targetRetentionRate: 90,
        maxAcceptableVacancyDays: 30,
        renewalIncentiveBudget: 500,
      },
      notifications: {
        leaseExpirations: true,
        marketChanges: true,
        retentionAlerts: true,
        weeklyDigest: false,
      },
    };
  }

  async updatePortfolio(portfolio: Partial<LandlordData['portfolio']>): Promise<LandlordData> {
    const current = this.getData()?.portfolio || this.getDefaults().portfolio;
    return this.save({ portfolio: { ...current, ...portfolio } });
  }

  async updateSettings(settings: Partial<LandlordData['settings']>): Promise<LandlordData> {
    const current = this.getData()?.settings || this.getDefaults().settings;
    return this.save({ settings: { ...current, ...settings } });
  }

  async updateRetentionGoals(goals: Partial<LandlordData['retentionGoals']>): Promise<LandlordData> {
    const current = this.getData()?.retentionGoals || this.getDefaults().retentionGoals;
    return this.save({ retentionGoals: { ...current, ...goals } });
  }

  async addProperty(propertyId: string): Promise<LandlordData> {
    const current = this.getData()?.portfolio.propertyIds || [];
    if (!current.includes(propertyId)) {
      return this.updatePortfolio({
        propertyIds: [...current, propertyId],
        totalUnits: current.length + 1,
      });
    }
    return this.getData() || this.getDefaults();
  }

  async removeProperty(propertyId: string): Promise<LandlordData> {
    const current = this.getData()?.portfolio.propertyIds || [];
    return this.updatePortfolio({
      propertyIds: current.filter(id => id !== propertyId),
      totalUnits: Math.max(0, current.length - 1),
    });
  }
}
