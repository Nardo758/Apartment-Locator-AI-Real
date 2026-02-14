import { UserDataEngine } from './userDataEngine';

export interface AgentData {
  profile: {
    agencyName: string;
    licenseNumber: string;
    specializations: string[];
    serviceAreas: string[];
  };
  clients: {
    activeClientIds: string[];
    totalClients: number;
    averageDealSize: number;
  };
  pipeline: {
    activeDeals: number;
    closedDealsThisMonth: number;
    closedDealsThisYear: number;
    totalRevenue: number;
  };
  settings: {
    autoMatchClients: boolean;
    notifyNewListings: boolean;
    notifyPriceChanges: boolean;
    weeklyReportEmail: string;
  };
  markets: {
    primaryCity: string;
    primaryState: string;
    coveredZipCodes: string[];
  };
}

export class AgentDataEngine extends UserDataEngine<AgentData> {
  constructor(userId: string) {
    super(userId, 'agent');
  }

  getDefaults(): AgentData {
    return {
      profile: {
        agencyName: '',
        licenseNumber: '',
        specializations: [],
        serviceAreas: [],
      },
      clients: {
        activeClientIds: [],
        totalClients: 0,
        averageDealSize: 0,
      },
      pipeline: {
        activeDeals: 0,
        closedDealsThisMonth: 0,
        closedDealsThisYear: 0,
        totalRevenue: 0,
      },
      settings: {
        autoMatchClients: true,
        notifyNewListings: true,
        notifyPriceChanges: true,
        weeklyReportEmail: '',
      },
      markets: {
        primaryCity: '',
        primaryState: '',
        coveredZipCodes: [],
      },
    };
  }

  async updateProfile(profile: Partial<AgentData['profile']>): Promise<AgentData> {
    const current = this.getData()?.profile || this.getDefaults().profile;
    return this.save({ profile: { ...current, ...profile } });
  }

  async updatePipeline(pipeline: Partial<AgentData['pipeline']>): Promise<AgentData> {
    const current = this.getData()?.pipeline || this.getDefaults().pipeline;
    return this.save({ pipeline: { ...current, ...pipeline } });
  }

  async addClient(clientId: string): Promise<AgentData> {
    const current = this.getData()?.clients || this.getDefaults().clients;
    if (!current.activeClientIds.includes(clientId)) {
      return this.save({
        clients: {
          ...current,
          activeClientIds: [...current.activeClientIds, clientId],
          totalClients: current.totalClients + 1,
        },
      });
    }
    return this.getData() || this.getDefaults();
  }

  async removeClient(clientId: string): Promise<AgentData> {
    const current = this.getData()?.clients || this.getDefaults().clients;
    return this.save({
      clients: {
        ...current,
        activeClientIds: current.activeClientIds.filter(id => id !== clientId),
      },
    });
  }

  async updateSettings(settings: Partial<AgentData['settings']>): Promise<AgentData> {
    const current = this.getData()?.settings || this.getDefaults().settings;
    return this.save({ settings: { ...current, ...settings } });
  }
}
